import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { marked } from 'marked';
import { Chart } from 'react-google-charts';

// Opciones para los gráficos de viabilidad
const viabilityChartOptions = (title) => ({
  title,
  backgroundColor: 'transparent',
  legend: 'none',
  titleTextStyle: { color: '#e6edf3', fontSize: 16 },
  hAxis: { textStyle: { color: '#8b949e' } },
  vAxis: { textStyle: { color: '#8b949e' }, gridlines: { color: '#30363d' } },
  chartArea: { width: '80%', height: '70%' },
});

function FanesPage() {
  const [activeTab, setActiveTab] = useState('simulation');
  
  // Variables locales que SÓLO afectan a esta página (sliders, popups, estados de carga)
  const [oilPrice, setOilPrice] = useState(85);
  const [drillingCost, setDrillingCost] = useState(10);
  const [opEfficiency, setOpEfficiency] = useState(0);
  const [timeToProd, setTimeToProd] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isViabilityLoading, setIsViabilityLoading] = useState(false);
  
  // --- CORRECCIÓN CLAVE: Usamos el contexto global para los datos que deben persistir ---
  const { 
    simulationOptions, setSimulationOptions, 
    selectedSimulation, setSelectedSimulation, 
    viabilityReport, setViabilityReport, // Obtenemos el estado y su setter DEL CONTEXTO
    fetchAnalysis 
  } = useAppContext();

  const handleSimulate = async () => {
    setIsLoading(true);
    // Limpiamos los datos globales antes de empezar
    setSimulationOptions([]);
    setSelectedSimulation(null);
    setViabilityReport(null); 

    const prompt = `
      Actúa como un Comité de Estrategia de Inversión en Oil & Gas.
      Considera un escenario base con ROR del 18%. Ahora, analiza el impacto de las siguientes variables:
      - Precio del Petróleo: $${oilPrice}/barril
      - Costo de Perforación: $${drillingCost}M
      - Mejora de Eficiencia: ${opEfficiency}%
      - Tiempo a Producción: ${timeToProd} meses

      Basado en esto, propón TRES (3) simulaciones estratégicas opcionales: una Agresiva/Alto Riesgo, una Balanceada/Moderada y una Conservadora/Bajo Riesgo.
      Tu respuesta DEBE ser únicamente un bloque de código JSON con el siguiente formato exacto:
      \`\`\`json
      {
        "simulations": [
          { "title": "TÍTULO_ESTRATEGIA_1", "summary": "RESUMEN_CONCISO_ESTRATEGIA_1" },
          { "title": "TÍTULO_ESTRATEGIA_2", "summary": "RESUMEN_CONCISO_ESTRATEGIA_2" },
          { "title": "TÍTULO_ESTRATEGIA_3", "summary": "RESUMEN_CONCISO_ESTRATEGIA_3" }
        ]
      }
      \`\`\`
    `;

    const response = await fetchAnalysis(prompt);
    try {
      const jsonString = response.substring(response.indexOf('```json') + 7, response.lastIndexOf('```'));
      const parsedData = JSON.parse(jsonString);
      // Guardamos las opciones en el estado global
      setSimulationOptions(parsedData.simulations || []);
    } catch (e) {
      console.error("Error parsing simulation options:", e);
      setSimulationOptions([]);
    }
    setIsLoading(false);
  };

  const handleSelectSimulation = (simulation) => {
    // Guardamos la selección en el estado global
    setSelectedSimulation(simulation);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2500);
  };

  const handleAnalyzeViability = async () => {
    if (!selectedSimulation) return;
    setIsViabilityLoading(true);
    // Limpiamos el reporte global antes de generar el nuevo
    setViabilityReport(null);

    const prompt = `
      Actúa como un Analista de Riesgos Financieros. Realiza un análisis de viabilidad completo para la siguiente estrategia seleccionada:
      Estrategia: "${selectedSimulation.title}"
      Resumen: "${selectedSimulation.summary}"

      Tu respuesta DEBE tener dos partes:
      1. Un informe detallado paso a paso en formato markdown.
      2. Inmediatamente después, un bloque de código JSON con el formato exacto:
      \`\`\`json
      {
        "viability": {
          "success_score": VALOR_NUMERICO_0_A_100,
          "cash_flow": [FLUJO_MES_1, FLUJO_MES_2, FLUJO_MES_3, FLUJO_MES_4, FLUJO_MES_5, FLUJO_MES_6],
          "risk_breakdown": { "mercado": PORCENTAJE, "operacional": PORCENTAJE, "geologico": PORCENTAJE },
          "ror_sensitivity": { "precio_mas_10": NUEVO_ROR, "precio_menos_10": NUEVO_ROR }
        }
      }
      \`\`\`
    `;

    const response = await fetchAnalysis(prompt);
    try {
      const jsonBlockIndex = response.indexOf('```json');
      const textPart = response.substring(0, jsonBlockIndex);
      const jsonString = response.substring(jsonBlockIndex + 7, response.lastIndexOf('```'));
      const parsedData = JSON.parse(jsonString);
      // Guardamos el reporte completo en el estado global
      setViabilityReport({ text: textPart, data: parsedData.viability });
    } catch (e) {
      console.error("Error parsing viability report:", e);
    }
    setIsViabilityLoading(false);
  };

  const TabButton = ({ tabId, title }) => (
    <button className={`tab-button ${activeTab === tabId ? 'active' : ''}`} onClick={() => setActiveTab(tabId)}>
      {title}
    </button>
  );

  return (
    <div>
      {showPopup && <div className="popup-notification">Simulación seleccionada: "{selectedSimulation?.title}"</div>}
      
      <div className="tab-bar">
        <TabButton tabId="simulation" title="1. Simulación Estratégica" />
        <TabButton tabId="viability" title="2. Análisis de Viabilidad" />
      </div>

      <div className="tab-content">
        {/* PESTAÑA 1: SIMULACIÓN */}
        {activeTab === 'simulation' && (
          <div>
            <h4>Panel de Simulación Estratégica FANES</h4>
            
            <div className="module-explanation">
              <p><strong>¿Qué es FANES?</strong> Es una herramienta de simulación estratégica diseñada para el directorio y la alta gerencia.</p>
              <p><strong>¿Qué hace?</strong> Permite modificar en tiempo real las variables clave que afectan al negocio para observar de forma instantánea su impacto directo en los indicadores financieros, como el Retorno de la Inversión (ROR).</p>
              <p><strong>¿Para qué se utiliza?</strong> Su objetivo es transformar la incertidumbre en una ventaja estratégica, permitiendo "ver el futuro" al comparar múltiples escenarios para facilitar la toma de decisiones más rápidas, seguras y rentables.</p>
            </div>
            
            <p style={{ color: 'var(--text-muted)' }}>Ajuste las variables macroeconómicas y operativas para generar escenarios estratégicos.</p> 
            <div className="controls-container">
              <div className="slider-group"><label>Precio del Petróleo: ${oilPrice}/b</label><input type="range" min="50" max="120" value={oilPrice} onChange={(e) => setOilPrice(e.target.value)} /></div>
              <div className="slider-group"><label>Costo de Perforación: ${drillingCost}M</label><input type="range" min="7" max="15" value={drillingCost} onChange={(e) => setDrillingCost(e.target.value)} /></div>
              <div className="slider-group"><label>Mejora de Eficiencia: {opEfficiency}%</label><input type="range" min="0" max="5" step="0.5" value={opEfficiency} onChange={(e) => setOpEfficiency(e.target.value)} /></div>
              <div className="slider-group"><label>Tiempo a Producción: {timeToProd} meses</label><input type="range" min="3" max="12" value={timeToProd} onChange={(e) => setTimeToProd(e.target.value)} /></div>
            </div>
            <button onClick={handleSimulate} disabled={isLoading} className="button-primary">{isLoading ? 'Generando Escenarios...' : 'Calcular Impacto Estratégico'}</button>
            
            {simulationOptions.length > 0 && (
              <div className="simulations-grid">
                {simulationOptions.map((sim, index) => (
                  <div key={index} className="simulation-card">
                    <h5>{sim.title}</h5>
                    <p>{sim.summary}</p>
                    <button onClick={() => handleSelectSimulation(sim)} className="button">Seleccionar Estrategia</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: VIABILIDAD */}
        {activeTab === 'viability' && (
          <div>
            <h4>Análisis de Viabilidad de la Simulación</h4>
            <p style={{ color: 'var(--text-muted)' }}>Obtenga un informe detallado sobre la estrategia seleccionada en el paso anterior.</p>
            {!selectedSimulation ? (
              <div className="notice">Por favor, seleccione una estrategia en la pestaña "Simulación Estratégica" primero.</div>
            ) : (
              <div>
                <div className="selected-sim-info">Estrategia Seleccionada: <strong>{selectedSimulation.title}</strong></div>
                <button onClick={handleAnalyzeViability} disabled={isViabilityLoading} className="button-primary">{isViabilityLoading ? 'Analizando...' : 'Analizar Viabilidad de Selección'}</button>
                
                {viabilityReport && (
                  <div>
                    <div className="score-container">
                      <div className="score-title">Probabilidad de Éxito</div>
                      <div className="score-value">{viabilityReport.data.success_score}<span>%</span></div>
                    </div>
                    <div className="charts-grid">
                      <div className="chart-card"><Chart chartType="LineChart" width="100%" height="250px" data={[['Mes', 'Flujo de Caja (M)'], [1, viabilityReport.data.cash_flow[0]], [2, viabilityReport.data.cash_flow[1]], [3, viabilityReport.data.cash_flow[2]], [4, viabilityReport.data.cash_flow[3]], [5, viabilityReport.data.cash_flow[4]], [6, viabilityReport.data.cash_flow[5]]]} options={viabilityChartOptions('Flujo de Caja Proyectado (6 Meses)')} /></div>
                      <div className="chart-card"><Chart chartType="PieChart" width="100%" height="250px" data={[['Riesgo', 'Porcentaje'], ['Mercado', viabilityReport.data.risk_breakdown.mercado], ['Operacional', viabilityReport.data.risk_breakdown.operacional], ['Geológico', viabilityReport.data.risk_breakdown.geologico]]} options={{...viabilityChartOptions('Distribución de Riesgos'), pieHole: 0.4, colors: ['#dc3545', '#ffc107', '#17a2b8']}} /></div>
                      <div className="chart-card"><Chart chartType="ColumnChart" width="100%" height="250px" data={[['Escenario', 'ROR', { role: 'style' }], ['Precio -10%', viabilityReport.data.ror_sensitivity.precio_menos_10, '#ff7f50'], ['Precio +10%', viabilityReport.data.ror_sensitivity.precio_mas_10, '#90ee90']]} options={viabilityChartOptions('Análisis de Sensibilidad (ROR vs Precio)')} /></div>
                      <div className="chart-card"><Chart chartType="Gauge" width="100%" height="250px" data={[['Label', 'Value'], ['Score', viabilityReport.data.success_score]]} options={{ ...viabilityChartOptions(''), redFrom: 0, redTo: 40, yellowFrom: 40, yellowTo: 70, greenFrom:70, greenTo:100 }} /></div>
                    </div>
                    <div className="response-container" dangerouslySetInnerHTML={{ __html: marked(viabilityReport.text) }} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FanesPage;