const axios = require('axios');

async function testSpecificWorkflow() {
  try {
    console.log('Testing specific workflow with steps...');
    
    // Test the workflow that has start_step_id
    const workflowId = '69bcaaf17d852df34cd040db'; // This one has start_step_id
    console.log('Testing workflow:', workflowId);
    
    // Test getting steps for this workflow
    const stepsResponse = await axios.get(`http://localhost:5000/workflows/${workflowId}/steps`);
    console.log('Steps response:', stepsResponse.data);
    console.log('Steps count:', stepsResponse.data.length);
    
    if (stepsResponse.data.length > 0) {
      const step = stepsResponse.data[0];
      console.log('Testing specific step:', step._id, step.name);
      
      const stepResponse = await axios.get(`http://localhost:5000/steps/${step._id}`);
      console.log('Step response:', stepResponse.data);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSpecificWorkflow();
