import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function Sidebar() {
  const { resetReport } = useAppContext(); 

  return (
    <aside className="sidebar">
      <h1>ORION-AETHEON</h1>
      <nav>
        <ul>
          <li><NavLink to="/">Dashboard General</NavLink></li>
          <li><NavLink to="/rtoc">Módulo RTOC</NavLink></li>
          <li><NavLink to="/fanes">Panel FANES</NavLink></li>
          <li><NavLink to="/sip">Módulo SIP</NavLink></li>
        </ul>
      </nav>
      
      <div className="sidebar-action">
        <button onClick={resetReport} className="button">
          Nuevo Reporte
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;