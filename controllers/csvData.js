const streamifier = require('streamifier');
const csv = require('csv-parser');

exports.uploadCsvFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const results = await parseCsvBuffer(req.file.buffer);
    const quarterlyTotalsObj = summariseByQuarter(results);
    const quarterlyTotals = Object.entries(quarterlyTotalsObj).map(([quarter, total]) => ({
    Quarter: quarter,
    Total: total
    }));

    console.log('Parsed CSV data:', results);
    console.log('Quarterly Totals:', quarterlyTotals);

    res.json({
      message: 'CSV parsed successfully',
      data: {
        results,
        quarterlyTotals
      }
    });

  } catch (error) {
    console.error('CSV parsing error:', error);
    res.status(500).json({ message: 'Failed to parse CSV' });
  }
};

function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];

    streamifier.createReadStream(buffer)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

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
