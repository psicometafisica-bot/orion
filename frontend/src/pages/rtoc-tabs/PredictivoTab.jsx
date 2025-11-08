import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { marked } from 'marked';
import { Chart } from 'react-google-charts'; // Importamos el componente de gráficos

function PredictivoTab({ handleReportGeneration, isEnabled }) {
  const { loading, results } = useAppContext();
  const [riskData, setRiskData] = useState(null);
  const [textResponse, setTextResponse] = useState('');

  useEffect(() => {
    if (results.predictive) {
      const jsonBlockIndex = results.predictive.indexOf('```json');
      const cleanText = jsonBlockIndex !== -1 ? results.predictive.substring(0, jsonBlockIndex) : results.predictive;
      setTextResponse(cleanText);

      if (jsonBlockIndex !== -1) {
        try {
          const jsonString = results.predictive.substring(jsonBlockIndex + 7, results.predictive.lastIndexOf('```'));
          const parsedData = JSON.parse(jsonString);
          if (parsedData.predictive && parsedData.predictive.failure_probability !== undefined) {
            setRiskData(parsedData.predictive.failure_probability);
          }
        } catch (e) { console.error("Error parsing predictive JSON", e); }
      }
    }
  }, [results.predictive]);

  return (
    <div>
      <h4>Paso 3: Análisis Predictivo de Fallas</h4>
      <p style={{ color: 'var(--text-muted)' }}>La IA puede identificar patrones para predecir posibles fallas en el equipamiento.</p>
      <button onClick={() => handleReportGeneration('predictive')} disabled={!isEnabled || loading === 'predictive'} className="button-primary">
        {loading === 'predictive' ? 'Generando...' : 'Generar Análisis Predictivo'}
      </button>

      {riskData !== null && (
        <div className="chart-container" style={{ backgroundColor: 'var(--surface-blue)', border: '1px solid var(--border-blue)'}}>
          <Chart
            width={'100%'}
            height={'240px'}
            chartType="Gauge"
            loader={<div>Cargando Medidor...</div>}
            data={[
              ['Label', 'Value'],
              ['Riesgo de Falla', Number(riskData)],
            ]}
            options={{
              redFrom: 90, redTo: 100,
              yellowFrom: 75, yellowTo: 90,
              minorTicks: 5,
              animation: { easing: 'inAndOut', duration: 500 }
            }}
          />
        </div>
      )}

      {textResponse && (
        <div className="response-container" dangerouslySetInnerHTML={{ __html: marked(textResponse) }} />
      )}
    </div>
  );
}
export default PredictivoTab;
