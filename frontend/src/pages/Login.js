import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.login(formData.username, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleQuickLogin = () => {
    // Quick login for development
    setFormData({ username: 'developer', password: 'dev123' });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Workflow System Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary btn-large"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="quick-actions">
          <button 
            type="button" 
            onClick={handleQuickLogin}
            className="btn btn-secondary btn-small"
          >
            Quick Login (Dev)
          </button>
        </div>
        
        <div className="login-info">
          <h4>Development Credentials:</h4>
          <p>Username: <strong>developer</strong></p>
          <p>Password: <strong>dev123</strong></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
