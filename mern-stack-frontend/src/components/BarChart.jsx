/* eslint-disable react/prop-types */
import  { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

export const BarChart = ({ month }) => {
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/bar-chart?month=${month}`)
      .then(response => {
        const labels = response.data.map(item => item.range);
        const counts = response.data.map(item => item.count);

        setData({
          labels,
          datasets: [{
            label: 'Number of Items',
            data: counts,
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
          }]
        });
      })
      // eslint-disable-next-line no-unused-vars
      .catch(error => setError('Failed to load bar chart data'))
      .finally(() => setLoading(false));
  }, [month]);

  return loading ? <p>Loading...</p> : error ? <p>{error}</p> : <Bar data={data} />;
};

export default BarChart;
