/**
 * Import custom modules
 */
import { logger } from "@/lib/winston";

/**
 * Import Models
 */
import User from "@/models/user";

/**
 * Import Types
 */
import type { Request, Response } from "express";

const filenameObj = { __filename }

const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    const user = await User.findById(userId).select('-__v').lean().exec()

    res.status(200).json({
      user
    })
  } catch (error) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: error
    })

    logger.error('Error during getting current user', {
      error,
      ...filenameObj
    })
  }
}

export default getCurrentUser