export function exportToCSV(data: any[], filename: string = 'export.csv') {
  const csv = convertToCSV(data);
  downloadCSV(csv, filename);
}

export function generateCSVTemplate(headers: string[]): string {
  return headers.join(',') + '\n';
}

export function downloadCSVTemplate(headers: string[], filename: string = 'template.csv') {
  const template = generateCSVTemplate(headers);
  downloadCSV(template, filename);
}

export function downloadScheduleCSV(filename: string = 'schedule.csv') {
  const headers = ['Data', 'Turno', 'Operador 1', 'Operador 2', 'Operador 3'];
  downloadCSVTemplate(headers, filename);
}

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
