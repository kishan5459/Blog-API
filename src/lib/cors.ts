/**
 * Import Custom Modules
 */
import config from '@/config'
import { logger } from '@/lib/winston'

/**
 * Import Types
 */
import type { CorsOptions } from 'cors'

const filenameObj = { __filename }

// Configure CORS options
export const corsOptions: CorsOptions = {
  origin(origin, callback){
    if(config.NODE_ENV === "development" || 
      !origin || 
      config.WHITELIST_ORIGINS.includes(origin)
    ){
      callback(null, true)
    } 
    else{
      // Reject requests from non-whitelisted origins
      callback(
        new Error(`CORS error : ${origin} is not allowed by CORS`),
        false
      )
      // console.log(`CORS error : ${origin} is not allowed by CORS`)
      logger.warn(`CORS error : ${origin} is not allowed by CORS`, filenameObj)
    }
  }
}