import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import KpiCard from '../components/KpiCard';
import { Chart } from 'react-google-charts';

// Opciones para los gráficos del dashboard
const dashboardChartOptions = (title) => ({
  title,
  backgroundColor: 'transparent',
  legend: { textStyle: { color: '#e6edf3' } },
  titleTextStyle: { color: '#e6edf3', fontSize: 16 },
  hAxis: { textStyle: { color: '#8b949e' } },
  vAxis: { textStyle: { color: '#8b949e' }, gridlines: { color: '#30363d' } },
  pieSliceTextStyle: { color: '#161b22' },
});

function DashboardPage() {
  const { results, viabilityReport } = useAppContext(); // Obtenemos los resultados del contexto
  const [kpiData, setKpiData] = useState(null);

  // Procesamos los datos de KPIs cuando estén disponibles
  useEffect(() => {
    if (results.kpi) {
      const jsonBlockIndex = results.kpi.indexOf('```json');
      if (jsonBlockIndex !== -1) {
        try {
          const jsonString = results.kpi.substring(jsonBlockIndex + 7, results.kpi.lastIndexOf('```'));
          const parsedData = JSON.parse(jsonString);
          if (parsedData.kpis) {
            setKpiData(parsedData.kpis);
          }
        } catch (error) { console.error("Error al parsear KPIs para el Dashboard:", error); }
      }
    }
  }, [results.kpi]);

  const Placeholder = ({ moduleName }) => (
    <div className="placeholder-message">
      <p>No hay datos para mostrar.</p>
      <span>Por favor, genere un reporte en el <strong>Módulo {moduleName}</strong> para ver el resumen aquí.</span>
    </div>
  );

  return (
    <div>
      <h2>Dashboard General</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: 0, maxWidth: '800px' }}>
        Esta es la visión consolidada de la inteligencia generada. El dashboard presenta los indicadores operativos clave del RTOC y los resultados estratégicos del panel de simulación FANES.
      </p>

      {/* --- SECCIÓN RTOC --- */}
      <div className="dashboard-section">
        <h3 className="dashboard-section-title">Resumen de Operaciones (RTOC)</h3>
        {kpiData ? (
          <div className="dashboard-grid">
            <div className="kpi-grid-dashboard">
              <KpiCard title="Metros Perforados" value={kpiData.metros_perforados} unit="m" />
              <KpiCard title="ROP Promedio" value={kpiData.rop_promedio} unit="m/h" />
            </div>
            <div className="chart-card">
              <Chart
                chartType="PieChart"
                width="100%"
                height="300px"
                data={[['Estado', 'Horas'], ['Inactivas', kpiData.horas_inactivas], ['Operativas', 24 - kpiData.horas_inactivas]]}
                options={{ ...dashboardChartOptions('Distribución de Tiempo del Turno (hs)'), pieHole: 0.4, colors: ['#dc3545', '#58a6ff'] }}
              />
            </div>
          </div>
        ) : (
          <Placeholder moduleName="RTOC" />
        )}
      </div>

      {/* --- SECCIÓN FANES --- */}
      <div className="dashboard-section">
        <h3 className="dashboard-section-title">Resumen Estratégico (FANES)</h3>
        {viabilityReport ? (
          <div className="dashboard-grid">
            <div className="score-container-dashboard">
              <div className="score-title">Probabilidad de Éxito</div>
              <div className="score-value">{viabilityReport.data.success_score}<span>%</span></div>
            </div>
            <div className="chart-card">
              <Chart
                chartType="LineChart"
                width="100%"
                height="300px"
                data={[['Mes', 'Flujo de Caja (M)'], [1, viabilityReport.data.cash_flow[0]], [2, viabilityReport.data.cash_flow[1]], [3, viabilityReport.data.cash_flow[2]], [4, viabilityReport.data.cash_flow[3]], [5, viabilityReport.data.cash_flow[4]], [6, viabilityReport.data.cash_flow[5]]]}
                options={dashboardChartOptions('Proyección de Flujo de Caja (6 Meses)')}
              />
            </div>
          </div>
        ) : (
          <Placeholder moduleName="FANES" />
        )}
      </div>
    </div>
  );
}

export default DashboardPage;