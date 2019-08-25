const { createLogger, format, transports } = require('winston');

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
const logger = createLogger({
  // To see more detailed errors, change this to 'debug'
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.splat(),
    format.simple()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: '../logs/combined.log', level: 'info'}),
    new transports.File({ filename: '../logs/error.log', level: 'error' })
  ],
});

module.exports = logger;