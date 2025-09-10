/**
 * Import Node modules
 */
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import helmet from 'helmet'
import morgan from 'morgan'

/**
 * Import custom modules
 */
import config from '@/config'
import limiter from '@/lib/express_rate_limit'
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose'
import { logger } from '@/lib/winston'
import { detailedFormat, morganStream } from './lib/morgan'
import { corsOptions } from '@/lib/cors'

/**
 * Import Routes
 */
import v1Routes from "@/routes/v1"

/**
 * Express app initialization
 */
const app = express()
const filenameObj = { __filename }

// Apply CORS middleware
app.use(cors(corsOptions)) 

// Enable JSON requet body parsing
app.use(express.json())

// Enable URL-encoded request body parsing with extended true
// `extended: true` allows rich objects and arrays via querystring
app.use(express.urlencoded({ extended: true }))

app.use(morgan(detailedFormat, { stream: morganStream }));

app.use(cookieParser())

// Enable response compression to reduce payload size and improve performance
app.use(
  compression({
    threshold: 1024
  })
)

// Use helmet to enhance security by setting various HTTP headers
app.use(helmet())

// Apply rate limiting middleware to prevent exessive requests and enhance security
app.use(limiter);

/**
 * Immediately Invoked Async Function Expression (IIFE) to start the server
 * 
 * - Tries to connect to the database before initializing the server
 * - Defines the API route (`/api/v1`)
 * - Starts the server on the specified PORT and logs the running URL.
 * - If an error occurs during startup, it is logged, and the process exits with status 1 
 */
(async () => {
  try {
    await connectToDatabase()

    app.use('/api/v1', v1Routes)
    
    app.listen(config.PORT, () => {
      // console.log(`Server running : http://localhost:${config.PORT}`)
      logger.info(`Server running : http://localhost:${config.PORT}`, filenameObj)
    })
  } catch (error) {
    // console.log('Failed to start the server', error)
    logger.error('Failed to start the server', { error, ...filenameObj })

    if(config.NODE_ENV === "production"){
      process.exit(1)
    }
  }
})();

/**
 * Handles server shutdown gracefully by disconnecting from the database
 * 
 * - Attemps to disconnect from the database before shutting down the server
 * - Logs a success message if the disconnection is successful
 * - If an error occurs during disconnection, it is logged to the console.
 * - Exits the process with status code `0` (indicating a successful shutdown)
 */
const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase()
    // console.log('Server SHUTDOWN')
    logger.warn('Server SHUTDOWN', filenameObj)
    process.exit(0)
  } catch (error) {
    // console.log("Error during server shutdown", error)
    logger.error("Error during server shutdown", {error, ...filenameObj})
  }
}

/**
 * Listens for termination signals (`SIGNTERM` and `SIGINT`)
 * 
 * - `SIGTERM` is typically sent when stopping a process (e.g., pressing `Ctrl+C`)
 * - When either signal is received, `handleServerShutdown` is executed to ensure proper cleanup.
 */
process.on('SIGTERM', handleServerShutdown)
process.on('SIGINT', handleServerShutdown)