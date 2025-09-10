/**
 * Import custom modules
 */
import { logger } from "@/lib/winston";

// Create a stream object with a 'write' function for Morgan to use
const morganStream = {
  write: (message: string) => {
    // console.log(message)
    logger.http(message.trim());
  }
};

// responseTime = (headersWritten - requestStart) 
// Time from request entering middleware to response headers being written

// totalTime = (responseEnd - requestStart)
// Time from request start to when last byte is sent

const detailedFormat = [
  ':remote-addr - :remote-user',
  '":method :url HTTP/:http-version"',
  ':status :res[content-length]',
  '":referrer" ":user-agent"',
  '\nResponse Time: :response-time[3] ms',
  '\nTotal Time: :total-time[3] ms',
  //'\n----------------------------------------'
].join(' ');

const singleLineFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - Response: :response-time[3] ms | Total: :total-time[3] ms';

export { morganStream, detailedFormat }