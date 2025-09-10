/**
 * Node Modules
 */
import { v2 as cloudinary } from "cloudinary"

/**
 * Import Custom modules
 */
import { logger } from "@/lib/winston";

/**
 * Import Models
 */
import User from "@/models/user";
import Blog from "@/models/blog";

/**
 * Import Types
 */
import type { Request, Response } from 'express'

const filenameObj = { __filename }

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.userId

  try {
    const blogs = await Blog.find({ author: userId })
    .select("banner.publicId")
    .lean()
    .exec()
    const publicIds = blogs.map(({banner}) => banner.publicId)

    await cloudinary.api.delete_resources(publicIds)
    logger.info("Multiple blog banners deleted from Cloudinary", {
      publicIds,
      ...filenameObj
    })

    await Blog.deleteMany({ author: userId })
    logger.info("Multiple blogs deleted", {
      userId,
      blogs
    })
    await User.deleteOne({ _id: userId })
    logger.info('A user account has been deleted', { userId, ...filenameObj })

    res.sendStatus(204)
  } catch (error) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: error
    })

    logger.error('Error during deleting user ', { error, ...filenameObj })
  }
}

export default deleteUser