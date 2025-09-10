/**
 * @copyright 2025 codewithsadee
 * @license Apache-2.0
 */

/**
 * Import Node modules
 */
import dotenv from "dotenv"

/**
 * Import Types
 */
import type ms from 'ms'

dotenv.config()

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV,
  WHITELIST_ORIGINS: ["https://docs.for.this.API.com"],
  MONGO_URI: process.env.MONGO_LOCAL,
  LOG_LEVEL: process.env.LOG_LEVEL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY as ms.StringValue,
  WHITELIST_ADMIN_EMAILS: process.env.WHITELIST_ADMIN_EMAILS?.split(',') || [],
  defaultResLimit: 20,
  defaultResOffset: 0,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
}

export default config