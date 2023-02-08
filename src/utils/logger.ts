import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: process.env.LOG_LEVEL,
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new transports.Console()
    ],
    exceptionHandlers: [
        new transports.Console()
    ]
});

export default logger;
