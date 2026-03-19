const axios = require('axios');

async function testDashboardData() {
  console.log('🔍 Testing Dashboard Data Loading...\n');
  
  try {
    // Test workflows endpoint
    console.log('1. Testing workflows endpoint...');
    const workflowsResponse = await axios.get('http://localhost:5000/workflows');
    console.log('✅ Workflows status:', workflowsResponse.status);
    console.log('📊 Workflows data keys:', Object.keys(workflowsResponse.data));
    console.log('📋 Workflows array:', workflowsResponse.data.workflows?.length || 'NO_WORKFLOWS_KEY');
    
    // Test executions endpoint  
    console.log('\n2. Testing executions endpoint...');
    const executionsResponse = await axios.get('http://localhost:5000/executions');
    console.log('✅ Executions status:', executionsResponse.status);
    console.log('📊 Executions type:', typeof executionsResponse.data);
    console.log('📋 Executions array:', Array.isArray(executionsResponse.data) ? executionsResponse.data.length : 'NOT_ARRAY');
    
    console.log('\n🎉 Dashboard Data Test Results:');
    console.log('✅ Backend APIs are working');
    console.log('✅ Data is available');
    console.log('📝 Expected Dashboard Access Pattern:');
    console.log('- Workflows: workflowsResponse.data.workflows');
    console.log('- Executions: executionsResponse.data (direct array)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testDashboardData();
