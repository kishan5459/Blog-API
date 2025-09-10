/**
 * Imports Node modules
 */
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

/**
 * Import Custom module
 */
import { logger } from "@/lib/winston";
import { generateAccessToken, verifyRefreshToken } from "@/lib/jwt";

/**
 * Import Models
 */
import Token from "@/models/token";

/**
 * Import Types
 */
import type { Request, Response } from "express";
import { Types } from "mongoose";

const filenameObj = { __filename }

const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string

  try {
    const tokenExists = await Token.exists({ token: refreshToken })
    console.log(tokenExists)
    if(!tokenExists){
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token'
      })
      return
    }

    // Verify refresh token
    const jwtPayload = verifyRefreshToken(refreshToken) as { userId: Types.ObjectId }
    const accessToken = generateAccessToken(jwtPayload.userId)

    res.status(200).json({
      accessToken
    })
  } catch (error) {
    if(error instanceof TokenExpiredError){
      res.status(401).json({
        code: "AuthenticationError",
        message: "Refresh token expired, please login again"
      })
      return
    }

    if(error instanceof JsonWebTokenError){
      res.status(401).json({
        code: "AuthenticationError",
        message: "Invalid refresh token"
      })
      return
    }

    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: error
    })

    logger.error('Error during refresh token', {
      error,
      ...filenameObj
    })
  }
}

export default refreshToken