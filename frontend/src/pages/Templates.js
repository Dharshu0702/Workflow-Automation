import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkflowService from '../services/workflowService';
import Navbar from '../components/Navbar';
import './Templates.css';

const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'Custom',
    description: '',
    steps: [],
    rules: [],
    inputSchema: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    // Pre-defined workflow templates
    const workflowTemplates = [
      {
        id: 'expense-approval',
        name: 'Expense Approval Workflow',
        category: 'Finance',
        description: 'Automated expense approval process with multi-level validation',
        icon: '💰',
        difficulty: 'Beginner',
        estimatedTime: '15 minutes',
        steps: [
          { name: 'Submit Expense', type: 'task', order: 1 },
          { name: 'Manager Review', type: 'approval', order: 2 },
          { name: 'Finance Validation', type: 'task', order: 3 },
          { name: 'Payment Processing', type: 'task', order: 4 }
        ],
        rules: [
          { condition: 'amount < 500', nextStep: 'Finance Validation', priority: 1 },
          { condition: 'amount >= 500', nextStep: 'Manager Review', priority: 2 }
        ],
        inputSchema: {
          amount: 'number',
          category: 'string',
          description: 'string',
          submitter: 'string'
        }
      },
      {
        id: 'leave-request',
        name: 'Leave Request Workflow',
        category: 'HR',
        description: 'Employee leave request approval process',
        icon: '🏖️',
        difficulty: 'Beginner',
        estimatedTime: '10 minutes',
        steps: [
          { name: 'Submit Request', type: 'task', order: 1 },
          { name: 'Manager Approval', type: 'approval', order: 2 },
          { name: 'HR Notification', type: 'task', order: 3 },
          { name: 'Calendar Update', type: 'task', order: 4 }
        ],
        rules: [
          { condition: 'days <= 2', nextStep: 'HR Notification', priority: 1 },
          { condition: 'days > 2', nextStep: 'Manager Approval', priority: 2 }
        ],
        inputSchema: {
          employee: 'string',
          startDate: 'string',
          endDate: 'string',
          reason: 'string',
          days: 'number'
        }
      },
      {
        id: 'purchase-order',
        name: 'Purchase Order Workflow',
        category: 'Procurement',
        description: 'Purchase order approval and processing workflow',
        icon: '📦',
        difficulty: 'Intermediate',
        estimatedTime: '20 minutes',
        steps: [
          { name: 'Create PO', type: 'task', order: 1 },
          { name: 'Budget Check', type: 'task', order: 2 },
          { name: 'Manager Approval', type: 'approval', order: 3 },
          { name: 'Finance Review', type: 'approval', order: 4 },
          { name: 'Supplier Notification', type: 'task', order: 5 }
        ],
        rules: [
          { condition: 'amount < 1000', nextStep: 'Supplier Notification', priority: 1 },
          { condition: 'amount >= 1000 && amount < 5000', nextStep: 'Manager Approval', priority: 2 },
          { condition: 'amount >= 5000', nextStep: 'Finance Review', priority: 3 }
        ],
        inputSchema: {
          supplier: 'string',
          items: 'array',
          totalAmount: 'number',
          department: 'string',
          urgency: 'string'
        }
      },
      {
        id: 'onboarding',
        name: 'Employee Onboarding',
        category: 'HR',
        description: 'New employee onboarding process automation',
        icon: '👤',
        difficulty: 'Advanced',
        estimatedTime: '30 minutes',
        steps: [
          { name: 'Offer Acceptance', type: 'task', order: 1 },
          { name: 'Background Check', type: 'task', order: 2 },
          { name: 'IT Setup', type: 'task', order: 3 },
          { name: 'HR Documentation', type: 'task', order: 4 },
          { name: 'Department Introduction', type: 'task', order: 5 },
          { name: 'Training Assignment', type: 'task', order: 6 }
        ],
        rules: [
          { condition: 'role == "developer"', nextStep: 'IT Setup', priority: 1 },
          { condition: 'role == "manager"', nextStep: 'HR Documentation', priority: 2 },
          { condition: 'role == "contractor"', nextStep: 'Department Introduction', priority: 3 }
        ],
        inputSchema: {
          employeeName: 'string',
          role: 'string',
          department: 'string',
          startDate: 'string',
          equipment: 'array'
        }
      },
      {
        id: 'incident-response',
        name: 'Incident Response',
        category: 'IT',
        description: 'IT incident management and resolution workflow',
        icon: '🚨',
        difficulty: 'Intermediate',
        estimatedTime: '25 minutes',
        steps: [
          { name: 'Incident Report', type: 'task', order: 1 },
          { name: 'Triage', type: 'task', order: 2 },
          { name: 'Investigation', type: 'task', order: 3 },
          { name: 'Resolution', type: 'task', order: 4 },
          { name: 'Post-mortem', type: 'task', order: 5 }
        ],
        rules: [
          { condition: 'severity == "low"', nextStep: 'Resolution', priority: 1 },
          { condition: 'severity == "medium"', nextStep: 'Investigation', priority: 2 },
          { condition: 'severity == "high" || severity == "critical"', nextStep: 'Triage', priority: 3 }
        ],
        inputSchema: {
          incidentId: 'string',
          severity: 'string',
          description: 'string',
          reporter: 'string',
          affectedSystems: 'array'
        }
      },
      {
        id: 'customer-support',
        name: 'Customer Support Ticket',
        category: 'Support',
        description: 'Customer support ticket handling and escalation',
        icon: '🎧',
        difficulty: 'Beginner',
        estimatedTime: '15 minutes',
        steps: [
          { name: 'Ticket Creation', type: 'task', order: 1 },
          { name: 'Initial Response', type: 'task', order: 2 },
          { name: 'Investigation', type: 'task', order: 3 },
          { name: 'Resolution', type: 'task', order: 4 },
          { name: 'Customer Feedback', type: 'task', order: 5 }
        ],
        rules: [
          { condition: 'priority == "low"', nextStep: 'Resolution', priority: 1 },
          { condition: 'priority == "medium"', nextStep: 'Investigation', priority: 2 },
          { condition: 'priority == "high" || priority == "urgent"', nextStep: 'Initial Response', priority: 3 }
        ],
        inputSchema: {
          customerId: 'string',
          issue: 'string',
          priority: 'string',
          category: 'string',
          contactInfo: 'string'
        }
      }
    ];

    setTemplates(workflowTemplates);
    setLoading(false);
  };

  const handleUseTemplate = async (template) => {
    try {
      // Create workflow from template
      const workflowData = {
        name: template.name,
        version: 1,
        input_schema: template.inputSchema
      };

      const workflowResponse = await WorkflowService.createWorkflow(workflowData);
      const workflow = workflowResponse.data;

      // Create steps
      const createdSteps = [];
      for (const stepData of template.steps) {
        const stepResponse = await WorkflowService.createStep(workflow._id, {
          name: stepData.name,
          step_type: stepData.type,
          order: stepData.order,
          metadata: {}
        });
        createdSteps.push(stepResponse.data);
      }

      // Create rules (map step names to IDs)
      for (const ruleData of template.rules) {
        const fromStep = createdSteps.find(s => s.name === ruleData.fromStep);
        const toStep = ruleData.nextStep === 'DEFAULT' ? 'DEFAULT' : 
                      createdSteps.find(s => s.name === ruleData.nextStep)?._id;

        if (fromStep && (toStep || ruleData.nextStep === 'DEFAULT')) {
          await WorkflowService.createRule(fromStep._id, {
            condition: ruleData.condition,
            next_step_id: toStep,
            priority: ruleData.priority
          });
        }
      }

      // Navigate to workflow editor
      navigate(`/edit/${workflow._id}`);
    } catch (error) {
      setError('Failed to create workflow from template');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#27ae60';
      case 'Intermediate': return '#f39c12';
      case 'Advanced': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Finance': return '💰';
      case 'HR': return '👥';
      case 'IT': return '💻';
      case 'Procurement': return '🛒';
      case 'Support': return '🎧';
      default: return '📋';
    }
  };

  const handleCreateTemplate = () => {
    setShowCreateForm(true);
  };

  const handleSaveTemplate = () => {
    const template = {
      id: `custom-${Date.now()}`,
      ...newTemplate
    };
    
    setTemplates(prev => [...prev, template]);
    setShowCreateForm(false);
    setNewTemplate({
      name: '',
      category: 'Custom',
      description: '',
      steps: [],
      rules: [],
      inputSchema: {}
    });
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewTemplate({
      name: '',
      category: 'Custom',
      description: '',
      steps: [],
      rules: [],
      inputSchema: {}
    });
  };

  if (loading) {
    return (
      <>
        <Navbar title="Templates" />
        <div className="templates-container">
          <div className="loading">Loading templates...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="Workflow Templates" />
      <div className="templates-container">
        {error && <div className="error-message">{error}</div>}

        <div className="templates-header">
          <div className="header-content">
            <button onClick={handleCreateTemplate} className="btn btn-primary btn-small">
              + Create Template
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="create-template-modal">
            <div className="modal-content">
              <h3>Create New Template</h3>
              <div className="form-group">
                <label>Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this template does"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="Custom">Custom</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="IT">IT</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Support">Support</option>
                </select>
              </div>
              <div className="form-actions">
                <button onClick={handleSaveTemplate} className="btn btn-primary">
                  Save Template
                </button>
                <button onClick={handleCancelCreate} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="templates-grid">
          {templates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-header">
                <div className="template-icon">{template.icon}</div>
                <div className="template-info">
                  <h3>{template.name}</h3>
                  <span className="template-category">
                    {getCategoryIcon(template.category)} {template.category}
                  </span>
                </div>
              </div>

              <div className="template-description">
                <p>{template.description}</p>
              </div>

              <div className="template-details">
                <div className="template-stats">
                  <span className="stat">
                    <strong>{template.steps.length}</strong> steps
                  </span>
                  <span className="stat">
                    <strong>{template.rules.length}</strong> rules
                  </span>
                </div>
                <div className="template-meta">
                  <span 
                    className="difficulty"
                    style={{ color: getDifficultyColor(template.difficulty) }}
                  >
                    {template.difficulty}
                  </span>
                  <span className="time">⏱️ {template.estimatedTime}</span>
                </div>
              </div>

              <div className="template-preview">
                <h4>Steps Preview:</h4>
                <div className="steps-list">
                  {template.steps.slice(0, 3).map((step, index) => (
                    <div key={index} className="step-preview">
                      <span className="step-number">{index + 1}</span>
                      <span className="step-name">{step.name}</span>
                      <span className="step-type">{step.type}</span>
                    </div>
                  ))}
                  {template.steps.length > 3 && (
                    <div className="more-steps">+{template.steps.length - 3} more steps</div>
                  )}
                </div>
              </div>

              <div className="template-actions">
                <button 
                  onClick={() => handleUseTemplate(template)}
                  className="btn btn-primary"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Templates;
