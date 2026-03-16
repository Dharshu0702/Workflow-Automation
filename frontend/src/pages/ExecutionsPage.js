import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExecutionService from '../services/executionService';
import WorkflowService from '../services/workflowService';
import Navbar from '../components/Navbar';
import './ExecutionsPage.css';

const ExecutionsPage = () => {
  const navigate = useNavigate();
  const [executions, setExecutions] = useState([]);
  const [workflows, setWorkflows] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', workflow: 'all' });

  useEffect(() => {
    fetchExecutions();
    fetchWorkflows();
  }, []);

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const response = await ExecutionService.getExecutions();
      setExecutions(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch executions');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const response = await WorkflowService.getWorkflows();
      const workflowMap = {};
      response.data.forEach(workflow => {
        // Only include active workflows (not soft deleted)
        if (!workflow.deleted_at) {
          workflowMap[workflow._id] = workflow;
        }
      });
      setWorkflows(workflowMap);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    }
  };

  const calculateDuration = (startedAt, endedAt) => {
    if (!startedAt) return 'N/A';
    
    const start = new Date(startedAt);
    const end = endedAt ? new Date(endedAt) : new Date();
    const duration = end - start;
    
    if (duration < 0) return 'N/A';
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'failed': return '#dc3545';
      case 'in_progress': return '#ffc107';
      case 'pending': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const filteredExecutions = executions.filter(execution => {
    const statusMatch = filter.status === 'all' || execution.status === filter.status;
    const workflowMatch = filter.workflow === 'all' || execution.workflow_id === filter.workflow;
    return statusMatch && workflowMatch;
  });

  if (loading) return <div><Navbar title="Loading..." /></div>;

  return (
    <>
      <Navbar title="Executions" />
      <div className="executions-container">
        {error && <div className="error-message">{error}</div>}

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filter.status} 
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Workflow:</label>
            <select 
              value={filter.workflow} 
              onChange={(e) => setFilter(prev => ({ ...prev, workflow: e.target.value }))}
            >
              <option value="all">All Workflows</option>
              {Object.values(workflows).map(workflow => (
                <option key={workflow._id} value={workflow._id}>
                  {workflow.name}
                </option>
              ))}
            </select>
          </div>
          <button onClick={fetchExecutions} className="btn btn-info">Refresh</button>
        </div>

        {/* Executions List */}
        <div className="executions-list">
          {filteredExecutions.length === 0 ? (
            <div className="no-executions">
              <p>No executions found</p>
            </div>
          ) : (
            filteredExecutions.map((execution) => (
              <div key={execution._id} className="execution-card">
                <div className="execution-header">
                  <div className="execution-info">
                    <h3>{workflows[execution.workflow_id]?.name || 'Unknown Workflow'}</h3>
                    <div className="execution-meta">
                      <span className="execution-id">ID: {execution._id}</span>
                      <span className="execution-version">v{execution.workflow_version}</span>
                      <span 
                        className="execution-status" 
                        style={{ color: getStatusColor(execution.status) }}
                      >
                        {execution.status}
                      </span>
                    </div>
                  </div>
                  <div className="execution-actions">
                    <button 
                      onClick={() => navigate(`/logs/${execution._id}`)}
                      className="btn btn-sm btn-primary"
                    >
                      View Logs
                    </button>
                  </div>
                </div>

                <div className="execution-details">
                  <div className="detail-row">
                    <span className="label">Triggered By:</span>
                    <span className="value">{execution.triggered_by || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Started:</span>
                    <span className="value">{new Date(execution.started_at).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span className="value">{calculateDuration(execution.started_at, execution.ended_at)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Retries:</span>
                    <span className="value">{execution.retries}</span>
                  </div>
                </div>

                {/* Step Logs Preview */}
                {execution.logs && execution.logs.length > 0 && (
                  <div className="logs-preview">
                    <h4>Execution Logs</h4>
                    {execution.logs.map((log, idx) => (
                      <div key={idx} className="log-entry">
                        <div className="log-header">
                          <h5>[Step {idx + 1}] {log.step_name}</h5>
                          <span className={`log-status ${log.status}`}>{log.status}</span>
                        </div>
                        
                        <div className="log-content">
                          {/* Rules Evaluation */}
                          {log.evaluated_rules && log.evaluated_rules.length > 0 && (
                            <div className="rules-section">
                              <span className="rules-label">Rules evaluated: </span>
                              <span className="rules-json">
                                {JSON.stringify(log.evaluated_rules.map(rule => ({
                                  "rule": rule.condition,
                                  "result": rule.matched
                                })), null, 2)}
                              </span>
                            </div>
                          )}

                          <div className="log-details">
                            <span className="log-detail">
                              Next Step: <span className="highlight">{log.selected_next_step || 'End'}</span>
                            </span>
                            <span className="log-detail">
                              Status: <span className={`highlight ${log.status}`}>{log.status}</span>
                            </span>
                            <span className="log-detail">
                              Approver: <span className="highlight">
                                {log.metadata?.approver || log.metadata?.user || execution.triggered_by || 'N/A'}
                              </span>
                            </span>
                            <span className="log-detail">
                              Duration: <span className="highlight">
                                {calculateDuration(log.started_at, log.ended_at)}
                              </span>
                            </span>
                          </div>

                          {log.error_message && (
                            <div className="error-section">
                              <span className="error-label">Error:</span>
                              <span className="error-message">{log.error_message}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ExecutionsPage;
