import { useAppContext } from '../../context/AppContext';
import { marked } from 'marked'; // 1. Importar la librería

function DiagnosticoTab({ setActiveTab }) {
  const { handleFileChange, fileName, fileContent, loading, runAnalysis, results } = useAppContext();

  const handleInitial = async () => {
    const initialPrompt = `Actúa como el sistema central de inteligencia del RTOC. Realiza un Diagnóstico Operativo General del siguiente reporte. Datos:\n\`\`\`csv\n${fileContent}\n\`\`\`\nPresenta un resumen claro con markdown, usando títulos (###), negritas (**) y listas (*).`;
    await runAnalysis('diagnostico', initialPrompt);
    setActiveTab('diagnostico');
  };

  return (
    <div>
      <h4>Paso 1: Diagnóstico Operativo General</h4>
      <p style={{ color: 'var(--text-muted)' }}>Cargue un archivo (.csv) para iniciar el flujo de análisis.</p>
      <div className="upload-section">
        <input type="file" accept=".csv" onChange={handleFileChange} id="csv-upload" style={{ display: 'none' }} />
        <label htmlFor="csv-upload" className="button">Seleccionar Reporte</label>
        {fileName && <span className="file-name">Archivo: {fileName}</span>}
      </div>
      <button onClick={handleInitial} disabled={loading === 'diagnostico' || !fileContent} className="button-primary">
        {loading === 'diagnostico' ? 'Procesando...' : 'Ejecutar Diagnóstico General'}
      </button>
      
      {/* 2. Usar 'marked' para convertir el texto a HTML */}
      {results.diagnostico && (
        <div className="response-container" dangerouslySetInnerHTML={{ __html: marked(results.diagnostico) }} />
      )}
    </div>
  );
}
export default DiagnosticoTab;