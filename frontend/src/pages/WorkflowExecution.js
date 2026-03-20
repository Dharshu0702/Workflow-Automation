import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkflowService from '../services/workflowService';
import ExecutionService from '../services/executionService';
import DynamicFormGenerator from '../components/DynamicFormGenerator';
import Navbar from '../components/Navbar';
import './WorkflowExecution.css';

const WorkflowExecution = () => {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [inputData, setInputData] = useState({});
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
      
      // Initialize input data with default values from schema
      if (response.data.input_schema) {
        const schema = typeof response.data.input_schema === 'string'
          ? JSON.parse(response.data.input_schema)
          : response.data.input_schema;
        
        // Create initial data object with empty values
        const initialData = {};
        Object.keys(schema).forEach(key => {
          const fieldSchema = schema[key];
          if (fieldSchema.type === 'boolean') {
            initialData[key] = fieldSchema.default || false;
          } else if (fieldSchema.type === 'array') {
            initialData[key] = fieldSchema.default || [];
          } else if (fieldSchema.type === 'object') {
            initialData[key] = fieldSchema.default || {};
          } else if (fieldSchema.type === 'number' || fieldSchema.type === 'integer') {
            initialData[key] = fieldSchema.default || 0;
          } else {
            initialData[key] = fieldSchema.default || '';
          }
        });
        setInputData(initialData);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    try {
      // Validate required fields
      if (workflow?.input_schema) {
        const schema = typeof workflow.input_schema === 'string'
          ? JSON.parse(workflow.input_schema)
          : workflow.input_schema;
        
        const missingFields = [];
        Object.entries(schema).forEach(([fieldName, fieldSchema]) => {
          if (fieldSchema.required && !inputData[fieldName]) {
            missingFields.push(fieldName);
          }
        });
        
        if (missingFields.length > 0) {
          setError(`Please fill in required fields: ${missingFields.join(', ')}`);
          return;
        }
      }

      // Execute workflow (creates and runs in one call)
      const response = await ExecutionService.executeWorkflow(workflowId, inputData, 'user');
      setExecution(response.data);
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
            
            {workflow?.input_schema ? (
              <DynamicFormGenerator
                schema={typeof workflow.input_schema === 'string' 
                  ? JSON.parse(workflow.input_schema) 
                  : workflow.input_schema}
                data={inputData}
                onChange={setInputData}
              />
            ) : (
              <div className="form-group">
                <label>Input Data (JSON)</label>
                <textarea
                  value={JSON.stringify(inputData, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setInputData(parsed);
                    } catch {
                      // Handle invalid JSON gracefully
                    }
                  }}
                  rows="15"
                  placeholder="Enter JSON data"
                />
              </div>
            )}

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
                <h4>Execution Summary</h4>
                {execution.logs.map((log, idx) => (
                  <div key={idx} className="log-entry">
                    <div className="log-header">
                      <h5>{idx + 1}. {log.step_name} ({log.step_type})</h5>
                      <span className="timestamp">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="log-status">
                      <p><strong>Status:</strong> <span className={`status ${log.status}`}>{log.status}</span></p>
                    </div>

                    {/* Rule Evaluation Summary - Always Visible */}
                    {log.rule_evaluation_summary && (
                      <div className="rule-evaluation-summary">
                        <h6>Rule Evaluation Results</h6>
                        {Array.isArray(log.rule_evaluation_summary) ? (
                          <div className="rule-results">
                            {log.rule_evaluation_summary.map((rule, ridx) => (
                              <div key={ridx} className={`rule-result ${rule.selected ? 'selected' : ''}`}>
                                <div className="rule-condition">
                                  <span className="condition-text">{rule.condition}</span>
                                  <span className={`result-badge ${rule.result.toLowerCase()}`}>
                                    {rule.result}
                                  </span>
                                  {rule.selected && <span className="selected-badge">SELECTED</span>}
                                </div>
                                <div className="rule-details">
                                  <small>Priority: {rule.priority}</small>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="rule-summary-text">{log.rule_evaluation_summary}</p>
                        )}
                        
                        {log.selected_next_step && (
                          <p className="next-step-info">
                            <strong>Next Step:</strong> {log.selected_next_step}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Input Data */}
                    {log.input_data && (
                      <details className="input-data-details">
                        <summary>Input Data</summary>
                        <pre className="input-data-json">
                          {JSON.stringify(log.input_data, null, 2)}
                        </pre>
                      </details>
                    )}

                    {/* Detailed Rule Evaluation (Collapsible) */}
                    {log.evaluated_rules && log.evaluated_rules.length > 0 && (
                      <details className="detailed-rules">
                        <summary>Detailed Rule Evaluation ({log.evaluated_rules.length} rules)</summary>
                        <ul>
                          {log.evaluated_rules.map((rule, ridx) => (
                            <li key={ridx} className={rule.matched ? 'matched' : 'not-matched'}>
                              <div className="rule-info">
                                <span className="rule-condition">{rule.condition}</span>
                                <span className="rule-priority">Priority: {rule.priority}</span>
                                <span className="rule-result">
                                  {rule.matched ? '✓ Matched' : '✗ Not matched'}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}

                    {log.error_message && (
                      <div className="error-message">
                        <strong>Error:</strong> {log.error_message}
                      </div>
                    )}
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