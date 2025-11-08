import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { marked } from 'marked';
import { Chart } from 'react-google-charts';


// --- AJUSTE CLAVE: Opciones específicas para Google Charts ---
const googleChartOptions = (title) => ({
  title,
  backgroundColor: 'transparent',
  legend: 'none',
  titleTextStyle: { color: '#e6edf3', fontSize: 16 }, // Texto claro
  hAxis: { textStyle: { color: '#8b949e' } }, // Texto claro
  vAxis: { textStyle: { color: '#8b949e' }, gridlines: { color: '#30363d' } }, // Texto claro
  chartArea: { width: '80%', height: '70%' },
  // Opciones específicas para PieChart
  pieSliceTextStyle: { color: '#161b22' }, // Texto dentro del gráfico
  legendTextStyle: { color: '#e6edf3' } // Texto de la leyenda
});


function KpiTab({ handleReportGeneration, isEnabled }) {
  const { loading, results } = useAppContext();
  const [kpiData, setKpiData] = useState(null);
  const [textResponse, setTextResponse] = useState('');

  useEffect(() => {
    if (results.kpi) {
      const jsonBlockIndex = results.kpi.indexOf('```json');
      const cleanText = jsonBlockIndex !== -1 ? results.kpi.substring(0, jsonBlockIndex) : results.kpi;
      setTextResponse(cleanText);

      try {
        if (jsonBlockIndex !== -1) {
          const jsonString = results.kpi.substring(jsonBlockIndex + 7, results.kpi.lastIndexOf('```'));
          const parsedData = JSON.parse(jsonString);
          if (parsedData.kpis) {
            setKpiData(parsedData.kpis);
          }
        } else { setKpiData(null); }
      } catch (error) { console.error("Error al parsear JSON:", error); setKpiData(null); }
    }
  }, [results.kpi]);

  return (
    <div>
      <h4>Paso 2: Extracción de KPIs del Turno</h4>
      <p style={{ color: 'var(--text-muted)' }}>La IA extraerá y visualizará los Indicadores Clave de Rendimiento del reporte.</p>
      
      <button onClick={() => handleReportGeneration('kpi')} disabled={!isEnabled || loading === 'kpi'} className="button-primary">
        {loading === 'kpi' ? 'Generando...' : 'Generar Reporte de KPIs'}
      </button>

      {kpiData && (
        <div className="charts-grid">
          <div className="chart-card">
            <Chart
              chartType="BarChart"
              width="100%"
              height="250px"
              data={[['Métrica', 'Valor'], ['Metros', kpiData.metros_perforados]]}
              options={{ ...googleChartOptions('Metros Perforados (m)'), colors: ['#f77829'] }}
            />
          </div>
          
          <div className="chart-card">
            <Chart
              chartType="Gauge"
              width="100%"
              height="250px"
              data={[['Label', 'Value'], ['ROP (m/h)', kpiData.rop_promedio]]}
              options={{
                redFrom: 20, redTo: 25,
                yellowFrom: 15, yellowTo: 20,
                greenFrom: 0, greenTo: 15,
                minorTicks: 5,
                // Le pasamos los estilos de texto aquí también
                chartArea: { width: '80%', height: '70%' },
                titleTextStyle: { color: '#e6edf3', fontSize: 16 },
              }}
            />
          </div>

          <div className="chart-card">
            <Chart
              chartType="PieChart"
              width="100%"
              height="250px"
              data={[['Estado', 'Horas'], ['Inactivas', kpiData.horas_inactivas], ['Operativas', 24 - kpiData.horas_inactivas]]}
              options={{ ...googleChartOptions('Distribución de Tiempo (hs)'), pieHole: 0.4, colors: ['#dc3545', '#58a6ff'] }}
            />
          </div>

          <div className="chart-card">
             <Chart
              chartType="BarChart"
              width="100%"
              height="250px"
              data={[['Métrica', 'Producción'], ['', kpiData.produccion_total]]}
              options={{ ...googleChartOptions('Producción Total (bpd)'), colors: ['#28a745'], hAxis: { minValue: 0 } }}
            />
          </div>
        </div>
      )}

      {textResponse && (
        <div className="response-container">
          <div className="kpi-table-container" dangerouslySetInnerHTML={{ __html: marked(textResponse) }} />
        </div>
      )}
      {/* --------------------------- */}
    </div>
  );
}
export default KpiTab;