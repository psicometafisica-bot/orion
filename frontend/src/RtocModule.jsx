import { useState } from 'react';

// Componente para los botones de análisis, lo reutilizamos.
const ReportButton = ({ onClick, loading, title }) => (
  <button onClick={onClick} disabled={loading} className="deeper-analysis-button">
    {loading ? 'Generando...' : title}
  </button>
);

function RtocModule() {
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(null); 
  const [mainAnalysis, setMainAnalysis] = useState(''); 
  const [subReport, setSubReport] = useState(''); 
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setMainAnalysis('');
      setSubReport('');
      const reader = new FileReader();
      reader.onload = (event) => setFileContent(event.target.result);
      reader.readAsText(file);
    }
  };

  const handleInitialAnalysis = async () => {
    if (!fileContent) { return; }
    setLoading(true);
    setMainAnalysis('');
    setSubReport('');

    const initialPrompt = `
      Actúa como el sistema central de inteligencia del RTOC. Realiza un Diagnóstico Operativo General del siguiente reporte de 24 horas.
      Datos:
      \`\`\`csv
      ${fileContent}
      \`\`\`
      Presenta un resumen claro de los eventos más importantes, identificando anomalías, paradas de equipo y cambios significativos en los parámetros.
    `;
    const result = await fetchAnalysis(initialPrompt);
    setMainAnalysis(result);
    setLoading(false);
  };

  const fetchAnalysis = async (prompt) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      return data.response || `Error: ${data.error}`;
    } catch (error) {
      return 'Error: No se pudo conectar con el backend.';
    }
  };
  
  const handleReportGeneration = async (reportType) => {
    setReportLoading(reportType);
    setSubReport('');

    let reportPrompt = '';
    const context = `Basado en el siguiente reporte de operaciones: \`\`\`csv\n${fileContent}\n\`\`\``;

    switch (reportType) {
      case 'kpi':
        reportPrompt = `${context} Extrae los Indicadores Clave de Rendimiento (KPIs) del turno. Calcula y presenta en una tabla markdown: Metros Perforados Totales, ROP Promedio (m/h), Horas Totales Inactivas y Producción Total de Petróleo (bpd).`;
        break;
      case 'predictive':
        reportPrompt = `${context} Actúa como un Ingeniero de Confiabilidad. Analiza los patrones en los datos de perforación del pozo TP-456V (torque, ROP, comentarios de vibración). Emite un **Análisis Predictivo de Fallas** sobre el motor de fondo (downhole motor). Estima una probabilidad de falla en las próximas 24-48 horas y recomienda una acción preventiva.`;
        break;
      case 'management':
        reportPrompt = `${context} Actúa como Jefe de Operaciones. Escribe un **Informe de Fin de Turno para Gerencia**. Debe ser un resumen ejecutivo conciso (máximo 4 párrafos) destacando los logros, problemas y los próximos pasos para el siguiente turno.`;
        break;
      // --- NUEVO REPORTE ---
      case 'optimization':
        reportPrompt = `${context} Actúa como un Ingeniero de Optimización de Perforación. Tu objetivo es maximizar la Tasa de Penetración (ROP) de forma segura. Analiza la última secuencia de datos de perforación del pozo TP-456V, notando el aumento de torque y la disminución de ROP. Proporciona una **Recomendación de Optimización de Parámetros** clara y accionable. Sugiere ajustes específicos (ej. disminuir WOB en un 5%, aumentar RPM en 10 RPM) y justifica tu recomendación técnicamente.`;
        break;
      default:
        break;
    }
    
    const result = await fetchAnalysis(reportPrompt);
    setSubReport(result);
    setReportLoading(null);
  };

  return (
    <div className="module-container">
      <h2>Módulo de Inteligencia del RTOC</h2>
      
      <div className="upload-section">
        <input type="file" accept=".csv" onChange={handleFileChange} id="csv-upload" style={{ display: 'none' }} />
        <label htmlFor="csv-upload" className="upload-button">Seleccionar Reporte (.csv)</label>
        {fileName && <span className="file-name">Archivo: {fileName}</span>}
      </div>

      <button onClick={handleInitialAnalysis} disabled={loading || !fileContent} style={{marginBottom: '20px'}}>
        {loading ? 'Procesando...' : '1. Realizar Diagnóstico General'}
      </button>
      
      {mainAnalysis && (
        <div className="response-container" style={{borderTop: '2px solid #444'}}>
          <h3>Diagnóstico Operativo General:</h3>
          <div dangerouslySetInnerHTML={{ __html: mainAnalysis.replace(/\n/g, '<br />') }} />
        </div>
      )}

      {mainAnalysis && (
        <div className="deeper-analysis-section">
          <p>Diagnóstico completo. Seleccione un reporte especializado:</p>
          <div className="button-group">
            <ReportButton onClick={() => handleReportGeneration('kpi')} loading={reportLoading === 'kpi'} title="KPIs del Turno" />
            <ReportButton onClick={() => handleReportGeneration('predictive')} loading={reportLoading === 'predictive'} title="Análisis Predictivo de Fallas" />
            <ReportButton onClick={() => handleReportGeneration('management')} loading={reportLoading === 'management'} title="Informe para Gerencia" />
            {/* --- NUEVO BOTÓN --- */}
            <ReportButton onClick={() => handleReportGeneration('optimization')} loading={reportLoading === 'optimization'} title="Optimizar Parámetros" />
          </div>
        </div>
      )}

      {subReport && (
        <div className="response-container">
          <h3>Reporte Especializado:</h3>
          <div dangerouslySetInnerHTML={{ __html: subReport.replace(/\n/g, '<br />') }} />
        </div>
      )}
    </div>
  );
}

export default RtocModule;