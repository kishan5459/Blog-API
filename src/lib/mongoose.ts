/**
 * Import Node modules
 */
import mongoose from "mongoose";

/**
 * Import Custom modules
 */
import config from "@/config";
import { logger } from "@/lib/winston"

/**
 * Import Types
 */
import type { ConnectOptions } from "mongoose";

/**
 * Client option
 */
const clientOptions: ConnectOptions = {
  dbName: 'blog-api',
  appName: 'Blog API',
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true
  }
}

const filenameObj = { __filename }

/**
 * Establishes a connection to the MongoDB database using mongoose
 * If an error occurs during the connection process, it throws an error with a descriptive message
 * 
 * - Uses `MONGO_URI` as the connection string
 * - `clientOptions` contains additional configuration for Mongoose
 * - Errors are properly handled and rethrown for better debugging  
 */
export const connectToDatabase = async (): Promise<void> => {
  if(!config.MONGO_URI){
    throw new Error('MongoDB URI is not defined in the configuration.')
  }

  try {
    await mongoose.connect(config.MONGO_URI, clientOptions)
    logger.info('Connected to the database successfully.', {
      uri: config.MONGO_URI,
      options: clientOptions,
      ...filenameObj
    })
  } catch (error) {
    if(error instanceof Error){
      throw error
    }

    logger.error("Error connecting to the database", {error, ...filenameObj})
  }
}

/**
 * Disconnects from the MongoDB database using Mongoose
 * 
 * This function attemts to disconnect from the database asynchronously
 * If the disconncetion is successful, a success message is logged
 * If an error ocuurs, it is either re thrown as a new Error (if it's an instance of Error) or logged to the console
 */
export const disconnectFromDatabase = async(): Promise<void> => {
  try {
    await mongoose.disconnect()

    logger.info('Disconnected from the database successfully.', {
      uri: config.MONGO_URI,
      options: clientOptions,
      ...filenameObj
    })
  } catch (error) {
    if(error instanceof Error) {
      throw new Error(error.message)
    }
    logger.error('Error disconnecting from the database', {error, ...filenameObj})
  }
}