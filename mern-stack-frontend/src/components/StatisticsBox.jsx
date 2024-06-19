/* eslint-disable react/prop-types */
import  { useState, useEffect } from 'react';
import axios from 'axios';

export const StatisticsBox = ({ month }) => {
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/statistics?month=${month}`)
      .then(response => setStatistics(response.data))
      // eslint-disable-next-line no-unused-vars
      .catch(error => setError('Failed to load statistics'))
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <div>
      <h3>Statistics</h3>
      {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
        <div>
          <p>Total Sale Amount: {statistics.totalAmount}</p>
          <p>Total Sold Items: {statistics.totalSoldItems}</p>
          <p>Total Unsold Items: {statistics.totalUnsoldItems}</p>
        </div>
      )}
    </div>
  );
};

export default StatisticsBox;
