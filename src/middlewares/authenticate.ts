/**
 * Import Node modules 
 */
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

/**
 * Import Custom modules
 */
import { verifyAccessToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";

/**
 * Import Types
 */
import type { Request, Response, NextFunction } from 'express'
import { Types } from "mongoose";

const filenameObj = { __filename }

/**
 * @function authenticate
 * @description 
 *    - Middleware to verify the user's access token from the Authorization header. 
 *    - If the token is valid, the user's ID is attached to the request object. 
 *    - Otherwise, it returns an appropriate error instance
 * @param {Request} req - Express request  object. Expects a bearer token in authorization header
 * @param {Response} res - Express response object used to send error responses if authentication fails
 * @param {NextFunction} next - Express next function to pass control to the next middleware
 * 
 * @returns {void}
 */

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  // If there is no Bearer token, respond with 401 unauthorized
  if(!authHeader?.startsWith('Bearer ')){
    res.status(401).json({
      code: 'AuthenticationError',
      message: "Access denied, no token provided"
    })
    return
  }

  // Split out the token from the 'Bearer' prefix
  const [_, token] = authHeader.split(" ")

  try {
    // Verify the token and extract the userId from the payload
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId }

    // Attach the userId to the request object for later use
    req.userId = jwtPayload.userId

    // Proceed to the next middleware or route handler
    return next()

  } catch (error) {
    // Handle Token expired error
    if(error instanceof TokenExpiredError){
      res.status(401).json({
        code: "AuthenticationError",
        message: "Access token expired, request a new one with refresh token"
      })
      return
    }

    // Handle Invalid token error
    if(error instanceof JsonWebTokenError){
      res.status(401).json({
        code: "AuthenticationError",
        message: "Access token Invalid"
      })
      return
    }

    // Catch all for other errors
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: error
    })

    logger.error('Error during authentication', {
      error,
      ...filenameObj
    })
  }
}

export default authenticate