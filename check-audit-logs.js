const axios = require('axios');

async function checkAuditLogs() {
  try {
    console.log('Checking audit logs API...');
    const response = await axios.get('http://localhost:10000/audit-logs');
    const auditLogs = response.data.auditLogs || response.data;
    
    console.log('Audit logs count:', auditLogs.length);
    
    // Sort by timestamp to get the most recent
    const sortedLogs = auditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log('\nAll audit logs (most recent first):');
    sortedLogs.forEach((log, index) => {
      console.log(`\nLog ${index + 1}:`);
      console.log('- Execution ID:', log.execution_id);
      console.log('- Timestamp:', log.timestamp);
      console.log('- Workflow Name:', log.details?.workflow_name);
      console.log('- Start Time:', log.details?.start_time);
      console.log('- End Time:', log.details?.end_time);
      console.log('- Execution Status:', log.details?.execution_status);
      console.log('- Has End Time:', !!log.details?.end_time);
    });
    
    // Find the most recent log with end_time
    const latestWithEndTime = sortedLogs.find(log => log.details?.end_time);
    if (latestWithEndTime) {
      console.log('\n=== LATEST LOG WITH END TIME ===');
      console.log('Execution ID:', latestWithEndTime.execution_id);
      console.log('Start Time:', latestWithEndTime.details?.start_time);
      console.log('End Time:', latestWithEndTime.details?.end_time);
      console.log('Execution Status:', latestWithEndTime.details?.execution_status);
    } else {
      console.log('\n=== NO LOGS FOUND WITH END TIME ===');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAuditLogs();
