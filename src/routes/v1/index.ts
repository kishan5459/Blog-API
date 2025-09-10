/**
 * Import Node modules
 */
import { Router } from "express";

/**
 * Import Routes
 */
import authRoutes from '@/routes/v1/auth'
import userRoutes from '@/routes/v1/user'
import blogRoutes from "@/routes/v1/blog"
import likeRoutes from "@/routes/v1/like"
import commentRoutes from "@/routes/v1/comment"

const router = Router()

/**
 * Root Route
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: "API is live",
    status: "OK",
    version: '1.0.0',
    docs: "https://docs.for.this.API.com",
    timestamp: new Date().toISOString()
  })
})

router.use('/auth', authRoutes)

router.use('/users', userRoutes)

router.use("/blogs", blogRoutes)

router.use("/likes", likeRoutes)

router.use("/comments", commentRoutes)

export default router