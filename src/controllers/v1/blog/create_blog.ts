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

/**
 * Import Types
 */
import type { Request, Response } from "express";
import type { IBlog } from "@/models/blog";

type BlogData = Pick<IBlog, "title" | 'content' | 'banner' | 'status'>

/**
 * Purify the blog content
 */
const window = new JSDOM("").window
const purify = DOMPurify(window)

const filenameObj = { __filename }

const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, banner, status } = req.body as BlogData
    const userId = req.userId

    const cleanContent = purify.sanitize(content)
    console.log(cleanContent)
    console.log(banner)
    console.log(userId)
    const newBlog = await Blog.create({
      title,
      content: cleanContent,
      banner,
      status,
      author: userId
    })
    // console.log(newBlog)

    logger.info("New blog created", { newBlog, ...filenameObj})

    res.status(201).json({
      blog: newBlog
    })
  } catch (error) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: error
    })

    logger.error('Error during creating blog ', { error, ...filenameObj })
  }
}

export default createBlog