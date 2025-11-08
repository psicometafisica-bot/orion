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

// --- NUEVA LISTA DE MATERIALES AÑADIDA ---
const sampleMaterials = [
  "Seleccione un material del catálogo...",
  "Tornillo hexagonal, acero inoxidable 316, 1/2 pulgada UNC, longitud 2 pulgadas",
  "Válvula Esférica 2'' ANSI 300, Acero al Carbono",
  "Acero API 5L X65 (Tubo 10m)",
  "Bomba Centrífuga Mod-XYZ, 10HP",
  "Filtro de Aire Compresor ABC, Modelo P-150",
  "Rodamiento Rígido de Bolas 6205-ZZ",
  "Brida de acero al carbono, ANSI 150, RF, 4 pulgadas",
];

function SipPage() {
  const [materialDescription, setMaterialDescription] = useState('');
  // --- NUEVO ESTADO AÑADIDO ---
  const [selectedMaterial, setSelectedMaterial] = useState(sampleMaterials[0]); 
  const [isLoadingSubstitutes, setIsLoadingSubstitutes] = useState(false);
  const [substitutes, setSubstitutes] = useState([]);
  
  // --- ESTADOS DE ALERTAS DE STOCK (SIN CAMBIOS) ---
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [stockAlertReport, setStockAlertReport] = useState('');
  
  const { fetchAnalysis } = useAppContext();

  const handleSearchSubstitutes = async () => {
    // --- LÓGICA DE BÚSQUEDA ACTUALIZADA ---
    // Prioridad 1: Selección del dropdown (si no es la opción por defecto)
    // Prioridad 2: Texto ingresado en el textarea
    const descriptionToSearch = (selectedMaterial !== sampleMaterials[0])
      ? selectedMaterial
      : materialDescription.trim();

    if (!descriptionToSearch) {
      alert("Por favor, seleccione un material del catálogo o ingrese una descripción técnica.");
      return;
    }
    // ----------------------------------------

    setIsLoadingSubstitutes(true);
    setSubstitutes([]);
    const prompt = `
      Actúa como el "Substitution Engine" de SIP, experto en materiales de Oil & Gas para Tecpetrol.
      Analiza: "${descriptionToSearch}" y sugiere 3 sustitutos viables.
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

  // --- FUNCIÓN DE ALERTAS DE STOCK (SIN CAMBIOS) ---
  const handleGenerateStockAlert = async () => {
    setIsLoadingAlerts(true);
    setStockAlertReport('');

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

    const response = await fetchAnalysis(prompt);
    setStockAlertReport(response); 
    setIsLoadingAlerts(false);
  };

  // --- NUEVA FUNCIÓN AÑADIDA ---
  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedMaterial(selectedValue);
    // Si se selecciona algo del catálogo, limpiamos el textarea
    if (selectedValue !== sampleMaterials[0]) {
      setMaterialDescription('');
    }
  };

  return (
    <div>
      <h2>Módulo SIP (Substitution Intelligence Platform)</h2>
      
      <div className="module-explanation">
        <p><strong>¿Qué es SIP?</strong> Es una plataforma de inteligencia artificial diseñada para optimizar el inventario identificando materiales sustitutos o equivalentes.</p>
        <p><strong>¿Qué hace?</strong> Analiza descripciones técnicas para encontrar alternativas viables, evaluando su compatibilidad y potencial de ahorro.</p>
        <p><strong>¿Para qué se utiliza?</strong> Ayuda a reducir costos, evitar quiebres de stock y mejorar la eficiencia de la cadena de suministro al aprovechar inteligentemente el inventario existente.</p>
      </div>

      {/* --- SECCIÓN DE BÚSQUEDA MODIFICADA --- */}
      <div className="sip-input-section">
        
        <div className="sip-search-option">
          <label htmlFor="materialSelect">Opción 1: Seleccionar material del catálogo</label>
          <select id="materialSelect" value={selectedMaterial} onChange={handleSelectChange}>
            {sampleMaterials.map((material, index) => (
              <option key={index} value={material} disabled={index === 0}>
                {material}
              </option>
            ))}
          </select>
        </div>

<div><p><br></br></p></div>

        <div className="sip-search-option">
          <label htmlFor="materialDesc">Opción 2: Ingresar descripción técnica (si no está en el catálogo)</label>
          <textarea
            id="materialDesc"
            rows="3" // Reducimos la altura
            value={materialDescription}
            onChange={(e) => {
              setMaterialDescription(e.target.value);
              // Si se empieza a escribir, reseteamos el select
              if (e.target.value.trim() !== '') {
                setSelectedMaterial(sampleMaterials[0]);
              }
            }}
            placeholder="Ej: Brida de acero al carbono, ANSI 150, RF, 4 pulgadas..."
            // Deshabilitamos si hay algo seleccionado en el select
            disabled={selectedMaterial !== sampleMaterials[0]}
          />
        </div>

        <button
          onClick={handleSearchSubstitutes}
          // Lógica de deshabilitación actualizada
          disabled={isLoadingSubstitutes || (selectedMaterial === sampleMaterials[0] && !materialDescription.trim())}
          className="button-primary"
        >
          {isLoadingSubstitutes ? 'Buscando Sustitutos...' : 'Buscar Sustitutos Inteligentes'}
        </button>
      </div>
      {/* --- FIN DE SECCIÓN MODIFICADA --- */}

      {substitutes.length > 0 && (
        <div className="sip-results-section">
          <h3>Sustitutos Sugeridos por la IA:</h3>
          <div className="substitutes-grid">
            {substitutes.map((sub, index) => ( <SubstituteCard key={index} substitute={sub} /> ))}
          </div>
        </div>
      )}

      {/* --- SECCIÓN DE ALERTAS DE STOCK (SIN CAMBIOS) --- */}
      <div className="sip-stock-alert-section">
        <h3>Alertas Proactivas de Stock Crítico</h3>
        <p style={{ color: 'var(--text-muted)' }}>La IA analiza datos simulados de inventario para identificar riesgos de quiebre u obsolescencia y sugerir acciones.</p>
        <button onClick={handleGenerateStockAlert} disabled={isLoadingAlerts} className="button-primary">
          {isLoadingAlerts ? 'Analizando Inventario...' : 'Generar Reporte de Stock Crítico'}
        </button>

        {stockAlertReport && (
          <div className="response-container">
            <div className="stock-alert-table-container" dangerouslySetInnerHTML={{ __html: marked(stockAlertReport) }} />
          </div>
        )}
      </div>
      {/* --- FIN DE LA NUEVA SECCIÓN --- */}

    </div>
  );
}

export default SipPage;