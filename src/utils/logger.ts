import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL,
  // format: format.combine(format.timestamp(), format.splat(), format.json()),
  transports: [
    new transports.Console()
  ],
  exceptionHandlers: [
    new transports.Console()
  ]
});

export default logger;
