const mongoose = require('mongoose');

// Import models
const Rule = require('./models/Rule');
const Step = require('./models/Step');
const Execution = require('./models/Execution');
const Workflow = require('./models/Workflow');

async function verifyMigration() {
  try {
    console.log('Verifying step ID migration from ObjectId to String...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://root:root@cluster0.pbazund.mongodb.net/workflow');
    console.log('Connected to MongoDB');

    // Verify Rules collection
    console.log('\n=== Verifying Rules Collection ===');
    const rules = await Rule.find({});
    console.log(`Found ${rules.length} rules`);
    
    let rulesWithNextStepId = 0;
    let rulesWithStepId = 0;
    
    for (const rule of rules) {
      if (rule.next_step_id) {
        rulesWithNextStepId++;
        console.log(`Rule ${rule._id}: next_step_id type = ${typeof rule.next_step_id}, value = ${rule.next_step_id}`);
      }
      
      if (rule.step_id) {
        rulesWithStepId++;
        console.log(`Rule ${rule._id}: step_id type = ${typeof rule.step_id}, value = ${rule.step_id}`);
      }
    }
    
    console.log(`Rules with next_step_id: ${rulesWithNextStepId}`);
    console.log(`Rules with step_id: ${rulesWithStepId}`);

    // Verify Executions collection
    console.log('\n=== Verifying Executions Collection ===');
    const executions = await Execution.find({});
    console.log(`Found ${executions.length} executions`);
    
    let executionsWithCurrentStepId = 0;
    
    for (const execution of executions) {
      if (execution.current_step_id) {
        executionsWithCurrentStepId++;
        console.log(`Execution ${execution._id}: current_step_id type = ${typeof execution.current_step_id}, value = ${execution.current_step_id}`);
      }
    }
    
    console.log(`Executions with current_step_id: ${executionsWithCurrentStepId}`);

    // Verify Workflows collection
    console.log('\n=== Verifying Workflows Collection ===');
    const workflows = await Workflow.find({});
    console.log(`Found ${workflows.length} workflows`);
    
    let workflowsWithStartStepId = 0;
    
    for (const workflow of workflows) {
      if (workflow.start_step_id) {
        workflowsWithStartStepId++;
        console.log(`Workflow ${workflow._id}: start_step_id type = ${typeof workflow.start_step_id}, value = ${workflow.start_step_id}`);
      }
    }
    
    console.log(`Workflows with start_step_id: ${workflowsWithStartStepId}`);

    console.log('\n=== Migration Verification Completed ===');
    console.log('All step IDs should now be strings');
    
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the verification
verifyMigration();
