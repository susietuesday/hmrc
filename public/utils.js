// Import from shared validation
import { getTaxYearBounds } from '../shared/validation.js';

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
  const { start, end } = getTaxYearBounds();

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
        const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length < 2) {
            errors.push('File must contain at least one data row.');
        }

        // Check headers
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        if (!headers.includes('date') || !headers.includes('amount')) {
            errors.push('File must include "Date" and "Amount" columns.');
        }

        // Validate rows
        const dateIndex = headers.indexOf('date');
        const amountIndex = headers.indexOf('amount');
        const categoryIndex = headers.indexOf('category');

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            if (row.length < 2) continue;

            const dateVal = row[dateIndex]?.trim();
            const amountVal = row[amountIndex]?.trim();
            const categoryVal = categoryIndex !== -1 ? row[categoryIndex]?.trim() : null;

            // Check for valid date
            const date = new Date(dateVal);
            if (isNaN(date.getTime())) {
              errors.push(`Row ${i + 1}: Invalid date.`);
            } else if (date < start || date > end) {
              errors.push(
                `Row ${i + 1}: Date "${dateVal}" is outside the current tax year (${start.toLocaleDateString()} - ${end.toLocaleDateString()}).`
              );
            }

            // Check for numeric amount
            if (isNaN(parseFloat(amountVal))) {
                errors.push(`Row ${i + 1}: Amount must be numeric.`);
            }

            // If category column exists, validate its value
            const allowedCategoriesLower = allowedCategories.map(c => c.toLowerCase());

            if (categoryVal && !allowedCategoriesLower.includes(categoryVal.toLowerCase())) {
              errors.push(`Row ${i + 1}: Invalid category "${categoryVal}".`);
            }
        }

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

