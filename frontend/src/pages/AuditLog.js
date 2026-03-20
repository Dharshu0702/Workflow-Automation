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
    let filtered = Array.isArray(auditLogs) ? auditLogs : [];

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
      // Handle different response structures
      const logsData = response.data;
      let logs = [];
      
      if (Array.isArray(logsData)) {
        logs = logsData;
      } else if (logsData && logsData.auditLogs && Array.isArray(logsData.auditLogs)) {
        logs = logsData.auditLogs;
      } else if (logsData && logsData.logs && Array.isArray(logsData.logs)) {
        logs = logsData.logs;
      } else {
        logs = [];
      }
      
      setAuditLogs(logs);
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
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Workflow Name</th>
                  <th>Execution ID</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Started By</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={log._id || idx}>
                    <td>{log.details?.workflow_name || 'N/A'}</td>
                    <td>
                      <span className="execution-id">
                        {log.execution_id ? log.execution_id.slice(0, 8) + '...' : 'N/A'}
                      </span>
                    </td>
                    <td>{log.details?.workflow_version || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${log.details?.workflow_status || 'unknown'}`}>
                        {log.details?.workflow_status || 'Unknown'}
                      </span>
                    </td>
                    <td>{log.actor || 'N/A'}</td>
                    <td>
                      {log.details?.start_time ? 
                        new Date(log.details.start_time).toLocaleString() : 
                        new Date(log.timestamp).toLocaleString()
                      }
                    </td>
                    <td>
                      {log.details?.end_time ? 
                        new Date(log.details.end_time).toLocaleString() : 
                        'N/A'
                      }
                    </td>
                    <td>
                      {log.execution_id && (
                        <button 
                          onClick={() => navigate(`/logs/${log.execution_id}`)}
                          className="btn btn-sm btn-info"
                        >
                          View Logs
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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