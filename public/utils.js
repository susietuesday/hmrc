// Import from shared validation
import { validateCsvContent } from '../shared/validation.js';

export function renderTable(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return '<p>No transactions found</p>';
  }

  const headers = Object.keys(data[0]);

  let html = '<table border="1" cellpadding="5"><thead><tr>';
  headers.forEach(h => {
    html += `<th>${h}</th>`;
  });
  html += '</tr></thead><tbody>';

  data.forEach(row => {
    html += '<tr>';
    headers.forEach(h => {
      html += `<td>${row[h]}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
};

export function validateCsv(allowedCategories, document, e) {
  const file = e.target.files[0];
  const errorDiv = document.getElementById('errorMessages');
  errorDiv.innerHTML = '';

  if (!file) return;

  const errors = [];
  
  // 1. File type check
  if (!file.name.endsWith('.csv')) {
    errors.push('File must be a .csv format.');
  }

  // 2. File size check (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB.');
  }

  if (errors.length > 0) {
    errorDiv.innerHTML = errors.join('<br>');
    return;
  }

  // 3. Read file content
  const reader = new FileReader();

  reader.onload = function(event) {
    const content = event.target.result;

    // Validate content of CSV file
    validateCsvContent(content, allowedCategories, errors);

    if (errors.length > 0) {
      errorDiv.innerHTML = errors.join('<br>');
    } else {
      errorDiv.innerHTML = '✅ File looks good!';
      const uploadButton = document.getElementById('uploadIncomeBtn');
      uploadButton.disabled = false; // Enable button if validation passes
    }
  };

  reader.readAsText(file);
};

