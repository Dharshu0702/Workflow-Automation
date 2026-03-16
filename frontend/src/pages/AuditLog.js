import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import './AuditLog.css';

const AuditLog = () => {
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workflowFilter, setWorkflowFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    let filtered = auditLogs;

    if (workflowFilter) {
      filtered = filtered.filter(log => 
        log.workflow_id?.toLowerCase().includes(workflowFilter.toLowerCase()) ||
        log.workflow_id === workflowFilter
      );
    }

    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    setFilteredLogs(filtered);
  }, [auditLogs, workflowFilter, actionFilter]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/audit-logs');
      // If endpoint doesn't exist, fetch from executions
      setAuditLogs(response.data || []);
    } catch (err) {
      // Fallback: Try to get from executions endpoint
      try {
        const execResponse = await api.get('/executions');
        // Extract audit info from executions
        const logs = execResponse.data?.map((exec, idx) => ({
          _id: `${idx}`,
          workflow_id: exec.workflow_id,
          execution_id: exec._id,
          action: 'workflow_executed',
          actor: exec.triggered_by || 'system',
          timestamp: exec.started_at,
          details: {
            status: exec.status,
            retries: exec.retries
          }
        })) || [];
        setAuditLogs(logs);
      } catch (fallbackErr) {
        setError('Failed to fetch audit logs');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar title="Audit Logs" />
      <div className="audit-container">
        {error && <div className="error-message">{error}</div>}

        <div className="audit-filters">
          <input
            type="text"
            placeholder="Filter by workflow ID..."
            value={workflowFilter}
            onChange={(e) => setWorkflowFilter(e.target.value)}
            className="filter-input"
          />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Actions</option>
            <option value="workflow_executed">Workflow Executed</option>
            <option value="step_executed">Step Executed</option>
            <option value="workflow_created">Workflow Created</option>
            <option value="workflow_updated">Workflow Updated</option>
          </select>
        </div>

        {loading ? (
          <p>Loading audit logs...</p>
        ) : filteredLogs.length === 0 ? (
          <p>No audit logs found.</p>
        ) : (
          <div className="audit-logs">
            {filteredLogs.map((log, idx) => (
              <div key={log._id || idx} className="audit-entry">
                <div className="audit-header">
                  <h4>{log.action}</h4>
                  <span className="timestamp">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="audit-details">
                  <p><strong>Actor:</strong> {log.actor}</p>
                  <p><strong>Workflow:</strong> {log.workflow_id || 'N/A'}</p>
                  {log.execution_id && (
                    <p>
                      <strong>Execution:</strong>
                      <button 
                        onClick={() => navigate(`/logs/${log.execution_id}`)}
                        className="link-btn"
                      >
                        {log.execution_id.slice(0, 8)}...
                      </button>
                    </p>
                  )}

                  {log.details && (
                    <details className="additional-details">
                      <summary>Additional Details</summary>
                      <pre>
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Back to Workflows
        </button>
      </div>
    </>
  );
};

export default AuditLog;