/**
 * Import custom modules
 */
import { logger } from "@/lib/winston";

/**
 * Import Models
 */
import Blog from "@/models/blog";
import User from "@/models/user";

/**
 * Import Types
 */
import type { Request, Response } from "express";

const filenameObj = { __filename }

const getBlogsBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId= req.userId
    const slug = req.params.slug

    const user = await User.findById(userId).select('role').lean().exec()
    const blog = await Blog.findOne({ slug })
    .select('-banner.publicId -__v')
    .populate('author', "-createdAt -updatedAt -__v")
    .lean()
    .exec()

    if(!blog){
      res.status(404).json({
        code: "NotFound",
        message: "Blog Not Found"
      })
      return
    }

    if (user?.role === 'user' && blog.status === 'draft'){
      res.status(403).json({
        code: "AuthorizationError",
        message: "Access denied, insuffcient permissions"
      })

      logger.warn("A user tried to access a draft blog", {
        userId,
        blog,
        ...filenameObj
      })
      return
    }
    
    res.status(200).json({
      blog
    })
  } catch (error) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: error
    })

    logger.error('Error during fetching blog by slug', {
      error,
      ...filenameObj
    })
  }
}

export default getBlogsBySlug