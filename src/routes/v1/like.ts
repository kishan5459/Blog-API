/**
 * Import Node modules
 */
import { Router } from "express";
import { param, query, body } from "express-validator";

/**
 * Import Middlewares
 */
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";

/**
 * Import Controllers
 */
import likeBlog from "@/controllers/v1/like/like_blog";
import unlikeBlog from "@/controllers/v1/like/unlike_blog";

/**
 * Import Models
 */

const router = Router()

router.post(
  "/blog/:blogId",
  authenticate,
  authorize(['admin', 'user']),
  param("blogId").isMongoId().withMessage("Invalid blog ID"),
  body("userId")
    .notEmpty()
    .withMessage("User id is required")
    .isMongoId()
    .withMessage("Invalid user id"),
  validationError,
  likeBlog
)

router.delete(
  "/blog/:blogId",
  authenticate,
  authorize(['admin', 'user']),
  param("blogId").isMongoId().withMessage("Invalid blog ID"),
  body("userId")
    .notEmpty()
    .withMessage("User id is required")
    .isMongoId()
    .withMessage("Invalid user id"),
  validationError,
  unlikeBlog
)

export default router
