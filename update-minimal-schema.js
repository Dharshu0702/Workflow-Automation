const axios = require('axios');

async function updateWorkflowWithMinimalSchema() {
  try {
    console.log('Updating workflow with minimal input schema...');
    
    // Get the existing workflow
    const workflowsResponse = await axios.get('http://localhost:10000/workflows');
    const workflows = workflowsResponse.data;
    
    if (workflows.length === 0) {
      console.log('No workflows found');
      return;
    }
    
    const workflow = workflows[0]; // Use the first workflow
    console.log('Updating workflow:', workflow.name);
    
    // Define a minimal input schema with only essential fields
    const minimalSchema = {
      amount: {
        type: "number",
        title: "Amount",
        description: "Enter the amount",
        required: true,
        minimum: 0,
        default: 0
      },
      category: {
        type: "string", 
        title: "Category",
        description: "Select category",
        required: true,
        enum: ["Travel", "Meals", "Office Supplies"],
        default: "Travel"
      },
      description: {
        type: "string",
        title: "Description", 
        description: "Enter description",
        required: true,
        minLength: 5,
        maxLength: 200,
        default: ""
      }
    };
    
    // Update the workflow with the minimal schema
    const updateResponse = await axios.put(
      `http://localhost:10000/workflows/${workflow._id}`,
      {
        input_schema: minimalSchema
      }
    );
    
    console.log('Workflow updated successfully!');
    console.log('Updated workflow:', updateResponse.data.name);
    console.log('Input schema now has', Object.keys(minimalSchema).length, 'fields');
    
    // Display the new schema
    console.log('\n=== New Minimal Input Schema ===');
    Object.entries(minimalSchema).forEach(([fieldName, fieldSchema]) => {
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

updateWorkflowWithMinimalSchema();
