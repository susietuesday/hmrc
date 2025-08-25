// Function to get current UK tax year start and end
export function getTaxYearBounds() {
  const today = new Date();
  const year = today.getFullYear();
  let start, end;

  if (today.getMonth() + 1 >= 4 && today.getDate() >= 6) {
    // After 6 April: current tax year started this year
    start = new Date(year, 3, 6); // 6 April
    end = new Date(year + 1, 3, 5); // 5 April next year
  } else {
    // Before 6 April: still in previous tax year
    start = new Date(year - 1, 3, 6);
    end = new Date(year, 3, 5);
  }

  return { start, end };
};

export function validateCsvContent(content, allowedCategories, errors) {
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
  validateRows(headers, lines, allowedCategories, errors);
}

export function validateRows(headers, lines, allowedCategories, errors) {
  const dateIndex = headers.indexOf('date');
  const amountIndex = headers.indexOf('amount');
  const categoryIndex = headers.indexOf('category');
  const { start, end } = getTaxYearBounds();

  for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      if (row.length < 2) continue;

      const dateVal = row[dateIndex]?.trim();
      const amountVal = parseAmount(row[amountIndex]?.trim());
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
};

export function parseAmount(amountStr) {
  if (!amountStr) return 0;

  // Remove £, commas, spaces
  const cleaned = amountStr.replace(/[^0-9.-]+/g, '');

  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}