const winston = require('winston');
const dateFormat = require('dateformat');

// Create logger
const log = winston.createLogger({
  //level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => dateFormat(new Date(), "isoDateTime")
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `${timestamp} ${level.toUpperCase()} ${message} ${metaString}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

module.exports = { 
  log
};