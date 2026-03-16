import React from 'react';
import './Navbar.css';

const Navbar = ({ title }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h2>{title}</h2>
        <div className="navbar-actions">
          <span className="status-indicator"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;