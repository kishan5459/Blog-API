/**
 * Import Node modules
 */
import { Router } from "express";
import { param, body } from "express-validator";

/**
 * Import Middlewares
 */
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";

/**
 * Import Controllers
 */
import commentBlog from "@/controllers/v1/comment/comment_blog";
import getCommentsByBlog from "@/controllers/v1/comment/get_comments_by_blog";
import deleteComment from "@/controllers/v1/comment/delete_comment";

const router =  Router()

router.post(
  "/blog/:blogId",
  authenticate,
  authorize(['admin', 'user']),
  param('blogId')
    .isMongoId()
    .withMessage("Invalid blog Id"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required"),
  validationError,
  commentBlog
)

router.get(
  "/blog/:blogId",
  authenticate,
  authorize(['admin', 'user']),
  param('blogId')
    .isMongoId()
    .withMessage("Invalid blog Id"),
  validationError,
  getCommentsByBlog
)

router.delete(
  '/:commentId',
  authenticate,
  authorize(['admin', 'user']),
  param('commmentId')
    .isMongoId()
    .withMessage("Invalid Comment ID"),
  deleteComment
)

export default router
