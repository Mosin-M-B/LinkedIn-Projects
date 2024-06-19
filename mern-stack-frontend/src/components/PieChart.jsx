/* eslint-disable react/prop-types */
import  { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';

export const PieChart = ({ month }) => {
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/pie-chart?month=${month}`)
      .then(response => {
        const labels = response.data.map(item => item._id);
        const counts = response.data.map(item => item.count);
        console.log(response.data);
        setData({
          labels,
          datasets: [{
            label: 'Number of Items',
            data: counts,
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)']
          }]
        });
      })
      // eslint-disable-next-line no-unused-vars
      .catch(error => setError('Failed to load pie chart data'))
      .finally(() => setLoading(false));
  }, [month]);

  return loading ? <p>Loading...</p> : error ? <p>{error}</p> : <Pie data={data} />;
};

export default PieChart;
