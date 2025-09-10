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
import User from "@/models/user";

/**
 * Import Types
 */
import type { Request, Response } from "express";
import type { IBlog } from "@/models/blog";

type BlogData = Partial<Pick<IBlog, "title" | 'content' | 'banner' | 'status'>>

/**
 * Purify the blog content
 */
const window = new JSDOM("").window
const purify = DOMPurify(window)

const filenameObj = { __filename }

const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, banner, status } = req.body as BlogData

    const userId = req.userId
    const blogId = req.params.blogId

    const user = await User.findById(userId).select("role").lean().exec()
    const blog = await Blog.findById(blogId).select("-__v").exec()

    if(!blog){
      res.status(404).json({
        code: "NotFound",
        message: "Blog not found"
      })
      return
    }

    if(blog.author !== userId && user?.role !== 'admin'){
      res.status(403).json({
        code: "AuthorizationError",
        message: "Access denied, insufficient permissions"
      })

      logger.warn("A user tried to update a blog without permission",{
        userId,
        blog,
        ...filenameObj
      })
      return
    }

    if(title) blog.title = title
    if(content) {
      const cleanContent = purify.sanitize(content)
      blog.content = cleanContent
    }
    if(banner) blog.banner = banner
    if(status) blog.status = status

    await blog.save()
    logger.info("Blog updated", { blog, ...filenameObj })

    res.status(200).json({
      blog
    })
  } catch (error) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: error
    })

    logger.error('Error during updating blog ', { error, ...filenameObj })
  }
}

export default updateBlog