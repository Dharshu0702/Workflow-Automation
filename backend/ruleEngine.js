// Rule Engine for evaluating dynamic conditions

class RuleEngine {
  /**
   * Evaluate a rule condition with workflow data
   * Supports:
   * - Comparison operators: ==, !=, <, >, <=, >=
   * - Logical operators: && (and), || (or)
   * - String functions: contains(), startsWith(), endsWith()
   */
  static evaluateCondition(condition, data) {
    try {
      // Create a safe evaluation context with data variables
      const context = { ...data };

      // Helper functions for string operations
      const contains = (field, value) => {
        const fieldValue = context[field];
        return fieldValue && String(fieldValue).includes(value);
      };

      const startsWith = (field, value) => {
        const fieldValue = context[field];
        return fieldValue && String(fieldValue).startsWith(value);
      };

      const endsWith = (field, value) => {
        const fieldValue = context[field];
        return fieldValue && String(fieldValue).endsWith(value);
      };

      // Create evaluation function with context and helper functions
      const evaluationFunc = new Function(
        ...Object.keys(context),
        'contains',
        'startsWith',
        'endsWith',
        `return ${condition}`
      );

      const result = evaluationFunc(
        ...Object.values(context),
        contains,
        startsWith,
        endsWith
      );

      return Boolean(result);
    } catch (error) {
      return false;
    }
  }

  /**
   * Evaluate all rules for a step and return the first matching rule by priority
   */
  static async evaluateRules(rules, data, stepId) {
    const evaluatedRules = [];
    let selectedRule = null;
    let defaultRule = null;

    // Sort rules by priority (lowest first)
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      // Skip DEFAULT rule in initial evaluation - handle it separately
      if (rule.condition === 'DEFAULT') {
        defaultRule = rule;
        continue;
      }

      const isMatched = this.evaluateCondition(rule.condition, data);
      evaluatedRules.push({
        rule_id: rule._id,
        condition: rule.condition,
        priority: rule.priority,
        matched: isMatched
      });

      // Select the first matching rule
      if (isMatched && !selectedRule) {
        selectedRule = rule;
      }
    }

    // If no rule matched and we have a DEFAULT rule, use it
    if (!selectedRule && defaultRule) {
      selectedRule = defaultRule;
      evaluatedRules.push({
        rule_id: defaultRule._id,
        condition: 'DEFAULT',
        priority: defaultRule.priority,
        matched: true
      });
    } else if (defaultRule) {
      // If other rules were evaluated, add DEFAULT rule as unmatched
      evaluatedRules.push({
        rule_id: defaultRule._id,
        condition: 'DEFAULT',
        priority: defaultRule.priority,
        matched: false
      });
    }

    return {
      evaluatedRules,
      selectedRule,
      selectedNextStepId: selectedRule ? selectedRule.next_step_id : null
    };
  }
}

module.exports = RuleEngine;