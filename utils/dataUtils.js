const streamifier = require('streamifier');
const csv = require('csv-parser');

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

module.exports = { 
  parseCsvBuffer
};