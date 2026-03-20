const axios = require('axios');

async function updateWorkflowWithUserFriendlySchema() {
  try {
    console.log('Updating workflow with user-friendly input schema...');
    
    // Get the existing workflow
    const workflowsResponse = await axios.get('http://localhost:10000/workflows');
    const workflows = workflowsResponse.data;
    
    if (workflows.length === 0) {
      console.log('No workflows found');
      return;
    }
    
    const workflow = workflows[0]; // Use the first workflow
    console.log('Updating workflow:', workflow.name);
    
    // Define a user-friendly input schema
    const userFriendlySchema = {
      employeeName: {
        type: "string",
        title: "Employee Name",
        description: "Enter the full name of the employee",
        required: true,
        minLength: 2,
        maxLength: 100
      },
      employeeEmail: {
        type: "string",
        title: "Employee Email",
        description: "Enter the employee's email address",
        required: true,
        format: "email"
      },
      department: {
        type: "string",
        title: "Department",
        description: "Select the department",
        required: true,
        enum: ["Engineering", "Sales", "Marketing", "HR", "Finance"],
        default: "Engineering"
      },
      expenseAmount: {
        type: "number",
        title: "Expense Amount",
        description: "Enter the expense amount in USD",
        required: true,
        minimum: 0,
        maximum: 10000,
        default: 0
      },
      expenseCategory: {
        type: "string",
        title: "Expense Category",
        description: "Select the expense category",
        required: true,
        enum: ["Travel", "Meals", "Office Supplies", "Training", "Equipment"],
        default: "Travel"
      },
      expenseDescription: {
        type: "string",
        title: "Expense Description",
        description: "Provide a detailed description of the expense",
        required: true,
        minLength: 10,
        maxLength: 500,
        format: "textarea"
      },
      expenseDate: {
        type: "string",
        title: "Expense Date",
        description: "Date when the expense was incurred",
        required: true,
        format: "date"
      },
      requiresApproval: {
        type: "boolean",
        title: "Requires Manager Approval",
        description: "Check if this expense requires manager approval",
        default: true
      },
      receiptAttached: {
        type: "boolean",
        title: "Receipt Attached",
        description: "Confirm that a receipt is attached",
        default: false
      },
      tags: {
        type: "array",
        title: "Tags",
        description: "Add relevant tags for this expense",
        items: {
          type: "string"
        },
        enum: ["Urgent", "Recurring", "Client-Billable", "Team-Building", "Emergency"],
        default: []
      },
      managerNotes: {
        type: "string",
        title: "Manager Notes",
        description: "Additional notes for the manager (optional)",
        maxLength: 300,
        format: "textarea"
      }
    };
    
    // Update the workflow with the new schema
    const updateResponse = await axios.put(
      `http://localhost:10000/workflows/${workflow._id}`,
      {
        input_schema: userFriendlySchema
      }
    );
    
    console.log('Workflow updated successfully!');
    console.log('Updated workflow:', updateResponse.data.name);
    console.log('Input schema now has', Object.keys(userFriendlySchema).length, 'fields');
    
    // Display the schema
    console.log('\n=== New Input Schema ===');
    Object.entries(userFriendlySchema).forEach(([fieldName, fieldSchema]) => {
      console.log(`${fieldSchema.title || fieldName} (${fieldSchema.type})`);
      console.log(`  Required: ${fieldSchema.required || false}`);
      console.log(`  Description: ${fieldSchema.description || 'No description'}`);
      if (fieldSchema.enum) {
        console.log(`  Options: ${fieldSchema.enum.join(', ')}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('Failed to update workflow:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

updateWorkflowWithUserFriendlySchema();
