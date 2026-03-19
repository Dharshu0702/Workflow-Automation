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
      
      // Pre-populate input data with workflow input schema
      if (response.data.input_schema) {
        const schema = typeof response.data.input_schema === 'string'
          ? JSON.parse(response.data.input_schema)
          : response.data.input_schema;
        
        // Initialize input data with empty values
        const initialData = {};
        Object.keys(schema).forEach(key => {
          initialData[key] = schema[key] === 'number' ? 0 : 
                           schema[key] === 'boolean' ? false :
                           schema[key] === 'array' ? [] : '';
        });
        setInputData(initialData);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value, type) => {
    let processedValue = value;
    
    // Convert to appropriate type
    if (type === 'number') {
      processedValue = parseFloat(value) || 0;
    } else if (type === 'boolean') {
      processedValue = value === 'true' || value === true;
    } else if (type === 'array') {
      try {
        processedValue = typeof value === 'string' ? JSON.parse(value) : value;
      } catch {
        processedValue = [];
      }
    }
    
    setInputData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const handleExecute = async () => {
    try {
      setError(null);
      
      // Validate required fields
      if (workflow.input_schema) {
        const schema = typeof workflow.input_schema === 'string'
          ? JSON.parse(workflow.input_schema)
          : workflow.input_schema;
        
        for (const [field, type] of Object.entries(schema)) {
          if (inputData[field] === undefined || inputData[field] === null || inputData[field] === '') {
            setError(`${field} is required`);
            return;
          }
        }
      }

      // Execute workflow
      const response = await ExecutionService.executeWorkflow(workflowId, inputData, 'user');
      setExecution(response.data.execution);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to execute workflow';
      const errorDetails = err.response?.data?.details;
      
      if (errorDetails) {
        setError(`${errorMessage}: ${errorDetails}`);
      } else {
        setError(errorMessage);
      }
    }
  };

  const renderInputField = (fieldName, fieldType, label) => {
    const value = inputData[fieldName] || '';
    
    switch (fieldType) {
      case 'string':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value, 'string')}
            placeholder={`Enter ${label}`}
            className="form-input"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value, 'number')}
            placeholder={`Enter ${label}`}
            className="form-input"
            step="any"
          />
        );
      
      case 'boolean':
        return (
          <select
            value={value.toString()}
            onChange={(e) => handleInputChange(fieldName, e.target.value, 'boolean')}
            className="form-input"
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </select>
        );
      
      case 'array':
        return (
          <textarea
            value={Array.isArray(value) ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => handleInputChange(fieldName, e.target.value, 'array')}
            placeholder={`Enter ${label} as JSON array`}
            className="form-input"
            rows="4"
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value, 'string')}
            placeholder={`Enter ${label}`}
            className="form-input"
          />
        );
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
            
            {workflow?.input_schema && (
              <div className="input-fields">
                {(() => {
                  const schema = typeof workflow.input_schema === 'string'
                    ? JSON.parse(workflow.input_schema)
                    : workflow.input_schema;
                  
                  return Object.entries(schema).map(([fieldName, fieldType]) => (
                    <div key={fieldName} className="form-group">
                      <label>
                        {fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/_/g, ' ')}
                        <span className="field-type">({fieldType})</span>
                      </label>
                      {renderInputField(fieldName, fieldType, fieldName)}
                    </div>
                  ));
                })()}
              </div>
            )}

            <div className="form-actions">
              <button onClick={handleExecute} className="btn btn-primary btn-large">
                Execute Workflow
              </button>
              <button onClick={() => navigate('/workflows')} className="btn btn-secondary">
                Back to Workflows
              </button>
            </div>
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