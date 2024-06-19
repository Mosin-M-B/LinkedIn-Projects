const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the cors middleware
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/transactions', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("Error connecting to MongoDB", err);
});

// Define the Transaction model
const Transaction = require('./models/Transaction');

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// Endpoint to initialize the database
app.get('/init', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    await Transaction.insertMany(response.data);
    res.status(200).send('Database initialized with seed data');
  } catch (error) {
    console.error("Error initializing database:", error);
    res.status(500).send('Error initializing database');
  }
});

// Endpoint to fetch transactions with search and pagination
app.get('/transactions', async (req, res) => {
  try {
    const { month, search, page = 1, perPage = 10 } = req.query;
    if (!month) {
      return res.status(400).json({ error: "Month parameter is required" });
    }
    const startDate = new Date(`2022-${month}-01`);
    const endDate = new Date(`2022-${month}-31`);
    const query = {
      dateOfSale: { $gte: startDate, $lte: endDate },
      ...(search && { $or: [{ title: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }, { price: parseFloat(search) }] })
    };
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: 'An error occurred while fetching transactions' });
  }
});

// Endpoint to fetch statistics
app.get('/statistics', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ error: "Month parameter is required" });
    }
    const startDate = new Date(`2022-${month}-01`);
    const endDate = new Date(`2022-${month}-31`);
    const totalSales = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalAmount: { $sum: '$price' }, totalSoldItems: { $sum: { $cond: ['$sold', 1, 0] } }, totalUnsoldItems: { $sum: { $cond: ['$sold', 0, 1] } } } }
    ]);
    res.json(totalSales[0]);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: 'An error occurred while fetching statistics' });
  }
});

// Endpoint to fetch bar chart data
app.get('/bar-chart', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ error: "Month parameter is required" });
    }
    const startDate = new Date(`2022-${month}-01`);
    const endDate = new Date(`2022-${month}-31`);
    const priceRanges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-300', min: 201, max: 300 },
      { range: '301-400', min: 301, max: 400 },
      { range: '401-500', min: 401, max: 500 },
      { range: '501-600', min: 501, max: 600 },
      { range: '601-700', min: 601, max: 700 },
      { range: '701-800', min: 701, max: 800 },
      { range: '801-900', min: 801, max: 900 },
      { range: '901-above', min: 901, max: Infinity }
    ];

    const result = await Promise.all(priceRanges.map(async (range) => {
      const count = await Transaction.countDocuments({
        dateOfSale: { $gte: startDate, $lte: endDate },
        price: { $gte: range.min, $lt: range.max }
      });

      return { range: range.range, count };
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching bar chart data:", error);
    res.status(500).json({ error: 'An error occurred while fetching bar chart data' });
  }
});

// Endpoint to fetch pie chart data
app.get('/pie-chart', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ error: "Month parameter is required" });
    }
    const startDate = new Date(`2022-${month}-01`);
    const endDate = new Date(`2022-${month}-31`);
    const result = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.json(result);
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
    res.status(500).json({ error: 'An error occurred while fetching pie chart data' });
  }
});

// Endpoint to fetch combined data
app.get('/combined-data', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ error: "Month parameter is required" });
    }

    const [transactions, statistics, barChart, pieChart] = await Promise.all([
      axios.get(`http://localhost:3000/transactions?month=${month}`),
      axios.get(`http://localhost:3000/statistics?month=${month}`),
      axios.get(`http://localhost:3000/bar-chart?month=${month}`),
      axios.get(`http://localhost:3000/pie-chart?month=${month}`)
    ]);

    res.json({
      transactions: transactions.data,
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data
    });
  } catch (error) {
    console.error("Error fetching combined data:", error);
    res.status(500).json({ error: 'An error occurred while fetching combined data' });
  }
});
