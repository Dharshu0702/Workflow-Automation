const mongoose = require('mongoose');

// Import models
const Rule = require('./models/Rule');
const Step = require('./models/Step');
const Execution = require('./models/Execution');
const Workflow = require('./models/Workflow');

async function migrateStepIdsToStrings() {
  try {
    console.log('Starting migration of step IDs from ObjectId to String...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://root:root@cluster0.pbazund.mongodb.net/workflow');
    console.log('Connected to MongoDB');

    // Step 1: Migrate Rules collection
    console.log('\n=== Migrating Rules Collection ===');
    const rules = await Rule.find({});
    console.log(`Found ${rules.length} rules to migrate`);
    
    for (const rule of rules) {
      let updated = false;
      
      if (rule.next_step_id && typeof rule.next_step_id !== 'string') {
        // Convert ObjectId to string
        const oldNextStepId = rule.next_step_id;
        rule.next_step_id = rule.next_step_id.toString();
        updated = true;
        console.log(`Rule ${rule._id}: next_step_id ${oldNextStepId} -> ${rule.next_step_id}`);
      }
      
      // Also convert step_id to string
      if (rule.step_id && typeof rule.step_id !== 'string') {
        const oldStepId = rule.step_id;
        rule.step_id = rule.step_id.toString();
        updated = true;
        console.log(`Rule ${rule._id}: step_id ${oldStepId} -> ${rule.step_id}`);
      }
      
      if (updated) {
        await rule.save();
      }
    }

    // Step 2: Migrate Executions collection
    console.log('\n=== Migrating Executions Collection ===');
    const executions = await Execution.find({});
    console.log(`Found ${executions.length} executions to migrate`);
    
    for (const execution of executions) {
      if (execution.current_step_id && typeof execution.current_step_id !== 'string') {
        const oldCurrentStepId = execution.current_step_id;
        execution.current_step_id = execution.current_step_id.toString();
        
        await execution.save();
        console.log(`Execution ${execution._id}: current_step_id ${oldCurrentStepId} -> ${execution.current_step_id}`);
      }
    }

    // Step 3: Migrate Workflows collection
    console.log('\n=== Migrating Workflows Collection ===');
    const workflows = await Workflow.find({});
    console.log(`Found ${workflows.length} workflows to migrate`);
    
    for (const workflow of workflows) {
      if (workflow.start_step_id && typeof workflow.start_step_id !== 'string') {
        const oldStartStepId = workflow.start_step_id;
        workflow.start_step_id = workflow.start_step_id.toString();
        
        await workflow.save();
        console.log(`Workflow ${workflow._id}: start_step_id ${oldStartStepId} -> ${workflow.start_step_id}`);
      }
    }

    console.log('\n=== Migration Completed Successfully ===');
    console.log('All step IDs have been converted from ObjectId to String');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateStepIdsToStrings();
