/**
 * Custom modules
 */
import redis from '@/lib/redis';
import { logger } from '@/lib/winston';

/**
 * Models
 */
import Blog from '@/models/blog';
import User from '@/models/user';

/**
 * Types
 */
import type { Request, Response } from 'express';

const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug;

    const user = await User.findById(userId).select('role').exec();

    const cacheKey = `blog:slug:${slug}`;
    const cachedBlog = await redis.getJSON<any>(cacheKey);

    if (cachedBlog) {
      logger.info(`✅ Cache hit for blog slug: ${slug}`);

      // Check permissions for draft
      if (cachedBlog.status === 'draft' && user?.role === 'user') {
        res.status(403).json({
          code: 'AuthorizationError',
          message: 'Access denied, insufficient permissions',
        });
        return
      }

      res.status(200).json({ blog: cachedBlog, cached: true });
      return
    }

    const blog = await Blog.findOne({ slug })
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .lean()
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    if (user?.role === 'user' && blog.status === 'draft') {
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied, insufficient permissions',
      });

      logger.warn('A user tried to access a draft blog', {
        userId,
        blog,
      });
      return;
    }

    await redis.setJSON(cacheKey, blog, 300);

    res.status(200).json({
      blog,
    });
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error while fetching blog by slug', err);
  }
};

export default getBlogBySlug;
