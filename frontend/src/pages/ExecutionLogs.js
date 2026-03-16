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
            <h3>Execution Logs</h3>
            <div className="step-logs">
              {execution.logs.map((log, idx) => (
                <div key={idx} className="step-log-card">
                  <div className="step-header">
                    <div className="step-info">
                      <h4>[Step {idx + 1}] {log.step_name}</h4>
                      <div className="step-meta">
                        <span className="step-type">{log.step_type}</span>
                        <span className={`step-status ${log.status}`}>{log.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="step-content">
                    {/* Rules Evaluation */}
                    {log.evaluated_rules && log.evaluated_rules.length > 0 && (
                      <div className="rules-section">
                        <h5>Rules evaluated: 
                          <span className="rules-json">
                            {JSON.stringify(log.evaluated_rules.map(rule => ({
                              "rule": rule.condition,
                              "result": rule.matched
                            })), null, 2)}
                          </span>
                        </h5>
                      </div>
                    )}

                    {/* Next Step */}
                    <div className="next-step-info">
                      <span className="label">Next Step:</span> 
                      <span className="value">{log.selected_next_step || 'End'}</span>
                    </div>

                    {/* Status */}
                    <div className="status-info">
                      <span className="label">Status:</span> 
                      <span className={`value status ${log.status}`}>{log.status}</span>
                    </div>

                    {/* Approver/Metadata */}
                    <div className="metadata-info">
                      <span className="label">Approver:</span> 
                      <span className="value">
                        {log.metadata?.approver || 
                         log.metadata?.user || 
                         execution.triggered_by || 
                         'N/A'}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="duration-info">
                      <span className="label">Duration:</span> 
                      <span className="value">
                        {calculateDuration(log.started_at, log.ended_at)}
                      </span>
                    </div>

                    {/* Error Message */}
                    {log.error_message && (
                      <div className="error-section">
                        <span className="label">Error:</span>
                        <span className="error-msg">{log.error_message}</span>
                      </div>
                    )}

                    {/* Additional Metadata */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="additional-metadata">
                        <h6>Additional Metadata:</h6>
                        <pre className="metadata-json">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
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