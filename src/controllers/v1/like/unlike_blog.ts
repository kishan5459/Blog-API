/**
 * Import Custom Modules
 */
import { logger } from "@/lib/winston";
import blog from "@/models/blog";

/**
 * Models
 */
import Blog from "@/models/blog";
import Like from "@/models/like";

/**
 * Import Types
 */
import type { Request, Response } from "express";

const filenameObj = { __filename }

const unlikeBlog = async (req: Request, res: Response): Promise<void> => {
  const { blogId } = req.params
  const { userId } = req.body

  try {
    const existingLike = await Like.findOne({ userId, blogId }).lean().exec()

    if(!existingLike){
      res.status(404).json({
        code: "NotFound",
        message: "Like not found"
      })
      return
    }

    await Like.deleteOne({ _id: existingLike._id})

    const blog = await Blog.findById(blogId).select('likesCount').exec()

    if(!blog){
      res.status(404).json({
        code: "NotFound",
        message: "Blog not found"
      })
      return
    }

    blog.likesCount--
    await blog.save()

    logger.info("Blog unliked successfully",{
      userId,
      blogId: blog._id,
      likesCount: blog.likesCount,
      ...filenameObj
    })

    res.sendStatus(204)
  } catch (error) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: error
    })

    logger.error('Error during unliking blog ', { error, ...filenameObj })
  }
}

export default unlikeBlog