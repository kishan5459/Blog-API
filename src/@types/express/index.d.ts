/**
 * Import Node modules
 */
import * as express from 'express'

/**
 * Import Types
 */
import { Types } from 'mongoose'

declare global{
  namespace Express{
    interface Request{
      userId?: Types.ObjectId
    }
  }
}