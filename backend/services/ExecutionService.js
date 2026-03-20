const Execution = require('../models/Execution');
const Workflow = require('../models/Workflow');
const Step = require('../models/Step');
const RuleEngine = require('../ruleEngine');
const Rule = require('../models/Rule');

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
    
    return await execution.save();
  }

  static async executeWorkflow(execution_id) {
    const execution = await Execution.findById(execution_id);
    if (!execution) throw new Error('Execution not found');
    
    execution.status = 'in_progress';
    await execution.save();
    
    // Evaluate logic here...
    try {
      if (!execution.current_step_id) {
        execution.status = 'completed';
        execution.ended_at = new Date();
      } else {
        // Find rules for current step and evaluate
        const rules = await Rule.find({ step_id: execution.current_step_id });
        if (rules.length > 0) {
          const evalResult = await RuleEngine.evaluateRules(rules, execution.data, execution.current_step_id);
          execution.current_step_id = evalResult.selectedNextStepId;
          if (!execution.current_step_id) {
             execution.status = 'completed';
             execution.ended_at = new Date();
          }
        } else {
           // No rules, default to complete
           execution.status = 'completed';
           execution.ended_at = new Date();
        }
      }
      await execution.save();
    } catch(err) {
      execution.status = 'failed';
      execution.ended_at = new Date();
      await execution.save();
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
