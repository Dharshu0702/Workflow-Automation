import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WorkflowService from '../services/workflowService';
import Navbar from '../components/Navbar';
import './WorkflowEditor.css';

const WorkflowEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    version: 1,
    is_active: true,
    input_schema: {}
  });
  const [inputSchemaText, setInputSchemaText] = useState('{}');
  const [steps, setSteps] = useState([]);
  const [stepRules, setStepRules] = useState({});
  const [newStep, setNewStep] = useState({ name: '', step_type: 'task', order: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchWorkflow();
    }
  }, [id]);

  // Refresh data when component gains focus (returning from rule editor)
  useEffect(() => {
    const handleFocus = () => {
      if (id) {
        fetchWorkflow();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [id]);

  const fetchWorkflow = async () => {
    setLoading(true);
    try {
      const response = await WorkflowService.getWorkflowById(id);
      const workflow = response.data;
      
      // Ensure input_schema is an object
      const schemaObj = typeof workflow.input_schema === 'string' 
        ? JSON.parse(workflow.input_schema) 
        : (workflow.input_schema || {});
      
      setFormData({ ...workflow, input_schema: schemaObj });
      setInputSchemaText(JSON.stringify(schemaObj, null, 2));

      const stepsResponse = await WorkflowService.getSteps(id);
      const fetchedSteps = stepsResponse.data;
      setSteps(fetchedSteps);
      
      // Fetch rules for each step
      const stepIds = fetchedSteps.map(step => step._id);
      const rulesResponses = await Promise.all(
        stepIds.map(stepId => 
          WorkflowService.getRules(stepId).catch(() => ({ data: [] }))
        )
      );
      const rulesMap = {};
      fetchedSteps.forEach((step, index) => {
        rulesMap[step._id] = rulesResponses[index].data;
      });
      setStepRules(rulesMap);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === 'true' ? true : value === 'false' ? false : value)
    }));
  };

  const handleAddStep = async () => {
    if (!newStep.name) {
      setError('Step name is required');
      return;
    }
    try {
      const response = await WorkflowService.createStep(id || formData._id, {
        ...newStep,
        order: steps.length + 1
      });
      const newStepData = response.data;
      setSteps([...steps, newStepData]);
      
      // Fetch rules for the new step
      try {
        const rulesResponse = await WorkflowService.getRules(newStepData._id);
        setStepRules(prev => ({
          ...prev,
          [newStepData._id]: rulesResponse.data
        }));
      } catch (err) {
        // If no rules exist, set empty array
        setStepRules(prev => ({
          ...prev,
          [newStepData._id]: []
        }));
      }
      
      setNewStep({ name: '', step_type: 'task', order: steps.length + 2 });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add step');
    }
  };

  const handleDeleteStep = async (stepId) => {
    try {
      await WorkflowService.deleteStep(stepId);
      setSteps(steps.filter(s => s._id !== stepId));
      // Remove rules for the deleted step
      setStepRules(prev => {
        const newRules = { ...prev };
        delete newRules[stepId];
        return newRules;
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete step');
    }
  };

  const handleSaveWorkflow = async () => {
    // Validate required fields
    if (!formData.name || formData.name.trim() === '') {
      setError('Workflow name is required');
      return;
    }
    if (!formData.version || formData.version < 1) {
      setError('Version must be at least 1');
      return;
    }

    try {
      // Parse and validate input_schema from textarea (optional field)
      let inputSchema = {};
      const trimmedSchema = inputSchemaText.trim();
      
      // Only try to parse if there's actual content
      if (trimmedSchema && trimmedSchema !== '{}') {
        try {
          inputSchema = JSON.parse(trimmedSchema);
        } catch (parseErr) {
          setError('Invalid JSON in Input Schema. Please fix the JSON syntax or leave it as {} for empty schema.');
          return;
        }
      }

      // Ensure input_schema is properly set
      const dataToSave = {
        ...formData,
        input_schema: inputSchema
      };

      if (id) {
        await WorkflowService.updateWorkflow(id, dataToSave);
      } else {
        const response = await WorkflowService.createWorkflow(dataToSave);
        navigate(`/edit/${response.data._id}`);
        return;
      }
      setError(null);
      alert('Workflow saved successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save workflow');
    }
  };

  return (
    <>
      <Navbar title={id ? 'Edit Workflow' : 'Create Workflow'} />
      <div className="editor-container">
        {error && <div className="error-message">{error}</div>}

        <div className="editor-form">
          <h3>Workflow Details</h3>

          <div className="form-group">
            <label>Workflow Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g., Expense Approval"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Version</label>
              <input
                type="number"
                name="version"
                value={formData.version}
                onChange={handleFormChange}
                min="1"
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleFormChange}
                />
                Active
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Input Schema (JSON) - Optional</label>
            <textarea
              value={inputSchemaText}
              onChange={(e) => {
                setInputSchemaText(e.target.value);
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    input_schema: parsed
                  }));
                } catch (err) {
                  // Ignore parse errors while typing - user is still editing
                }
              }}
              placeholder='{"properties": {"amount": {"type": "number"}, "country": {"type": "string"}}}'
            />
            <small>Only valid JSON. Leave as {} if not needed. Will be validated on save.</small>
          </div>

          <button onClick={handleSaveWorkflow} className="btn btn-primary btn-large">
            Save Workflow
          </button>
        </div>

        {id && (
          <div className="steps-section">
            <h3>Steps</h3>

            <div className="add-step">
              <input
                type="text"
                value={newStep.name}
                onChange={(e) => setNewStep(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Step name"
              />
              <select
                value={newStep.step_type}
                onChange={(e) => setNewStep(prev => ({ ...prev, step_type: e.target.value }))}
              >
                <option value="task">Task</option>
                <option value="approval">Approval</option>
                <option value="notification">Notification</option>
              </select>
              <button onClick={handleAddStep} className="btn btn-success btn-sm">Add Step</button>
            </div>

            {steps.length > 0 && (
              <div className="steps-list">
                {steps.map((step, idx) => (
                  <div key={step._id} className="step-card">
                    <div className="step-info">
                      <h4>{idx + 1}. {step.name}</h4>
                      <p>Type: {step.step_type}</p>
                      {stepRules[step._id] && stepRules[step._id].length > 0 && (
                        <div className="step-rules-summary">
                          <p><strong>Rules ({stepRules[step._id].length}):</strong></p>
                          <ul>
                            {stepRules[step._id].slice(0, 3).map((rule, ruleIdx) => (
                              <li key={rule._id} className="rule-summary">
                                <span className="rule-condition">{rule.condition}</span>
                                <span className="rule-next-step">→ {rule.next_step_id || 'End'}</span>
                              </li>
                            ))}
                            {stepRules[step._id].length > 3 && (
                              <li className="rule-more">...and {stepRules[step._id].length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button onClick={() => navigate(`/step/${step._id}`)} className="btn btn-sm btn-info">Add Rules</button>
                    <button onClick={() => handleDeleteStep(step._id)} className="btn btn-sm btn-danger">Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Back to Workflows
        </button>
      </div>
    </>
  );
};

export default WorkflowEditor;