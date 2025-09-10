/**
 * Import Node modules
 */
import winston from "winston"
import path from "path"

/**
 * Import Custom modules
 */
import config from "@/config"

const { combine, timestamp, json, errors, align, printf, colorize, label, splat } = winston.format

// Define the transports array to hold logging transports
const transports: winston.transport[] = []

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,     
    verbose: 4,
    debug: 5,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'cyan',
    verbose: 'magenta',
    debug: 'blue',
  }
};

winston.addColors(customLevels.colors);

const colorizer = winston.format.colorize({ all: false });

const devFormat = printf(info => {
  // console.log("DEBUG INFO OBJECT:", info);
  const { timestamp, level, message, label, ...meta } = info;

  let filePath = '';
  const rawFilename = meta.__filename;

  if (typeof rawFilename === 'string') {
    // Make filename relative (e.g., src/config/db.ts)
    const relativePath = path.relative(process.cwd(), rawFilename);
    filePath = `[${relativePath}]`;
    delete meta.__filename; // Clean meta
  }

  const metaStr = Object.keys(meta).length 
    ? `\n${JSON.stringify(meta, null, 2)}` 
    : '';

  const logLine = `${timestamp} ${filePath} [${level}] ${String(message).trim()}${metaStr}`;

  // Color the full line using the level's color
  return colorizer.colorize(level, logLine);
});

// If the application is not running in production, add a console transport
if(config.NODE_ENV !== 'production'){
  transports.push(
    new winston.transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }), // Add timestamps to logs
        splat(),
        align(), // Align log messages
        devFormat
      )
    })
  )
}

// Create a logger instance using winston
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'http', // by default print all logs <= http if not set by env
  levels: customLevels.levels, // Set the default logging level to `info`
  format: combine(
    timestamp(), 
    errors({ stack: true }), 
    json()
  ), // Use JSON format for log messages
  transports,
  silent: config.NODE_ENV === 'test', // Disable logging in test environment
})

export { logger }