const axios = require('axios');

async function checkCurrentWorkflowSchema() {
  try {
    console.log('Checking current workflow input schema...');
    
    // Get the existing workflow
    const workflowsResponse = await axios.get('http://localhost:10000/workflows');
    const workflows = workflowsResponse.data;
    
    if (workflows.length === 0) {
      console.log('No workflows found');
      return;
    }
    
    const workflow = workflows[0]; // Use the first workflow
    console.log('Workflow:', workflow.name);
    console.log('Current input schema type:', typeof workflow.input_schema);
    console.log('Input schema:');
    
    const schema = typeof workflow.input_schema === 'string' 
      ? JSON.parse(workflow.input_schema) 
      : workflow.input_schema;
    
    console.log(JSON.stringify(schema, null, 2));
    console.log('\nSchema fields:', Object.keys(schema));
    
  } catch (error) {
    console.error('Failed to check workflow schema:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

checkCurrentWorkflowSchema();
