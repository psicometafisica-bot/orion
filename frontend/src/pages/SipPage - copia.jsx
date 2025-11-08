import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { marked } from 'marked';

// Componente para mostrar cada sustituto sugerido (sin cambios)
const SubstituteCard = ({ substitute }) => (
  <div className="substitute-card">
    <h5>Sustituto Sugerido:</h5>
    <p><strong>Descripción:</strong> {substitute.description}</p>
    <div className="analysis-section">
      <h6>Análisis de Compatibilidad:</h6>
      <div dangerouslySetInnerHTML={{ __html: marked(substitute.analysis || '') }} />
    </div>
    <div className="confidence-score">
      Confianza IA: <span>{substitute.confidence}%</span>
    </div>
  </div>
);

function SipPage() {
  const [materialDescription, setMaterialDescription] = useState('');
  const [isLoadingSubstitutes, setIsLoadingSubstitutes] = useState(false);
  const [substitutes, setSubstitutes] = useState([]);
  
  // --- NUEVOS ESTADOS para Alertas de Stock ---
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [stockAlertReport, setStockAlertReport] = useState('');
  
  const { fetchAnalysis } = useAppContext();

  const handleSearchSubstitutes = async () => {
    if (!materialDescription.trim()) return;
    setIsLoadingSubstitutes(true);
    setSubstitutes([]);
    const prompt = `
      Actúa como el "Substitution Engine" de SIP, experto en materiales de Oil & Gas para Tecpetrol.
      Analiza: "${materialDescription}" y sugiere 3 sustitutos viables.
      Tu respuesta DEBE ser únicamente un bloque JSON:
      \`\`\`json
      {
        "substitutes": [
          { "description": "DESC_SUST_1", "analysis": "ANÁLISIS_COMPAT_1 (markdown)", "confidence": PUNTAJE_NUMERICO_0_100 },
          { "description": "DESC_SUST_2", "analysis": "ANÁLISIS_COMPAT_2 (markdown)", "confidence": PUNTAJE_NUMERICO_0_100 },
          { "description": "DESC_SUST_3", "analysis": "ANÁLISIS_COMPAT_3 (markdown)", "confidence": PUNTAJE_NUMERICO_0_100 }
        ]
      }
      \`\`\`
    `;
    const response = await fetchAnalysis(prompt);
    try {
      const jsonStringMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonStringMatch && jsonStringMatch[1]) {
        const parsedData = JSON.parse(jsonStringMatch[1]);
        setSubstitutes(parsedData.substitutes || []);
      } else {
        const parsedData = JSON.parse(response);
        setSubstitutes(parsedData.substitutes || []);
      }
    } catch (e) { console.error("Error parsing SIP substitutes:", e); setSubstitutes([]); }
    setIsLoadingSubstitutes(false);
  };

// --- NUEVA FUNCIÓN para generar el reporte de alertas ---
  const handleGenerateStockAlert = async () => {
    setIsLoadingAlerts(true);
    setStockAlertReport('');

    // --- PROMPT CORREGIDO CON PLANTILLA ---
    const prompt = `
      Actúa como un Analista de Inventario experto para Tecpetrol.
      Analiza la siguiente muestra de datos de inventario simulados:
      Material, Stock Actual, Rotación (unid/mes), Tiempo Depósito (meses)
      "Válvula Esférica 2'' ANSI 300", 15, 50, 3
      "Acero API 5L X65 (Tubo 10m)", 5, 8, 24
      "Bomba Centrífuga Mod-XYZ", 8, 12, 6
      "Filtro de Aire Compresor ABC", 150, 20, 48
      "Rodamiento 6205-ZZ", 200, 300, 2

      Tu tarea es rellenar la siguiente tabla markdown con los valores calculados para los 2 materiales con mayor riesgo de quiebre y los 2 con mayor riesgo de obsolescencia.
      La tabla DEBE tener exactamente estas 6 columnas y este formato. No añadas ningún texto antes o después.

      | Material                      | Stock Actual | Rotación (u/mes) | Días Rest. / T. Dep. | Alerta        | Sustituto Sugerido (Tipo) |
      |-------------------------------|--------------|------------------|----------------------|---------------|---------------------------|
      | [MATERIAL_QUIEBRE_1]          | [VALOR]      | [VALOR]          | [DÍAS_RESTANTES] días | **Quiebre** | [TIPO_SUSTITUTO]          |
      | [MATERIAL_QUIEBRE_2]          | [VALOR]      | [VALOR]          | [DÍAS_RESTANTES] días | **Quiebre** | [TIPO_SUSTITUTO]          |
      | [MATERIAL_OBSOLESCENCIA_1]    | [VALOR]      | [VALOR]          | [TIEMPO_DEPOSITO] meses| Obsolescencia | N/A                       |
      | [MATERIAL_OBSOLESCENCIA_2]    | [VALOR]      | [VALOR]          | [TIEMPO_DEPOSITO] meses| Obsolescencia | N/A                       |

    `;
    // --- FIN DEL PROMPT CORREGIDO ---

    const response = await fetchAnalysis(prompt);
    setStockAlertReport(response); 
    setIsLoadingAlerts(false);
  };

  return (
    <div>
      <h2>Módulo SIP (Substitution Intelligence Platform)</h2>
      
      <div className="module-explanation">
         {/* ... (Explicación de SIP sin cambios) ... */}
         <p><strong>¿Qué es SIP?</strong> Es una plataforma de inteligencia artificial diseñada para optimizar el inventario identificando materiales sustitutos o equivalentes.</p>
         <p><strong>¿Qué hace?</strong> Analiza descripciones técnicas para encontrar alternativas viables, evaluando su compatibilidad y potencial de ahorro.</p>
         <p><strong>¿Para qué se utiliza?</strong> Ayuda a reducir costos, evitar quiebres de stock y mejorar la eficiencia de la cadena de suministro al aprovechar inteligentemente el inventario existente.</p>
      </div>

      {/* --- Sección de Búsqueda de Sustitutos (sin cambios funcionales) --- */}
      <div className="sip-input-section">
        <label htmlFor="materialDesc">Ingrese la descripción técnica del material a sustituir:</label>
        <textarea id="materialDesc" rows="4" value={materialDescription} onChange={(e) => setMaterialDescription(e.target.value)} placeholder="Ej: Brida de acero al carbono, ANSI 150, RF, 4 pulgadas..."/>
        <button onClick={handleSearchSubstitutes} disabled={isLoadingSubstitutes} className="button-primary">
          {isLoadingSubstitutes ? 'Buscando Sustitutos...' : 'Buscar Sustitutos Inteligentes'}
        </button>
      </div>

      {substitutes.length > 0 && (
        <div className="sip-results-section">
          <h3>Sustitutos Sugeridos por la IA:</h3>
          <div className="substitutes-grid">
            {substitutes.map((sub, index) => ( <SubstituteCard key={index} substitute={sub} /> ))}
          </div>
        </div>
      )}

      {/* --- NUEVA SECCIÓN: Alertas de Stock Crítico --- */}
      <div className="sip-stock-alert-section">
        <h3>Alertas Proactivas de Stock Crítico</h3>
        <p style={{ color: 'var(--text-muted)' }}>La IA analiza datos simulados de inventario para identificar riesgos de quiebre u obsolescencia y sugerir acciones.</p>
        <button onClick={handleGenerateStockAlert} disabled={isLoadingAlerts} className="button-primary">
          {isLoadingAlerts ? 'Analizando Inventario...' : 'Generar Reporte de Stock Crítico'}
        </button>

{stockAlertReport && (
          // --- AJUSTE AQUÍ: Usamos un div contenedor con una CLASE ESPECÍFICA ---
          <div className="response-container"> {/* Mantenemos el contenedor general */}
            <div className="stock-alert-table-container" dangerouslySetInnerHTML={{ __html: marked(stockAlertReport) }} />
          </div>
          // -----------------------------------------------------------------------
        )}
      </div>
      {/* --- FIN DE LA NUEVA SECCIÓN --- */}

    </div>
  );
}

export default SipPage;