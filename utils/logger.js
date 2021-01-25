var winston = require('winston');
var { splat, combine, timestamp, label, printf, colorize } = winston.format;

const colorizer = winston.format.colorize();
var logLevel = 'info';

var createLogger = logLabel => {
    return winston.createLogger({
        level: logLevel,
        format: combine(
            splat(),
            label({ label: logLabel}),
            timestamp(),
            printf(msg =>
                colorizer.colorize(msg.level, `${msg.label}\t\| ${msg.level}: (${msg.timestamp}) `)+`${msg.message}`
            )
        ),
        transports: [new winston.transports.Console()]
    });
}

module.exports = createLogger;
