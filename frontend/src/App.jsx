import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext'; 
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import RtocPage from './pages/RtocPage';
import FanesPage from './pages/FanesPage';
import SipPage from './pages/SipPage'; // <-- 1. Importar la nueva página

function App() {
  return (
    <AppProvider>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/rtoc" element={<RtocPage />} />
            <Route path="/fanes" element={<FanesPage />} />
            <Route path="/sip" element={<SipPage />} /> 
          </Routes>
        </main>
      </div>
    </AppProvider>
  );
}

export default App;