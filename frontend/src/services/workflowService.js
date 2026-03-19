import api from './api';

export const WorkflowService = {
  // Workflows
  createWorkflow: (data) => api.post('/workflows', data),
  getWorkflows: () => api.get('/workflows'),
  getWorkflowById: (id) => api.get(`/workflows/${id}`),
  updateWorkflow: (id, data) => api.put(`/workflows/${id}`, data),
  deleteWorkflow: (id) => api.delete(`/workflows/${id}`),

  // Steps
  createStep: (workflowId, data) => api.post(`/workflows/${workflowId}/steps`, data),
  getSteps: (workflowId) => api.get(`/workflows/${workflowId}/steps`),
  updateStep: (stepId, data) => api.put(`/steps/${stepId}`, data),
  deleteStep: (stepId) => api.delete(`/steps/${stepId}`),

  // Rules
  createRule: (stepId, data) => api.post(`/steps/${stepId}/rules`, data),
  getRules: (stepId) => api.get(`/steps/${stepId}/rules`),
  updateRule: (ruleId, data) => api.put(`/rules/${ruleId}`, data),
  deleteRule: (ruleId) => api.delete(`/rules/${ruleId}`)
};

export default WorkflowService;