import api from './api';

export const ExecutionService = {
  // Create & Execute workflow in one call
  executeWorkflow: (workflowId, data, triggeredBy) => {
    // Add workflow_id to the data payload
    const payload = {
      ...data,
      workflow_id: workflowId
    };
    return api.post(`/executions`, payload, { params: { triggered_by: triggeredBy || 'user' } });
  },
  
  // Get execution details
  getExecution: (id) => api.get(`/executions/${id}`),
  
  // List executions
  getExecutions: (workflowId) => 
    api.get('/executions', { params: { workflow_id: workflowId } }),
  
  // Cancel execution
  cancelExecution: (id) => api.post(`/executions/${id}/cancel`),
  
  // Retry execution
  retryExecution: (id) => api.post(`/executions/${id}/retry`)
};

export default ExecutionService;