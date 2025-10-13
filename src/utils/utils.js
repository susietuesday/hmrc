const { createLogger, format, transports } = require('winston');
const dateFormat = require('dateformat');

// Create logger
const log = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: () => dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
    }),
    format.errors({ stack: true }),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    format.printf(({ timestamp, level, message, metadata }) => {
      const msgString = typeof message === 'object'
        ? JSON.stringify(message, null, 2)
        : message;

      const metaString = Object.keys(metadata).length
        ? `\n${JSON.stringify(metadata, null, 2)}`
        : '';

      return `${timestamp} ${level.toUpperCase()} ${msgString}${metaString}`;
    })
  ),
  transports: [
    new transports.Console()
  ]
});

function getCurrentTaxYear() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Months are zero-based

    // UK tax year starts on 6 April
    if (month < 4 || (month === 4 && today.getDate() < 6)) {
        // Before 6 April → tax year started last year
        return `${year - 1}-${String(year).slice(2)}`;
    } else {
        // On or after 6 April → tax year starts this year
        return `${year}-${String(year + 1).slice(2)}`;
    }
}

function getCurrentTaxYearStart() {
  const now = new Date();
  const year = now.getFullYear();
  let taxYearStart = new Date(year, 3, 6); // April 6th

  if (now < taxYearStart) {
    taxYearStart = new Date(year - 1, 3, 6);
  }

  // Format as YYYY-MM-DD
  const yyyy = taxYearStart.getFullYear();
  const mm = String(taxYearStart.getMonth() + 1).padStart(2, "0");
  const dd = String(taxYearStart.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function getTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const dd = String(today.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

function parseCurrencyToPence(value) {
  if (value == null) return 0;
  let s = String(value).trim();

  // Handle negatives like "(1,234.56)"
  let negative = false;
  if (s.startsWith('(') && s.endsWith(')')) {
    negative = true;
    s = s.slice(1, -1);
  }

  // Keep only digits, dot, comma, minus
  s = s.replace(/[^0-9.,-]/g, '');

  // If both dot and comma exist, assume comma = thousands separator
  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/,/g, '');
  } else if (s.includes(',') && !s.includes('.')) {
    // If only comma, treat comma as decimal separator
    s = s.replace(/,/g, '.');
  }

  const num = Number(s);
  if (Number.isNaN(num)) return 0;

  const pence = Math.round(num * 100);
  return negative ? -pence : pence;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function validateNino(nino) {
  if (!nino) return false;

  // Normalize input: remove spaces and uppercase
  const normalized = nino.replace(/\s+/g, '').toUpperCase();

  // Must be exactly 9 characters
  if (normalized.length !== 9) return false;

  const firstChar = normalized[0];
  const secondChar = normalized[1];
  const digits = normalized.slice(2, 8);
  const lastChar = normalized[8];

  // First character must not be D, F, I, Q, U, V
  if (/[DFIQUV]/.test(firstChar)) return false;

  // Second character must not be D, F, I, O, Q, U, V
  if (/[DFIOQUV]/.test(secondChar)) return false;

  // Characters 3-8 must be numeric
  if (!/^\d{6}$/.test(digits)) return false;

  // Last character must be A, B, C, D or space
  if (!/[ABCD ]/.test(lastChar)) return false;

  // Passed all checks
  return true;
}

function parseAmount(amountStr) {
  if (!amountStr) return 0;
  const cleaned = amountStr.toString().replace(/[^0-9.-]+/g, '');
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

module.exports = { 
  log,
  getCurrentTaxYear,
  getCurrentTaxYearStart,
  getTodayDate,
  parseCurrencyToPence,
  addDays,
  validateNino,
  parseAmount
};