import { useAppContext } from '../../context/AppContext';
import { marked } from 'marked'; // Se necesita importar 'marked' aquí también

function ManagementTab({ handleReportGeneration, isEnabled }) {
  const { loading, results } = useAppContext();

  // Lógica para limpiar cualquier JSON accidental
  const responseText = results.management || '';
  const jsonBlockIndex = responseText.indexOf('```json');
  const cleanText = jsonBlockIndex !== -1 ? responseText.substring(0, jsonBlockIndex) : responseText;

  return (
    <div>
      <h4>Paso 4: Informe de Fin de Turno para Gerencia</h4>
      <p style={{ color: 'var(--text-muted)' }}>
        La IA puede generar un resumen ejecutivo de alto nivel para la toma de decisiones gerenciales.
      </p>
      <button 
        onClick={() => handleReportGeneration('management')} 
        disabled={!isEnabled || loading === 'management'} 
        className="button-primary"
      >
        {loading === 'management' ? 'Generando...' : 'Generar Informe Gerencial'}
      </button>

      {/* Usamos 'cleanText' y 'marked' para mostrar el resultado */}
      {cleanText && (
        <div 
          className="response-container" 
          dangerouslySetInnerHTML={{ __html: marked(cleanText) }} 
        />
      )}
    </div>
  );
}
export default ManagementTab;