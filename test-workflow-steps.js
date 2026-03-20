const axios = require('axios');

async function testWorkflowSteps() {
  try {
    console.log('Testing workflow steps API...');
    
    // Test getting workflows first
    const workflowsResponse = await axios.get('http://localhost:5000/workflows');
    console.log('Workflows:', workflowsResponse.data);
    
    if (workflowsResponse.data.workflows && workflowsResponse.data.workflows.length > 0) {
      const workflow = workflowsResponse.data.workflows[0];
      console.log('Testing workflow:', workflow._id, workflow.name);
      
      // Test getting steps for this workflow
      const stepsResponse = await axios.get(`http://localhost:5000/workflows/${workflow._id}/steps`);
      console.log('Steps response:', stepsResponse.data);
      console.log('Steps count:', stepsResponse.data.length);
      
      // Test getting a specific step
      if (stepsResponse.data.length > 0) {
        const step = stepsResponse.data[0];
        console.log('Testing specific step:', step._id, step.name);
        
        const stepResponse = await axios.get(`http://localhost:5000/steps/${step._id}`);
        console.log('Step response:', stepResponse.data);
      }
    } else {
      console.log('No workflows found');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testWorkflowSteps();
