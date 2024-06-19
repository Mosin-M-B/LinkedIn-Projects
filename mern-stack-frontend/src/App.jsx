import  { useState } from 'react';
import TransactionsTable from './components/TransactionsTable';
import StatisticsBox from './components/StatisticsBox';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';

const App = () => {
  const [month, setMonth] = useState('03'); // March by default

  return (
    <div>
      <h1>Transaction Dashboard</h1>
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
          <option key={m} value={m}>{new Date(2022, m - 1).toLocaleString('default', { month: 'long' })}</option>
        ))}
      </select>

      <TransactionsTable month={month} />
      <StatisticsBox month={month} />
      <BarChart month={month} />
      <PieChart month={month} />
    </div>
  );
};

export default App;
