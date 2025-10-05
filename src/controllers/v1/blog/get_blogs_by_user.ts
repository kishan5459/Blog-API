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

const getBlogsByUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offset =
      parseInt(req.query.offset as string) || config.defaultResOffset;
    const query: QueryType = {};

    const userId = req.params.userId;
    const currentUser = await User.findById(currentUserId)
      .select('role')
      .exec();

    const role = currentUser?.role || 'user';

    const cacheKey = `userBlogs:${userId}:${role}:limit=${limit}:offset=${offset}`;

    const cached = await redis.getJSON<{ total: number; blogs: any[] }>(cacheKey);
    if (cached) {
      logger.info(`✅ Cache hit for ${cacheKey}`);
      res.status(200).json({ ...cached, limit, offset, cached: true });
      return;
    }

    // Show only the published post to a normal user
    if (currentUser?.role === 'user') {
      query.status = 'published';
    }

    const total = await Blog.countDocuments({ author: userId, ...query });
    const blogs = await Blog.find({ author: userId, ...query })
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
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

    logger.error('Error while fetching blogs by user', err);
  }
};

export default getBlogsByUser;
