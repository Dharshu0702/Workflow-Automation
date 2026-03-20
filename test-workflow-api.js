const axios = require('axios');

async function testWorkflowAPI() {
  try {
    console.log('Testing workflow API...');
    
    // Test getting workflows
    const workflowsResponse = await axios.get('http://localhost:5000/workflows');
    console.log('Workflows response structure:', Object.keys(workflowsResponse.data));
    console.log('Workflows data:', workflowsResponse.data);
    
    if (workflowsResponse.data.workflows) {
      console.log('Found workflows array:', workflowsResponse.data.workflows.length);
      console.log('First workflow:', workflowsResponse.data.workflows[0]);
    } else if (Array.isArray(workflowsResponse.data)) {
      console.log('Direct array response:', workflowsResponse.data.length);
    } else {
      console.log('Unknown response structure');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testWorkflowAPI();
