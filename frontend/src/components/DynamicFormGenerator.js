import React from 'react';

const DynamicFormGenerator = ({ schema, onChange, data }) => {
  const handleChange = (fieldName, value) => {
    const updatedData = { ...data, [fieldName]: value };
    onChange(updatedData);
  };

  const renderField = (fieldName, fieldType, fieldSchema) => {
    const value = data[fieldName] || '';
    
    switch (fieldType) {
      case 'string':
        if (fieldSchema.enum) {
          // Dropdown for enum values
          return (
            <select
              value={value}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              className="form-control"
            >
              <option value="">Select {fieldName}</option>
              {fieldSchema.enum.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        } else if (fieldSchema.format === 'email') {
          return (
            <input
              type="email"
              value={value}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={`Enter ${fieldName}`}
              className="form-control"
            />
          );
        } else if (fieldSchema.format === 'date') {
          return (
            <input
              type="date"
              value={value}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              className="form-control"
            />
          );
        } else if (fieldSchema.minLength > 100 || fieldSchema.format === 'textarea') {
          return (
            <textarea
              value={value}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={`Enter ${fieldName}`}
              rows={fieldSchema.rows || 4}
              className="form-control"
            />
          );
        } else {
          return (
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={`Enter ${fieldName}`}
              minLength={fieldSchema.minLength}
              maxLength={fieldSchema.maxLength}
              className="form-control"
            />
          );
        }

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={`Enter ${fieldName}`}
            min={fieldSchema.minimum}
            max={fieldSchema.maximum}
            step={fieldSchema.step || 'any'}
            className="form-control"
          />
        );

      case 'integer':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(fieldName, parseInt(e.target.value) || '')}
            placeholder={`Enter ${fieldName}`}
            min={fieldSchema.minimum}
            max={fieldSchema.maximum}
            className="form-control"
          />
        );

      case 'boolean':
        return (
          <div className="form-check">
            <input
              type="checkbox"
              id={fieldName}
              checked={value}
              onChange={(e) => handleChange(fieldName, e.target.checked)}
              className="form-check-input"
            />
            <label htmlFor={fieldName} className="form-check-label">
              {fieldSchema.title || fieldName}
            </label>
          </div>
        );

      case 'array':
        if (fieldSchema.items && fieldSchema.items.enum) {
          // Multi-select for enum arrays
          const availableOptions = fieldSchema.items.enum;
          return (
            <div className="multi-select">
              {availableOptions.map(option => (
                <div key={option} className="form-check">
                  <input
                    type="checkbox"
                    id={`${fieldName}-${option}`}
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleChange(fieldName, [...currentValues, option]);
                      } else {
                        handleChange(fieldName, currentValues.filter(v => v !== option));
                      }
                    }}
                    className="form-check-input"
                  />
                  <label htmlFor={`${fieldName}-${option}`} className="form-check-label">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          );
        } else {
          // Text input for simple arrays (comma-separated)
          return (
            <input
              type="text"
              value={Array.isArray(value) ? value.join(', ') : value}
              onChange={(e) => {
                const arrayValue = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                handleChange(fieldName, arrayValue);
              }}
              placeholder={`Enter ${fieldName} (comma-separated)`}
              className="form-control"
            />
          );
        }

      case 'object':
        return (
          <div className="object-field">
            <p className="text-muted">Object field: {fieldName}</p>
            <textarea
              value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
              onChange={(e) => {
                try {
                  const parsedValue = JSON.parse(e.target.value);
                  handleChange(fieldName, parsedValue);
                } catch {
                  handleChange(fieldName, e.target.value);
                }
              }}
              placeholder={`Enter ${fieldName} as JSON`}
              rows={4}
              className="form-control"
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={`Enter ${fieldName}`}
            className="form-control"
          />
        );
    }
  };

  const getFieldType = (fieldSchema) => {
    if (fieldSchema.type) {
      return fieldSchema.type;
    }
    if (fieldSchema.enum) {
      return 'string';
    }
    return 'string';
  };

  const getFieldLabel = (fieldName, fieldSchema) => {
    return fieldSchema.title || 
           fieldSchema.description || 
           fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/_/g, ' ');
  };

  const getFieldDescription = (fieldSchema) => {
    return fieldSchema.description || fieldSchema.help;
  };

  const isFieldRequired = (fieldSchema) => {
    return fieldSchema.required || false;
  };

  if (!schema || typeof schema !== 'object' || Object.keys(schema).length === 0) {
    return (
      <div className="alert alert-warning">
        <h4>No Input Schema Defined</h4>
        <p>This workflow doesn't have a defined input schema. Please enter JSON data manually.</p>
        <small>If you're the workflow creator, you can define an input schema during workflow creation to enable dynamic form generation.</small>
      </div>
    );
  }

  return (
    <div className="dynamic-form">
      <div className="form-header">
        <h4>Workflow Input Data</h4>
        <p className="text-muted">
          {Object.keys(schema).length <= 3 
            ? "Fill in the required fields to execute this workflow"
            : "Fill in the required information to execute this workflow"
          }
        </p>
      </div>

      {Object.entries(schema).map(([fieldName, fieldSchema]) => {
        const fieldType = getFieldType(fieldSchema);
        const isRequired = isFieldRequired(fieldSchema);
        const label = getFieldLabel(fieldName, fieldSchema);
        const description = getFieldDescription(fieldSchema);

        return (
          <div key={fieldName} className="form-group">
            <label className={`form-label ${isRequired ? 'required' : ''}`}>
              {label}
              {isRequired && <span className="text-danger">*</span>}
            </label>
            
            {description && (
              <small className="form-text text-muted">{description}</small>
            )}

            {renderField(fieldName, fieldType, fieldSchema)}

            {fieldSchema.example && (
              <small className="form-text text-muted">
                Example: {typeof fieldSchema.example === 'object' 
                  ? JSON.stringify(fieldSchema.example) 
                  : fieldSchema.example}
              </small>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DynamicFormGenerator;
