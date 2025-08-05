export interface InvoiceFormatValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateInvoiceFormat = (format: string): InvoiceFormatValidationResult => {
  if (!format || format.trim() === "") {
    return {
      isValid: false,
      error: "Invoice format is required",
    };
  }

  // Valid variables
  const validVariables = ["{number}", "{year}", "{y}", "{month}", "{m}", "{day}", "{clientCode}"];

  // Find all variables in the format
  const variablePattern = /\{([^}]+)\}/g;
  const matches = format.match(variablePattern) || [];

  // Check for invalid variables
  for (const match of matches) {
    if (!validVariables.includes(match)) {
      return {
        isValid: false,
        error: `Invalid variable: ${match}. Valid variables are: ${validVariables.join(", ")}`,
      };
    }
  }

  return {
    isValid: true,
  };
};

export const generateInvoiceNumber = (
  format: string,
  counter: number = 1,
  date: Date = new Date(),
  clientCode: string = ""
): string => {
  // Add null safety check
  if (!format) {
    return "";
  }

  let preview = format;

  // Replace {number} with counter (no padding)
  preview = preview.replace("{number}", String(counter));

  // Replace date variables
  preview = preview.replace("{year}", date.getFullYear().toString());
  preview = preview.replace("{y}", String(date.getFullYear() % 100).padStart(2, "0"));
  preview = preview.replace("{month}", String(date.getMonth() + 1).padStart(2, "0"));
  preview = preview.replace("{m}", date.toLocaleString("en", { month: "short" }));
  preview = preview.replace("{day}", String(date.getDate()).padStart(2, "0"));

  // Replace client code variable
  preview = preview.replace("{clientCode}", clientCode);

  return preview;
};
