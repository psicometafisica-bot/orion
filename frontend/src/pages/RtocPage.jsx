import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import DiagnosticoTab from './rtoc-tabs/DiagnosticoTab';
import KpiTab from './rtoc-tabs/KpiTab';
import PredictivoTab from './rtoc-tabs/PredictivoTab';
import ManagementTab from './rtoc-tabs/ManagementTab';
import OptimizationTab from './rtoc-tabs/OptimizationTab';

function RtocPage() {
  const [activeTab, setActiveTab] = useState('diagnostico');
  const { results, runAnalysis, fileContent } = useAppContext();

  const handleReportGeneration = async (reportType) => {
    let reportPrompt = '';
    // Restauramos el context original, que es más robusto
    const context = `Basado en el siguiente reporte de operaciones: \`\`\`csv\n${fileContent}\n\`\`\` y el diagnóstico general previo: \`\`\`\n${results.diagnostico}\n\`\`\``;
    
    switch (reportType) {
      case 'kpi':
        reportPrompt = `
          ${context}
          Tu tarea es analizar los datos y rellenar la siguiente tabla markdown con los valores calculados. La tabla DEBE tener exactamente estas 5 columnas: KPI, Valor, Unidad, Pozo y Periodo.

          Aquí está la plantilla que debes completar:
          | KPI | Valor | Unidad | Pozo | Periodo |
          |---|---|---|---|---|
          | Metros Perforados | [VALOR] | m | [POZO] | [PERIODO] |
          | ROP Promedio | [VALOR] | m/h | [POZO] | [PERIODO] |
          | Horas Inactivas | [VALOR] | h | [POZO] | [PERIODO] |
          | Producción Total | [VALOR] | bpd | [POZO] | [PERIODO] |

          Inmediatamente después de la tabla completa, sin ningún texto introductorio, DEBES incluir el bloque de código JSON con los valores numéricos correspondientes.
          \`\`\`json
          {
            "kpis": {
              "metros_perforados": VALOR_NUMERICO,
              "rop_promedio": VALOR_NUMERICO,
              "horas_inactivas": VALOR_NUMERICO,
              "produccion_total": VALOR_NUMERICO
            }
          }
          \`\`\`
        `;
        break;
      case 'predictive':
        reportPrompt = `
          ${context}
          Actúa como Ingeniero de Confiabilidad. Realiza un **Análisis Predictivo de Fallas** sobre el motor de fondo del pozo TP-456V.
          Tu respuesta DEBE tener dos partes:
          1. Un análisis en texto con markdown explicando los patrones detectados y la recomendación.
          2. Un bloque de código JSON con el formato exacto: \`\`\`json{"predictive":{"failure_probability": VALOR_NUMERICO_ENTRE_0_Y_100}}\`\`\`
        `;
        break;
      
      // --- BLOQUE FALTANTE AÑADIDO ---
      case 'management':
        reportPrompt = `${context} Actúa como Jefe de Operaciones. Escribe un **Informe de Fin de Turno para Gerencia**. Debe ser un resumen ejecutivo conciso (máximo 4 párrafos) destacando logros, problemas y próximos pasos.`;
        break;
      // ---------------------------------
        
      case 'optimization':
        reportPrompt = `
          ${context}
          Actúa como Ingeniero de Optimización. Proporciona una **Recomendación de Optimización de Parámetros** para el pozo TP-456V.
          Tu respuesta DEBE tener dos partes:
          1. Un texto con markdown justificando tu recomendación.
          2. Un bloque de código JSON con el formato exacto: \`\`\`json{"optimization":{"WOB_change_percent": VALOR_NUMERICO, "RPM_change_absolute": VALOR_NUMERICO}}\`\`\`
        `;
        break;
    }
    await runAnalysis(reportType, reportPrompt);
    setActiveTab(reportType);
  };

  const TabButton = ({ tabId, title }) => (
    <button className={`tab-button ${activeTab === tabId ? 'active' : ''}`} onClick={() => setActiveTab(tabId)}>
      {title}
    </button>
  );

  return (
    <div>
      <div className="tab-bar">
        <TabButton tabId="diagnostico" title="1. Diagnóstico General" />
        <TabButton tabId="kpi" title="2. KPIs de Turno" />
        <TabButton tabId="predictive" title="3. Análisis Predictivo" />
        <TabButton tabId="management" title="4. Informe Gerencial" />
        <TabButton tabId="optimization" title="5. Optimización" />
      </div>

      <div className="tab-content">
        {activeTab === 'diagnostico' && <DiagnosticoTab setActiveTab={setActiveTab}/>}
        {activeTab === 'kpi' && <KpiTab handleReportGeneration={handleReportGeneration} isEnabled={!!results.diagnostico}/>}
        {activeTab === 'predictive' && <PredictivoTab handleReportGeneration={handleReportGeneration} isEnabled={!!results.kpi} />}
        {activeTab === 'management' && <ManagementTab handleReportGeneration={handleReportGeneration} isEnabled={!!results.predictive} />}
        {activeTab === 'optimization' && <OptimizationTab handleReportGeneration={handleReportGeneration} isEnabled={!!results.management} />}
      </div>
    </div>
  );
}
export default RtocPage;