/**
 * Custom modules
 */
import { logger } from '@/lib/winston';
import config from '@/config';

/**
 * Model
 */
import Comment from '@/models/comment';

/**
 * Types
 */
import type { Request, Response } from 'express';
import redis from '@/lib/redis';
type RequestQuery = {
  offset: string;
  limit: string;
};

const getComments = async (req: Request, res: Response): Promise<void> => {
  const { offset = config.defaultResOffset, limit = config.defaultResLimit } =
    req.query as RequestQuery;

  const offsetNum = Number(offset);
  const limitNum = Number(limit);

  const cacheKey = `comments:offset:${offsetNum}:limit:${limitNum}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Cache hit for comments');
      res.status(200).json(JSON.parse(cached));
      return;
    }

    const comments = await Comment.find()
      .populate('blog', 'banner.url title slug')
      .populate('user', 'username email firstName lastName')
      .limit(limitNum)
      .skip(offsetNum)
      .lean()
      .exec();
    const total = await Comment.countDocuments();

    const response = {
      offset: offsetNum,
      limit: limitNum,
      total,
      comments,
    };

    await redis.set(cacheKey, JSON.stringify(response), 3600);

    res.status(200).json({
      offset: offsetNum,
      limit: limitNum,
      total,
      comments,
    });
  } catch (err) {
    // Handle unexpected error and respond with 500 Server Error
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error retrieving comments', err);
  }
};

export default getComments;
