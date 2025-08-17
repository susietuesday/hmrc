const streamifier = require('streamifier');
const csv = require('csv-parser');

async function processCsvIncomeFile(fileBuffer) {

  // Parsing logic
  const requiredColumns = ['Date Received', 'Amount'];
  const results = await parseCsvBuffer(fileBuffer, requiredColumns);
  const quarterlyTotalsObj = summariseByQuarter(results);

  return {
    results,
    quarterlyTotals: Object.entries(quarterlyTotalsObj).map(([q, total]) => ({
      Quarter: q,
      Total: total
    }))
  };
}

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

function summariseByQuarter(dataRows) {
  const totals = {
    Q1: 0,
    Q2: 0,
    Q3: 0,
    Q4: 0,
  };

  for (const row of dataRows) {
    const dateStr = row['Date Received'];
    const amountStr = row['Amount'];

    const date = new Date(dateStr);
    const cleanAmountStr = amountStr.replace(/[^0-9.-]+/g, ''); // removes everything except digits, dot, minus sign
    const amount = parseFloat(cleanAmountStr);

    if (isNaN(date.getTime()) || isNaN(amount)) continue; // Skip bad rows

    const year = date.getFullYear();
    const q1Start = new Date(`${year}-04-06`);
    const q2Start = new Date(`${year}-07-06`);
    const q3Start = new Date(`${year}-10-06`);
    const q4Start = new Date(`${year + 1}-01-06`);

    if (date >= q1Start && date < q2Start) {
      totals.Q1 += amount;
    } else if (date >= q2Start && date < q3Start) {
      totals.Q2 += amount;
    } else if (date >= q3Start && date < q4Start) {
      totals.Q3 += amount;
    } else {
      totals.Q4 += amount;
    }
  }

  return totals;
};

module.exports = {
  processCsvIncomeFile
};