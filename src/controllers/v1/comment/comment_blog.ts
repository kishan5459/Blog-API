/**
 * Import Node modules
 */
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom"

/**
 * Import Custom Modules
 */
import { logger } from "@/lib/winston";

/**
 * Models
 */
import Blog from "@/models/blog";
import Comment from "@/models/comment";

/**
 * Import Types
 */
import type { Request, Response } from "express";
import { IComment } from "@/models/comment";

type commentData = Pick<IComment, 'content'>

const window = new JSDOM("").window
const purify = DOMPurify(window)

const filenameObj = { __filename }

const commentBlog = async (req: Request, res: Response): Promise<void> => {
  const { content } = req.body as commentData
  const { blogId } = req.params
  const userId = req.userId

  try {
    const blog = await Blog.findById(blogId).select("likesCount").exec()

    if(!blog){
      res.status(404).json({
        code: "NotFound",
        message: "Blog not found"
      })
      return
    }

    const cleanContent = purify.sanitize(content)

    const newComment = await Comment.create({
      blogId,
      content: cleanContent,
      userId
    })

    logger.info("New comment create", { newComment, ...filenameObj })

    blog.commentsCount++;
    await blog.save()

    logger.info("Blog Comment Count Updated successfully", {
      blogId: blog._id,
      commentsCount: blog.commentsCount,
      ...filenameObj
    })

    res.status(201).json({
      comment: newComment
    })
  } catch (error) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: error
    })

    logger.error('Error during liking blog ', { error, ...filenameObj })
  }
}

export default commentBlog