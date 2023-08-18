import { createLogger, transports } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL,
  transports: [
    new transports.Console()
  ],
  exceptionHandlers: [
    new transports.Console()
  ]
});

export default logger;
