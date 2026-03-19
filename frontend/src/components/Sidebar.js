import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1> Workflow System</h1>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}> 📊 Dashboard</NavLink>
        <NavLink to="/workflows" className={({ isActive }) => isActive ? 'active' : ''}> ⚙️ Workflows</NavLink>
        <NavLink to="/templates" className={({ isActive }) => isActive ? 'active' : ''}> 📋 Templates</NavLink>
        <NavLink to="/executions" className={({ isActive }) => isActive ? 'active' : ''}> 📈 Executions</NavLink>
        <NavLink to="/audit" className={({ isActive }) => isActive ? 'active' : ''}> 📝 Audit Logs</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;