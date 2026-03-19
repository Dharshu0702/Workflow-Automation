import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkflowService from '../services/workflowService';
import ExecutionService from '../services/executionService';
import Navbar from '../components/Navbar';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    totalExecutions: 0,
    recentExecutions: [],
    activeWorkflows: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch workflows
      const workflowsResponse = await WorkflowService.getWorkflows();
      // API returns { workflows: [...] }, so access workflowsResponse.data.workflows
      const workflows = workflowsResponse.data.workflows || workflowsResponse.data || [];
      
      // Fetch executions
      const executionsResponse = await ExecutionService.getExecutions();
      // Handle both array and object responses
      const executions = Array.isArray(executionsResponse.data) ? executionsResponse.data : 
                         (executionsResponse.data ? executionsResponse.data : executionsResponse) || [];

      // Calculate stats
      const activeWorkflows = workflows.filter(w => w.is_active);
      
      // Create workflow map for name lookup
      const workflowMap = {};
      workflows.forEach(workflow => {
        workflowMap[workflow._id] = workflow.name;
      });

      // Enhance recent executions with workflow names
      const recentExecutions = executions.slice(0, 5).reverse().map(execution => ({
        ...execution,
        workflowName: workflowMap[execution.workflow_id] || 'Unknown Workflow'
      }));

      setStats({
        totalWorkflows: workflows.length,
        totalExecutions: executions.length,
        recentExecutions,
        activeWorkflows: activeWorkflows.slice(0, 5),
        loading: false,
        error: null
      });
    } catch (error) {
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#27ae60';
      case 'failed': return '#e74c3c';
      case 'in_progress': return '#f39c12';
      case 'pending': return '#3498db';
      default: return '#95a5a6';
    }
  };

  if (stats.loading) {
    return (
      <>
        <Navbar title="Dashboard" />
        <div className="dashboard-container">
          <div className="loading">Loading dashboard...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="Dashboard" />
      <div className="dashboard-container">
        {stats.error && <div className="error-message">{stats.error}</div>}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.totalWorkflows}</h3>
              <p>Total Workflows</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h3>{stats.totalExecutions}</h3>
              <p>Total Executions</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.activeWorkflows.length}</h3>
              <p>Active Workflows</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <button 
              onClick={() => navigate('/workflows/new')}
              className="action-card"
            >
              <div className="action-icon">➕</div>
              <h3>Create Workflow</h3>
              <p>Design a new workflow from scratch</p>
            </button>
            <button 
              onClick={() => navigate('/templates')}
              className="action-card"
            >
              <div className="action-icon">📋</div>
              <h3>Browse Templates</h3>
              <p>Start with pre-built templates</p>
            </button>
            <button 
              onClick={() => navigate('/executions')}
              className="action-card"
            >
              <div className="action-icon">📈</div>
              <h3>View Executions</h3>
              <p>Monitor workflow executions</p>
            </button>
            <button 
              onClick={() => navigate('/workflows')}
              className="action-card"
            >
              <div className="action-icon">⚙️</div>
              <h3>Manage Workflows</h3>
              <p>Edit and configure workflows</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-grid">
          {/* Recent Executions */}
          <div className="dashboard-section">
            <h2>Recent Executions</h2>
            {stats.recentExecutions.length === 0 ? (
              <div className="empty-state">
                <p>No executions yet. Create and run your first workflow!</p>
              </div>
            ) : (
              <div className="recent-list">
                {stats.recentExecutions.map(execution => (
                  <div key={execution._id} className="recent-item">
                    <div className="recent-info">
                      <h4 style={{ fontWeight: 'normal' }}>Execution #{execution._id.slice(-8)}</h4>
                      <p><strong>Workflow: {execution.workflowName}</strong></p>
                      <small>{formatDate(execution.started_at)}</small>
                    </div>
                    <div className="recent-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(execution.status) }}
                      >
                        {execution.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Workflows */}
          <div className="dashboard-section">
            <h2>Active Workflows</h2>
            {stats.activeWorkflows.length === 0 ? (
              <div className="empty-state">
                <p>No active workflows. Create your first workflow!</p>
              </div>
            ) : (
              <div className="recent-list">
                {stats.activeWorkflows.map(workflow => (
                  <div key={workflow._id} className="recent-item">
                    <div className="recent-info">
                      <h4>{workflow.name}</h4>
                      <p>Version: {workflow.version}</p>
                      <small>Created: {formatDate(workflow.created_at)}</small>
                    </div>
                    <div className="recent-actions">
                      <button 
                        onClick={() => navigate(`/workflows/${workflow._id}`)}
                        className="btn btn-sm btn-info"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => navigate(`/execute/${workflow._id}`)}
                        className="btn btn-sm btn-primary"
                      >
                        Execute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
