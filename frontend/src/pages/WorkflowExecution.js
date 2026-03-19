import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkflowService from '../services/workflowService';
import ExecutionService from '../services/executionService';
import Navbar from '../components/Navbar';
import './WorkflowExecution.css';

const WorkflowExecution = () => {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [inputData, setInputData] = useState('{}');
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkflow();
  }, [workflowId]);

  const fetchWorkflow = async () => {
    setLoading(true);
    try {
      const response = await WorkflowService.getWorkflowById(workflowId);
      setWorkflow(response.data);
      
      // Pre-populate input data with workflow input schema
      if (response.data.input_schema) {
        const schema = typeof response.data.input_schema === 'string'
          ? JSON.parse(response.data.input_schema)
          : response.data.input_schema;
        setInputData(JSON.stringify(schema, null, 2));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    try {
      let data;
      try {
        data = JSON.parse(inputData);
      } catch {
        setError('Invalid JSON input');
        return;
      }

      // Execute workflow (creates and runs in one call)
      const response = await ExecutionService.executeWorkflow(workflowId, data, 'user');
      setExecution(response.data.execution);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to execute workflow');
    }
  };

  if (loading) return <div><Navbar title="Loading..." /></div>;

  return (
    <>
      <Navbar title={`Execute: ${workflow?.name || 'Loading...'}`} />
      <div className="execution-container">
        {error && <div className="error-message">{error}</div>}

        {!execution ? (
          <div className="execution-form">
            <h3>Workflow Execution</h3>
            
            <div className="form-group">
              <label>Input Data (JSON)</label>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                rows="15"
              />
            </div>

            <button onClick={handleExecute} className="btn btn-primary btn-large">
              Execute Workflow
            </button>
          </div>
        ) : (
          <div className="execution-result">
            <h3>Execution Result</h3>
            
            <div className="status-box">
              <p><strong>Execution ID:</strong> {execution._id}</p>
              <p><strong>Status:</strong> <span className={`status ${execution.status}`}>{execution.status}</span></p>
              <p><strong>Started:</strong> {new Date(execution.started_at).toLocaleString()}</p>
              {execution.ended_at && (
                <p><strong>Ended:</strong> {new Date(execution.ended_at).toLocaleString()}</p>
              )}
              <p><strong>Retries:</strong> {execution.retries}</p>
            </div>

            {execution.logs && execution.logs.length > 0 && (
              <div className="logs-section">
                <h4>Step Execution Logs</h4>
                {execution.logs.map((log, idx) => (
                  <div key={idx} className="log-entry">
                    <h5>{idx + 1}. {log.step_name} ({log.step_type})</h5>
                    <p><strong>Status:</strong> {log.status}</p>
                    {log.evaluated_rules && (
                      <details>
                        <summary>Evaluated Rules ({log.evaluated_rules.length})</summary>
                        <ul>
                          {log.evaluated_rules.map((rule, ridx) => (
                            <li key={ridx}>
                              {rule.condition} (Priority: {rule.priority}) - {rule.matched ? '✓ Matched' : '✗ Not matched'}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                    {log.error_message && <p className="error"><strong>Error:</strong> {log.error_message}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="actions">
              <button onClick={() => navigate(`/logs/${execution._id}`)} className="btn btn-info">
                View Full Logs
              </button>
              <button onClick={() => window.location.reload()} className="btn btn-primary">
                Execute Again
              </button>
              <button onClick={() => navigate('/')} className="btn btn-secondary">
                Back to Workflows
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WorkflowExecution;