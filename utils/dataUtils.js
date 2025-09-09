const streamifier = require('streamifier');
const csv = require('csv-parser');
const { Readable } = require('stream');

// This function processes a CSV file buffer and extracts required columns.
async function parseCsvBuffer(buffer, requiredColumns) {
  const results = [];

  const stream = streamifier.createReadStream(buffer).pipe(csv());

  for await (const row of stream) {
    const cleanedRow = {};

    requiredColumns.forEach(col => {
      if (row[col] !== undefined) {
        cleanedRow[col] = row[col];
      } else {
        console.warn(`Missing column "${col}" in row:`, row);
      }
    });

    results.push(cleanedRow);
  }

  return results;
}

// Helper to include a property only if the value is defined
function optionalProp(value, key) {
  if (value === undefined || value === null) return {};
  return { [key]: value };
}

// Helper for nested objects
function optionalNested(valueObj, key) {
  if (!valueObj || Object.keys(valueObj).length === 0) return {};
  return { [key]: valueObj };
}

// Returns row and column indexes for specified spreadsheet cell
function getCell(data, ref) {
  const col = ref.match(/[A-Z]+/)[0];
  const row = parseInt(ref.match(/\d+/)[0]) - 1;
  const colIndex = col.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0) - 1;
  return data[row][colIndex];
}

// Helper: only add the key if value is not null/empty
function addValue(obj, key, value) {
  // Convert value to string only if it exists
  const strValue = (typeof value === 'string') ? value.toUpperCase() : '';

  if (
    value !== undefined &&
    value !== null &&
    value !== '' &&
    strValue !== 'NOT APPLICABLE'
  ) {
    const keys = key.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}; // Create nested object if missing
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }
}

async function readBuffer(buffer) {
  const results = [];

  const stream = Readable.from(buffer.toString()).pipe(csv({ headers: false }));

  for await (const row of stream) {
    results.push(row);
  }

  return results;
};

module.exports = { 
  parseCsvBuffer,
  optionalProp,
  optionalNested,
  getCell,
  addValue,
  readBuffer
};