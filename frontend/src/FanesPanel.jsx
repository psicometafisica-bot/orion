import { useState } from 'react';

function FanesPanel() {
  // Estados para guardar los valores de los sliders
  const [oilPrice, setOilPrice] = useState(85);
  const [drillingCost, setDrillingCost] = useState(10);
  const [opEfficiency, setOpEfficiency] = useState(0); // Eficiencia en %

  // Estados para la respuesta de la IA
  const [loading, setLoading] = useState(false);
  const [strategicResult, setStrategicResult] = useState('');

  const handleStrategicAnalysis = async () => {
    setLoading(true);
    setStrategicResult('');

    // Este es el prompt para el análisis estratégico.
    // Damos a la IA el rol de un CFO y le pedimos que calcule el impacto de las variables.
    const fanesPrompt = `
      Eres el Director Financiero (CFO) de Tecpetrol.
      El escenario base para un nuevo pozo en Vaca Muerta proyecta un Retorno de la Inversión (ROR) a 12 meses del 18%, asumiendo un precio del petróleo de $85/barril, un costo de perforación de $10M y una eficiencia operativa base (0%).

      Ahora, debes recalcular el ROR y proveer una recomendación estratégica basada en las siguientes nuevas variables:
      - Nuevo Precio del Petróleo: $${oilPrice}/barril
      - Nuevo Costo de Perforación: $${drillingCost}M
      - Mejora en la Eficiencia Operativa: ${opEfficiency}% (Esta mejora viene de los insights del RTOC)

      Presenta tu respuesta en dos secciones claras usando markdown:

      ### Nuevo ROR Proyectado
      (Muestra el nuevo ROR calculado y una breve explicación del cálculo)

      ### Recomendación Estratégica
      (Basado en el nuevo ROR, provee una recomendación concisa sobre si acelerar, mantener o pausar la inversión en este tipo de pozos)
    `;

    try {
      const res = await fetch('http://127.0.0.1:5000/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fanesPrompt }),
      });
      const data = await res.json();
      setStrategicResult(data.response || `Error: ${data.error}`);
    } catch (error) {
      setStrategicResult('Error: No se pudo conectar con el backend.');
    }

    setLoading(false);
  };

  return (
    <div className="module-container">
      <h2>Panel de Control Estratégico (FANES)</h2>
      <p>Ajusta las variables clave para simular su impacto en la rentabilidad del proyecto.</p>
                  
      <div className="controls-container">
        <div className="slider-group">
          <label>Precio del Petróleo (WTI): ${oilPrice}/barril</label>
          <input
            type="range"
            min="50"
            max="120"
            value={oilPrice}
            onChange={(e) => setOilPrice(e.target.value)}
          />
        </div>
        <div className="slider-group">
          <label>Costo de Perforación: ${drillingCost}M</label>
          <input
            type="range"
            min="7"
            max="15"
            value={drillingCost}
            onChange={(e) => setDrillingCost(e.target.value)}
          />
        </div>
        <div className="slider-group">
          <label>Mejora de Eficiencia Operativa: {opEfficiency}%</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={opEfficiency}
            onChange={(e) => setOpEfficiency(e.target.value)}
          />
        </div>
      </div>

      <button onClick={handleStrategicAnalysis} disabled={loading}>
        {loading ? 'Calculando Impacto...' : 'Calcular Impacto Estratégico'}
      </button>

      {strategicResult && (
        <div className="response-container">
          <h3>Análisis Estratégico de la IA:</h3>
          <div dangerouslySetInnerHTML={{ __html: strategicResult.replace(/\n/g, '<br />') }} />
        </div>
      )}
    </div>
  );
}

export default FanesPanel;