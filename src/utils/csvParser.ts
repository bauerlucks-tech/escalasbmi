import { ScheduleEntry } from '@/data/scheduleData';

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: ScheduleEntry[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    unknownEmployees: string[];
  };
}

export interface CSVRow {
  date: string;
  dayOfWeek: string;
  meioPeriodo: string;
  fechamento: string;
}

const DAYS_OF_WEEK = [
  'DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 
  'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'
];

const DAYS_OF_WEEK_SHORT = [
  'DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'SÁB'
];

// Expected CSV columns (case-insensitive)
const EXPECTED_COLUMNS = ['data', 'dia_semana', 'posto', 'colaborador'];
const ALTERNATE_COLUMNS: Record<string, string[]> = {
  data: ['data', 'date', 'dia'],
  dia_semana: ['dia_semana', 'dia_da_semana', 'dayofweek', 'day'],
  posto: ['posto', 'turno', 'shift', 'position', 'periodo'],
  colaborador: ['colaborador', 'nome', 'employee', 'name', 'operador']
};

export function parseCSVContent(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  return lines.map(line => {
    // Handle quoted values with commas
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === ';') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    
    return result.map(cell => cell.replace(/^"|"$/g, '').trim());
  });
}

export function normalizeColumnName(name: string): string {
  const normalized = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Find matching standard column
  for (const [standard, alternatives] of Object.entries(ALTERNATE_COLUMNS)) {
    if (alternatives.some(alt => normalized.includes(alt.replace('_', '')))) {
      return standard;
    }
  }
  
  return normalized;
}

export function normalizeDayOfWeek(day: string): string {
  const upper = day.toUpperCase().trim();
  
  // Check full names
  if (DAYS_OF_WEEK.includes(upper)) {
    return upper;
  }
  
  // Check short names and convert to full
  const shortIndex = DAYS_OF_WEEK_SHORT.findIndex(d => upper.startsWith(d));
  if (shortIndex !== -1) {
    return DAYS_OF_WEEK[shortIndex];
  }
  
  // Try to normalize accents
  const normalized = upper
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  const fullNormalized = DAYS_OF_WEEK.map(d => 
    d.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  );
  
  const index = fullNormalized.findIndex(d => d === normalized);
  if (index !== -1) {
    return DAYS_OF_WEEK[index];
  }
  
  return upper;
}

export function normalizeDate(dateStr: string, month: number, year: number): string {
  // Remove any leading/trailing whitespace
  dateStr = dateStr.trim();
  
  // Try to parse different date formats
  // Format: DD/MM/YYYY or DD-MM-YYYY
  let match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const m = match[2].padStart(2, '0');
    const y = match[3].length === 2 ? '20' + match[3] : match[3];
    return `${day}/${m}/${y}`;
  }
  
  // Format: YYYY-MM-DD or YYYY/MM/DD
  match = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (match) {
    const day = match[3].padStart(2, '0');
    const m = match[2].padStart(2, '0');
    return `${day}/${m}/${match[1]}`;
  }
  
  // Format: DD (just the day number)
  match = dateStr.match(/^(\d{1,2})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const m = String(month).padStart(2, '0');
    return `${day}/${m}/${year}`;
  }
  
  return dateStr;
}

export function validateAndParseCSV(
  content: string, 
  registeredEmployees: string[],
  targetMonth: number,
  targetYear: number
): CSVValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: ScheduleEntry[] = [];
  const unknownEmployees: string[] = [];
  const parsedRows: Map<string, { meioPeriodo?: string; fechamento?: string; dayOfWeek?: string }> = new Map();
  
  // Normalize registered employees for comparison
  const normalizedEmployees = registeredEmployees.map(e => e.toUpperCase().trim());
  
  const rows = parseCSVContent(content);
  
  if (rows.length < 2) {
    return {
      isValid: false,
      errors: ['Arquivo CSV vazio ou sem dados'],
      warnings: [],
      data: [],
      stats: { totalRows: 0, validRows: 0, invalidRows: 0, unknownEmployees: [] }
    };
  }
  
  // Parse header
  const headerRow = rows[0];
  const columnMap: Record<string, number> = {};
  
  headerRow.forEach((col, index) => {
    const normalized = normalizeColumnName(col);
    if (EXPECTED_COLUMNS.includes(normalized)) {
      columnMap[normalized] = index;
    }
  });
  
  // Validate required columns
  const missingColumns = EXPECTED_COLUMNS.filter(col => columnMap[col] === undefined);
  if (missingColumns.length > 0) {
    errors.push(`Colunas obrigatórias não encontradas: ${missingColumns.join(', ')}`);
    errors.push(`Formato esperado: data, dia_semana, posto, colaborador`);
    errors.push(`Colunas encontradas: ${headerRow.join(', ')}`);
    return {
      isValid: false,
      errors,
      warnings: [],
      data: [],
      stats: { totalRows: rows.length - 1, validRows: 0, invalidRows: rows.length - 1, unknownEmployees: [] }
    };
  }
  
  let validRows = 0;
  let invalidRows = 0;
  
  // Process data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    
    if (row.length < 4 || row.every(cell => !cell)) {
      // Skip empty rows
      continue;
    }
    
    const dateStr = row[columnMap.data] || '';
    const dayOfWeekStr = row[columnMap.dia_semana] || '';
    const postoStr = (row[columnMap.posto] || '').toUpperCase().trim();
    const colaboradorStr = (row[columnMap.colaborador] || '').toUpperCase().trim();
    
    // Validate date
    const normalizedDate = normalizeDate(dateStr, targetMonth, targetYear);
    if (!normalizedDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      errors.push(`Linha ${rowNum}: Data inválida "${dateStr}"`);
      invalidRows++;
      continue;
    }
    
    // Validate day of week
    const normalizedDayOfWeek = normalizeDayOfWeek(dayOfWeekStr);
    if (!DAYS_OF_WEEK.includes(normalizedDayOfWeek)) {
      warnings.push(`Linha ${rowNum}: Dia da semana não reconhecido "${dayOfWeekStr}"`);
    }
    
    // Validate posto (must be meio_periodo or fechamento)
    const postoNormalized = postoStr
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]/g, '');
    
    let posto: 'meioPeriodo' | 'fechamento' | null = null;
    if (['MEIOPERIODO', 'MEIO', 'MANHA', 'TARDE', 'MP', 'M'].includes(postoNormalized)) {
      posto = 'meioPeriodo';
    } else if (['FECHAMENTO', 'NOITE', 'FECH', 'F', 'N'].includes(postoNormalized)) {
      posto = 'fechamento';
    } else {
      errors.push(`Linha ${rowNum}: Posto inválido "${postoStr}". Use: meio_periodo, fechamento`);
      invalidRows++;
      continue;
    }
    
    // Validate employee
    if (!colaboradorStr) {
      errors.push(`Linha ${rowNum}: Colaborador não informado`);
      invalidRows++;
      continue;
    }
    
    if (!normalizedEmployees.includes(colaboradorStr)) {
      if (!unknownEmployees.includes(colaboradorStr)) {
        unknownEmployees.push(colaboradorStr);
      }
      errors.push(`Linha ${rowNum}: Colaborador "${colaboradorStr}" não está cadastrado no sistema`);
      invalidRows++;
      continue;
    }
    
    // Add to parsed data
    if (!parsedRows.has(normalizedDate)) {
      parsedRows.set(normalizedDate, { dayOfWeek: normalizedDayOfWeek });
    }
    
    const existingEntry = parsedRows.get(normalizedDate)!;
    existingEntry[posto] = colaboradorStr;
    existingEntry.dayOfWeek = normalizedDayOfWeek;
    
    validRows++;
  }
  
  // Convert map to array
  parsedRows.forEach((entry, date) => {
    if (entry.meioPeriodo && entry.fechamento) {
      data.push({
        date,
        dayOfWeek: entry.dayOfWeek || '',
        meioPeriodo: entry.meioPeriodo,
        fechamento: entry.fechamento
      });
    } else {
      if (!entry.meioPeriodo) {
        warnings.push(`Data ${date}: Meio período não definido`);
      }
      if (!entry.fechamento) {
        warnings.push(`Data ${date}: Fechamento não definido`);
      }
      // Still add entry with available data
      if (entry.meioPeriodo || entry.fechamento) {
        data.push({
          date,
          dayOfWeek: entry.dayOfWeek || '',
          meioPeriodo: entry.meioPeriodo || '',
          fechamento: entry.fechamento || ''
        });
      }
    }
  });
  
  // Sort by date
  data.sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split('/').map(Number);
    const [dayB, monthB, yearB] = b.date.split('/').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Validate date range matches target month
  if (data.length > 0) {
    const firstDate = data[0].date;
    const [, firstMonth, firstYear] = firstDate.split('/').map(Number);
    
    if (firstMonth !== targetMonth || firstYear !== targetYear) {
      warnings.push(`Atenção: As datas no arquivo são de ${firstMonth}/${firstYear}, mas você selecionou ${targetMonth}/${targetYear}`);
    }
  }
  
  return {
    isValid: errors.length === 0 && data.length > 0,
    errors,
    warnings,
    data,
    stats: {
      totalRows: rows.length - 1,
      validRows,
      invalidRows,
      unknownEmployees
    }
  };
}

export function generateCSVTemplate(month: number, year: number): string {
  const daysInMonth = new Date(year, month, 0).getDate();
  const lines = ['data,dia_semana,posto,colaborador'];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
    const dateStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    
    // Add two lines per day (meio período and fechamento)
    lines.push(`${dateStr},${dayOfWeek},meio_periodo,`);
    lines.push(`${dateStr},${dayOfWeek},fechamento,`);
  }
  
  return lines.join('\n');
}

export function downloadCSVTemplate(month: number, year: number): void {
  const content = generateCSVTemplate(month, year);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const monthNames = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 
                      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  
  link.setAttribute('href', url);
  link.setAttribute('download', `escala_${monthNames[month - 1]}_${year}_template.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
