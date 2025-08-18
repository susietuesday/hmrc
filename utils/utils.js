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

module.exports = { 
  log,
  getCurrentTaxYear
};