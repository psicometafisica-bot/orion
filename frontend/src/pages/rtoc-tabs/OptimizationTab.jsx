import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { marked } from 'marked';

// Un nuevo componente para las tarjetas de recomendación
const RecommendationCard = ({ parameter, value, unit }) => {
  const isPositive = value > 0;
  const color = isPositive ? 'var(--accent-green)' : 'var(--accent-red)';
  const arrow = isPositive ? '▲' : '▼';

  return (
    <div className="kpi-card">
      <span className="kpi-title">{parameter}</span>
      <div>
        <span className="kpi-value" style={{ color }}>{arrow} {Math.abs(value)}</span>
        <span className="kpi-unit">{unit}</span>
      </div>
    </div>
  );
};

function OptimizationTab({ handleReportGeneration, isEnabled }) {
  const { loading, results } = useAppContext();
  const [optimizations, setOptimizations] = useState(null);
  const [textResponse, setTextResponse] = useState('');

  useEffect(() => {
    if (results.optimization) {
      const jsonBlockIndex = results.optimization.indexOf('```json');
      const cleanText = jsonBlockIndex !== -1 ? results.optimization.substring(0, jsonBlockIndex) : results.optimization;
      setTextResponse(cleanText);

      if (jsonBlockIndex !== -1) {
        try {
          const jsonString = results.optimization.substring(jsonBlockIndex + 7, results.optimization.lastIndexOf('```'));
          const parsedData = JSON.parse(jsonString);
          if (parsedData.optimization) {
            setOptimizations(parsedData.optimization);
          }
        } catch (e) { console.error("Error parsing optimization JSON", e); }
      }
    }
  }, [results.optimization]);

  return (
    <div>
      <h4>Paso 5: Optimización de Parámetros de Perforación</h4>
      <p style={{ color: 'var(--text-muted)' }}>La IA actúa como un co-piloto, recomendando ajustes a los parámetros para maximizar la eficiencia.</p>
      <button onClick={() => handleReportGeneration('optimization')} disabled={!isEnabled || loading === 'optimization'} className="button-primary">
        {loading === 'optimization' ? 'Generando...' : 'Generar Recomendación'}
      </button>

      {optimizations && (
        <div className="kpi-grid">
          <RecommendationCard parameter="Ajuste de Peso (WOB)" value={optimizations.WOB_change_percent} unit="%" />
          <RecommendationCard parameter="Ajuste de Rotación (RPM)" value={optimizations.RPM_change_absolute} unit="RPM" />
        </div>
      )}

      {textResponse && (
        <div className="response-container" dangerouslySetInnerHTML={{ __html: marked(textResponse) }} />
      )}
    </div>
  );
}
export default OptimizationTab;