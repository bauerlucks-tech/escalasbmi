export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: any[];
}

export function validateCSV(data: any[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Dados inválidos: esperado array');
    return { valid: false, errors, warnings };
  }

  if (data.length === 0) {
    warnings.push('CSV vazio');
    return { valid: true, errors, warnings, data: [] };
  }

  // Basic validation
  data.forEach((row, index) => {
    if (!row || typeof row !== 'object') {
      errors.push(`Linha ${index + 1}: formato inválido`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data
  };
}

export function validateAndParse(csvContent: string): ValidationResult {
  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return { valid: true, errors: [], warnings: ['CSV vazio'], data: [] };
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return validateCSV(data);
  } catch (error) {
    return {
      valid: false,
      errors: ['Erro ao processar CSV: ' + (error as Error).message],
      warnings: [],
      data: []
    };
  }
}

export function validateAndParseCSV(csvContent: string): ValidationResult {
  return validateAndParse(csvContent);
}
