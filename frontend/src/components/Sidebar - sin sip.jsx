import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext'; // 1. Importar

function Sidebar() {
  const { resetReport } = useAppContext(); // 2. Obtener la función de reseteo

  return (
    <aside className="sidebar">
      <h1>ORION-AETHEON</h1>
      <nav>
        <ul>
          <li><NavLink to="/">Dashboard General</NavLink></li>
          <li><NavLink to="/rtoc">Módulo RTOC</NavLink></li>
          <li><NavLink to="/fanes">Panel FANES</NavLink></li>
        </ul>
      </nav>
      
      {/* 3. Añadir el nuevo botón */}
      <div className="sidebar-action">
        <button onClick={resetReport} className="button">
          Nuevo Reporte
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;