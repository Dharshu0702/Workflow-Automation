import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExecutionService from '../services/executionService';
import Navbar from '../components/Navbar';
import './ExecutionLogs.css';

const ExecutionLogs = () => {
  const { executionId } = useParams();
  const navigate = useNavigate();
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExecution();
  }, [executionId]);

  const fetchExecution = async () => {
    setLoading(true);
    try {
      const response = await ExecutionService.getExecution(executionId);
      setExecution(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch execution');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div><Navbar title="Loading..." /></div>;
  if (!execution) return <div><Navbar title="Execution Not Found" /></div>;

  return (
    <>
      <Navbar title="Execution Logs" />
      <div className="logs-container">
        {error && <div className="error-message">{error}</div>}

        <div className="execution-summary">
          <h3>Execution Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Execution ID:</label>
              <span className="code">{execution._id}</span>
            </div>
            <div className="summary-item">
              <label>Workflow:</label>
              <span>{execution.workflow_id?.name || execution.workflow_id}</span>
            </div>
            <div className="summary-item">
              <label>Status:</label>
              <span className={`status ${execution.status}`}>{execution.status}</span>
            </div>
            <div className="summary-item">
              <label>Version:</label>
              <span>{execution.workflow_version}</span>
            </div>
            <div className="summary-item">
              <label>Started:</label>
              <span>{new Date(execution.started_at).toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <label>Ended:</label>
              <span>{execution.ended_at ? new Date(execution.ended_at).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="summary-item">
              <label>Retries:</label>
              <span>{execution.retries}</span>
            </div>
            <div className="summary-item">
              <label>Triggered By:</label>
              <span>{execution.triggered_by}</span>
            </div>
          </div>
        </div>

        <div className="input-data-section">
          <h3>Input Data</h3>
          <pre className="json-display">
            {JSON.stringify(execution.data, null, 2)}
          </pre>
        </div>

        {execution.logs && execution.logs.length > 0 && (
          <div className="logs-section">
            <h3>Step Execution Logs</h3>
            <div className="step-logs">
              {execution.logs.map((log, idx) => (
                <div key={idx} className="step-log-card">
                  <div className="step-header">
                    <h4>Step {idx + 1}: {log.step_name}</h4>
                    <span className="step-type">{log.step_type}</span>
                    <span className={`step-status ${log.status}`}>{log.status}</span>
                  </div>

                  <div className="step-details">
                    <p><strong>Started:</strong> {log.started_at ? new Date(log.started_at).toLocaleString() : 'N/A'}</p>
                    <p><strong>Ended:</strong> {log.ended_at ? new Date(log.ended_at).toLocaleString() : 'N/A'}</p>
                    {log.error_message && (
                      <p className="error-msg"><strong>Error:</strong> {log.error_message}</p>
                    )}
                  </div>

                  {log.evaluated_rules && log.evaluated_rules.length > 0 && (
                    <div className="rules-evaluation">
                      <h5>Rules Evaluation</h5>
                      <table className="rules-table">
                        <thead>
                          <tr>
                            <th>Condition</th>
                            <th>Priority</th>
                            <th>Matched</th>
                          </tr>
                        </thead>
                        <tbody>
                          {log.evaluated_rules.map((rule, ridx) => (
                            <tr key={ridx} className={rule.matched ? 'matched' : ''}>
                              <td className="condition-cell">{rule.condition}</td>
                              <td>{rule.priority}</td>
                              <td>{rule.matched ? '✓ Yes' : '✗ No'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {log.selected_next_step && (
                    <p><strong>Next Step:</strong> {log.selected_next_step}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="actions">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">Back</button>
          <button onClick={fetchExecution} className="btn btn-info">Refresh</button>
        </div>
      </div>
    </>
  );
};

export default ExecutionLogs;