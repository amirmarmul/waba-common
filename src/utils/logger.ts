import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL,
  format: format.combine(format.json(), format.splat()),
  transports: [
    new transports.Console()
  ],
  exceptionHandlers: [
    new transports.Console()
  ]
});

export default logger;
