import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkflowService from '../services/workflowService';
import Navbar from '../components/Navbar';
import './StepRuleEditor.css';

const StepRuleEditor = () => {
  const { stepId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(null);
  const [rules, setRules] = useState([]);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [newRule, setNewRule] = useState({ condition: '', next_step_id: '', priority: 1 });
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStepAndRules();
  }, [stepId]);

  useEffect(() => {
    if (step && step.workflow_id) {
      fetchWorkflowSteps();
    }
  }, [step]);

  const fetchStepAndRules = async () => {
    setLoading(true);
    try {
      const stepResponse = await WorkflowService.getStepById(stepId);
      setStep(stepResponse.data);

      const rulesResponse = await WorkflowService.getRules(stepId);
      setRules(rulesResponse.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch step and rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowSteps = async () => {
    try {
      // Use the already loaded step data to get workflow ID
      if (!step || !step.workflow_id) {
        console.log('Step or workflow_id not available:', step);
        return;
      }
      
      console.log('Fetching steps for workflow:', step.workflow_id);
      
      // Get all steps for this workflow
      const stepsResponse = await WorkflowService.getSteps(step.workflow_id);
      console.log('Steps response:', stepsResponse);
      console.log('Steps data:', stepsResponse.data);
      
      setWorkflowSteps(stepsResponse.data || []);
    } catch (err) {
      console.error('Failed to fetch workflow steps:', err);
      setError('Failed to fetch workflow steps: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddRule = async () => {
    if (!newRule.condition) {
      setError('Condition is required');
      return;
    }
    try {
      if (editingRuleId) {
        // Update existing rule
        const response = await WorkflowService.updateRule(editingRuleId, newRule);
        setRules(rules.map(r => r._id === editingRuleId ? response.data : r));
        setEditingRuleId(null);
      } else {
        // Add new rule
        const response = await WorkflowService.createRule(stepId, newRule);
        setRules([...rules, response.data]);
      }
      setNewRule({ condition: '', next_step_id: '', priority: rules.length + 1 });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save rule');
    }
  };

  const handleEditRule = (rule) => {
    setEditingRuleId(rule._id);
    setNewRule({
      condition: rule.condition,
      next_step_id: rule.next_step_id,
      priority: rule.priority
    });
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setNewRule({ condition: '', next_step_id: '', priority: 1 });
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await WorkflowService.deleteRule(ruleId);
      setRules(rules.filter(r => r._id !== ruleId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete rule');
    }
  };

  const handleUpdatePriority = async (ruleId, newPriority) => {
    try {
      const rule = rules.find(r => r._id === ruleId);
      await WorkflowService.updateRule(ruleId, { ...rule, priority: newPriority });
      fetchStepAndRules();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update priority');
    }
  };

  if (loading) return <div><Navbar title="Loading..." /></div>;

  return (
    <>
      <Navbar title={`Rules for: ${step?.name || 'Loading...'}`} />
      <div className="rule-editor-container">
        {error && <div className="error-message">{error}</div>}

        <div className="rule-form">
          <h3>{editingRuleId ? 'Edit Rule' : 'Add New Rule'}</h3>

          <div className="form-group">
            <label>Condition</label>
            <textarea
              value={newRule.condition}
              onChange={(e) => setNewRule(prev => ({ ...prev, condition: e.target.value }))}
              placeholder="e.g., amount > 100 && country == 'US'"
            />
            <small>
              Supports: ==, !=, &lt;, &gt;, &lt;=, &gt;=, &amp;&amp;, || <br/>
              Functions: contains(field, value), startsWith(field, value), endsWith(field, value)
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Next Step</label>
              <select
                value={newRule.next_step_id}
                onChange={(e) => setNewRule(prev => ({ ...prev, next_step_id: e.target.value }))}
              >
                <option value="">Select a step...</option>
                <option value="DEFAULT">DEFAULT (End Workflow)</option>
                {workflowSteps && workflowSteps.length > 0 ? (
                  workflowSteps
                    .filter(s => s._id !== stepId) // Exclude current step
                    .sort((a, b) => a.order - b.order)
                    .map(step => (
                      <option key={step._id} value={step._id}>
                        {step.order}. {step.name}
                      </option>
                    ))
                ) : (
                  <option value="" disabled>No steps available</option>
                )}
              </select>
              {workflowSteps && workflowSteps.length > 0 && (
                <small>
                  Available steps: {workflowSteps.length} | 
                  Current step: {step?.name || 'Loading...'}
                </small>
              )}
            </div>
            <div className="form-group">
              <label>Priority</label>
              <input
                type="number"
                value={newRule.priority}
                onChange={(e) => setNewRule(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                min="1"
              />
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleAddRule} className="btn btn-primary btn-large">
              {editingRuleId ? 'Update Rule' : 'Add Rule'}
            </button>
            {editingRuleId && (
              <button onClick={handleCancelEdit} className="btn btn-secondary btn-large">
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="rules-section">
          <h3>Existing Rules (sorted by priority)</h3>
          {rules.length === 0 ? (
            <p>No rules defined for this step yet.</p>
          ) : (
            <div className="rules-list">
              {rules.sort((a, b) => a.priority - b.priority).map((rule, idx) => (
                <div key={rule._id} className="rule-card">
                  <div className="rule-info">
                    <h4>Rule {idx + 1} (Priority: {rule.priority})</h4>
                    <p><strong>Condition:</strong> {rule.condition}</p>
                    <p><strong>Next Step:</strong> {rule.next_step_id || 'End'}</p>
                  </div>
                  <div className="rule-actions">
                    <input
                      type="number"
                      value={rule.priority}
                      onChange={(e) => handleUpdatePriority(rule._id, parseInt(e.target.value))}
                      min="1"
                      className="priority-input"
                    />
                    <button onClick={() => handleEditRule(rule)} className="btn btn-sm btn-info">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteRule(rule._id)} className="btn btn-sm btn-danger">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Back
        </button>
      </div>
    </>
  );
};

export default StepRuleEditor;