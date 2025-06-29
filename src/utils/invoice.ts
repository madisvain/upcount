export interface InvoiceFormatValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateInvoiceFormat = (format: string): InvoiceFormatValidationResult => {
  if (!format || format.trim() === '') {
    return {
      isValid: false,
      error: 'Invoice format is required'
    };
  }

  // Check if format contains {number} variable (required)
  if (!format.includes('{number}')) {
    return {
      isValid: false,
      error: 'Format must contain {number} variable'
    };
  }

  // Valid variables
  const validVariables = ['{number}', '{year}', '{y}', '{month}', '{m}', '{day}'];
  
  // Find all variables in the format
  const variablePattern = /\{([^}]+)\}/g;
  const matches = format.match(variablePattern) || [];
  
  // Check for invalid variables
  for (const match of matches) {
    if (!validVariables.includes(match)) {
      return {
        isValid: false,
        error: `Invalid variable: ${match}. Valid variables are: ${validVariables.join(', ')}`
      };
    }
  }

  return {
    isValid: true
  };
};

export const generateInvoicePreview = (
  format: string, 
  counter: number = 1, 
  date: Date = new Date()
): string => {
  let preview = format;
  
  // Replace {number} with zero-padded counter (5 digits)
  preview = preview.replace('{number}', String(counter).padStart(5, '0'));
  
  // Replace date variables
  preview = preview.replace('{year}', date.getFullYear().toString());
  preview = preview.replace('{y}', String(date.getFullYear() % 100).padStart(2, '0'));
  preview = preview.replace('{month}', String(date.getMonth() + 1).padStart(2, '0'));
  preview = preview.replace('{m}', date.toLocaleString('en', { month: 'short' }));
  preview = preview.replace('{day}', String(date.getDate()).padStart(2, '0'));
  
  return preview;
};