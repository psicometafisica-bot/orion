import { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Estados del RTOC
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  
  // --- NUEVOS ESTADOS PARA FANES ---
  const [simulationOptions, setSimulationOptions] = useState([]);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [viabilityReport, setViabilityReport] = useState(null); // Guardará el informe completo

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
  
  const runAnalysis = async (reportType, contextPrompt) => {
    setLoading(reportType);
    const result = await fetchAnalysis(contextPrompt);
    setResults(prev => ({ ...prev, [reportType]: result }));
    setLoading(false);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setResults({});
      const reader = new FileReader();
      reader.onload = (event) => setFileContent(event.target.result);
      reader.readAsText(file);
    }
  };

  const resetReport = () => {
    setFileName('');
    setFileContent('');
    setResults({});
    // Limpiamos también los estados de FANES
    setSimulationOptions([]); 
    setSelectedSimulation(null);
    setViabilityReport(null);
  };

  const value = {
    // RTOC
    fileContent,
    fileName,
    results,
    loading,
    handleFileChange,
    runAnalysis,
    resetReport,
    // FANES
    simulationOptions,
    setSimulationOptions,
    selectedSimulation,
    setSelectedSimulation,
    viabilityReport,
    setViabilityReport, // Exponemos el setter para FANES
    fetchAnalysis 
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}