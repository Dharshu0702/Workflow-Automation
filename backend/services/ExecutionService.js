const Execution = require('../models/Execution');
const Workflow = require('../models/Workflow');
const Step = require('../models/Step');
const RuleEngine = require('../ruleEngine');
const Rule = require('../models/Rule');
const AuditLog = require('../models/AuditLog');

class ExecutionService {
  static async createExecution(workflow_id, data, triggered_by = 'system') {
    const workflow = await Workflow.findById(workflow_id);
    if (!workflow) throw new Error('Workflow not found');

    const execution = new Execution({
      workflow_id,
      workflow_version: workflow.version,
      status: 'pending',
      data: data || {},
      logs: {},
      current_step_id: workflow.start_step_id,
      triggered_by
    });
    
    const savedExecution = await execution.save();
    
    // Create audit log entry
    try {
      await AuditLog.create({
        execution_id: savedExecution._id,
        workflow_id: workflow_id,
        action: 'workflow_executed',
        actor: triggered_by || 'system',
        timestamp: new Date(),
        details: {
          workflow_name: workflow.name,
          workflow_version: workflow.version,
          workflow_status: workflow.is_active ? 'active' : 'inactive',
          triggered_by: triggered_by || 'system',
          execution_id: savedExecution._id,
          start_time: savedExecution.started_at,
          end_time: savedExecution.ended_at,
          execution_status: savedExecution.status
        }
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Don't fail the execution if audit log creation fails
    }
    
    return savedExecution;
  }

  static async executeWorkflow(execution_id) {
    const execution = await Execution.findById(execution_id);
    if (!execution) throw new Error('Execution not found');
    
    execution.status = 'in_progress';
    await execution.save();
    
    // Initialize logs if not exists
    if (!execution.logs) {
      execution.logs = [];
    }
    
    // Evaluate logic here...
    try {
      if (!execution.current_step_id) {
        execution.status = 'completed';
        execution.ended_at = new Date();
        
        // Add completion log
        execution.logs.push({
          step_name: 'Workflow Completion',
          step_type: 'completion',
          status: 'completed',
          timestamp: new Date(),
          evaluated_rules: [],
          selected_next_step: null,
          rule_evaluation_summary: 'No more steps to execute'
        });
      } else {
        // Find rules for current step and evaluate
        const rules = await Rule.find({ step_id: execution.current_step_id });
        if (rules.length > 0) {
          const evalResult = await RuleEngine.evaluateRules(rules, execution.data, execution.current_step_id);
          
          // Create detailed rule evaluation log
          const ruleEvaluationSummary = evalResult.evaluatedRules.map(rule => ({
            condition: rule.condition,
            result: rule.matched ? 'TRUE' : 'FALSE',
            priority: rule.priority,
            selected: rule.rule_id === evalResult.selectedRule?._id
          }));
          
          // Find step name for logging
          const currentStep = await Step.findById(execution.current_step_id);
          const stepName = currentStep ? currentStep.name : 'Unknown Step';
          
          // Add step execution log
          execution.logs.push({
            step_id: execution.current_step_id,
            step_name: stepName,
            step_type: currentStep ? currentStep.step_type : 'unknown',
            status: 'completed',
            timestamp: new Date(),
            evaluated_rules: evalResult.evaluatedRules,
            selected_next_step: evalResult.selectedNextStepId,
            selected_rule: evalResult.selectedRule,
            rule_evaluation_summary: ruleEvaluationSummary,
            input_data: execution.data
          });
          
          execution.current_step_id = evalResult.selectedNextStepId;
          if (!execution.current_step_id) {
             execution.status = 'completed';
             execution.ended_at = new Date();
          }
        } else {
           // No rules, default to complete
           const currentStep = await Step.findById(execution.current_step_id);
           const stepName = currentStep ? currentStep.name : 'Unknown Step';
           
           execution.logs.push({
             step_id: execution.current_step_id,
             step_name: stepName,
             step_type: currentStep ? currentStep.step_type : 'unknown',
             status: 'completed',
             timestamp: new Date(),
             evaluated_rules: [],
             selected_next_step: null,
             rule_evaluation_summary: 'No rules found for this step',
             input_data: execution.data
           });
           
           execution.status = 'completed';
           execution.ended_at = new Date();
        }
      }
      await execution.save();
      
      // Update audit log with end time
      try {
        console.log('Updating audit log for execution:', execution_id);
        console.log('Execution ended_at:', execution.ended_at);
        console.log('Execution status:', execution.status);
        
        const updatedAuditLog = await AuditLog.findOneAndUpdate(
          { execution_id: execution_id },
          { 
            $set: {
              'details.end_time': execution.ended_at,
              'details.execution_status': execution.status
            }
          },
          { new: true }
        );
        
        console.log('Audit log updated successfully:', updatedAuditLog);
      } catch (auditError) {
        console.error('Failed to update audit log with end time:', auditError);
      }
      
    } catch(err) {
      execution.status = 'failed';
      execution.ended_at = new Date();
      
      // Add error log
      execution.logs.push({
        step_name: 'Error',
        step_type: 'error',
        status: 'failed',
        timestamp: new Date(),
        evaluated_rules: [],
        selected_next_step: null,
        rule_evaluation_summary: `Execution failed: ${err.message}`,
        error_message: err.message
      });
      
      await execution.save();
      
      // Update audit log with failure status
      try {
        await AuditLog.findOneAndUpdate(
          { execution_id: execution_id },
          { 
            $set: {
              'details.end_time': execution.ended_at,
              'details.execution_status': execution.status
            }
          },
          { new: true }
        );
      } catch (auditError) {
        console.error('Failed to update audit log with failure status:', auditError);
      }
    }
    return execution;
  }

  static async getExecution(id) {
    return await Execution.findById(id).populate('current_step_id');
  }

  static async getExecutions(workflow_id) {
    const query = workflow_id ? { workflow_id } : {};
    return await Execution.find(query).sort({ started_at: -1 });
  }

  static async cancelExecution(id) {
    const execution = await Execution.findById(id);
    if (!execution) throw new Error('Execution not found');
    execution.status = 'canceled';
    execution.ended_at = new Date();
    return await execution.save();
  }

  static async retryExecution(id) {
    const execution = await Execution.findById(id);
    if (!execution) throw new Error('Execution not found');
    if (execution.status !== 'failed') throw new Error('Can only retry failed executions');
    
    execution.status = 'pending';
    execution.retries += 1;
    execution.ended_at = null;
    return await execution.save();
  }
}

module.exports = ExecutionService;
