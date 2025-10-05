/**
 * Custom modules
 */
import config from '@/config';
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
interface QueryType {
  status?: 'draft' | 'published';
}

const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offset =
      parseInt(req.query.offset as string) || config.defaultResOffset;
    const query: QueryType = {};
    const user = await User.findById(userId).select('role').lean().exec();

    // Show only the published post to a normal user
    if (!user || user.role === 'user') {
      query.status = 'published';
    }

    const cacheKey = `blogs:${user?.role || 'user'}:limit=${limit}:offset=${offset}`;

    const cached = await redis.getJSON<{ total: number; blogs: any[] }>(cacheKey);

    if (cached) {
      logger.info(`✅ Cache hit for key: ${cacheKey}`);
      res.status(200).json({
        limit,
        offset,
        total: cached.total,
        blogs: cached.blogs,
        cached: true,
      });
      return;
    }

    const total = await Blog.countDocuments();
    const blogs = await Blog.find()
      .select('-banner.publicId -__v')
      .populate('author', 'firstName lastName username email')
      .limit(limit)
      .skip(offset)
      .sort({ publishedAt: 'desc' })
      .lean()
      .exec();

    await redis.setJSON(cacheKey, { total, blogs }, 300);

    res.status(200).json({
      limit,
      offset,
      total,
      blogs,
    });
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error while fetching blogs', err);
  }
};

export default getAllBlogs;
