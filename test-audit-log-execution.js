const axios = require('axios');

async function testWorkflowExecution() {
  try {
    console.log('Testing workflow execution...');
    
    // Get available workflows
    const workflowsResponse = await axios.get('http://localhost:10000/workflows');
    const workflows = workflowsResponse.data;
    
    if (workflows.length === 0) {
      console.log('No workflows found. Creating a test workflow first...');
      
      // Create a test workflow
      const testWorkflow = {
        name: 'Test Audit Log Workflow',
        version: 1,
        is_active: true,
        input_schema: { test: 'string' }
      };
      
      const createResponse = await axios.post('http://localhost:10000/workflows', testWorkflow);
      const workflow = createResponse.data;
      console.log('Created test workflow:', workflow._id);
      
      // Execute the workflow
      console.log('Executing workflow...');
      const executionResponse = await axios.post(
        `http://localhost:10000/executions`,
        { test: 'audit log test data' },
        { params: { triggered_by: 'test-user' } }
      );
      
      console.log('Execution completed:', executionResponse.data);
      
      // Wait a moment and check audit logs
      setTimeout(async () => {
        try {
          console.log('Checking audit logs...');
          const auditResponse = await axios.get('http://localhost:10000/audit-logs');
          const auditLogs = auditResponse.data.auditLogs || auditResponse.data;
          
          console.log('Audit logs found:', auditLogs.length);
          if (auditLogs.length > 0) {
            const lastLog = auditLogs[auditLogs.length - 1];
            console.log('Latest audit log:', {
              execution_id: lastLog.execution_id,
              details: lastLog.details
            });
          }
        } catch (auditError) {
          console.error('Failed to check audit logs:', auditError.message);
        }
      }, 2000);
      
    } else {
      console.log('Found existing workflow:', workflows[0].name);
      console.log('Executing existing workflow...');
      
      const executionResponse = await axios.post(
        `http://localhost:10000/executions`,
        { 
          workflow_id: workflows[0]._id,
          test: 'audit log test data' 
        },
        { params: { triggered_by: 'test-user' } }
      );
      
      console.log('Execution completed:', executionResponse.data);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testWorkflowExecution();
