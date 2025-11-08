import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart-js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ChartComponent({ chartData, title }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e6edf3', // CORREGIDO: Valor hexadecimal
          font: { size: 14 }
        }
      },
      title: {
        display: true,
        text: title,
        color: '#e6edf3', // CORREGIDO: Valor hexadecimal
        font: { size: 18 }
      },
    },
    scales: {
      y: {
        ticks: { color: '#8b949e' }, // CORREGIDO: Valor hexadecimal
        grid: { color: '#30363d' }
      },
      x: {
        ticks: { color: '#8b949e' }, // CORREGIDO: Valor hexadecimal
        grid: { color: 'rgba(0,0,0,0)' }
      }
    }
  };

  return (
    <div style={{ position: 'relative', height: '350px', width: '100%' }}>
      <Bar options={options} data={chartData} />
    </div>
  );
}

export default ChartComponent;