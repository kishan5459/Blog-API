import redis from './redis';

/**
 * Delete keys matching a pattern using SCAN
 */
export async function delPattern(pattern: string): Promise<number> {
  let cursor = '0';
  let deletedCount = 0;

  do {
    const [nextCursor, keys] = await redis.raw.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;

    if (keys.length > 0) {
      const delRes = await redis.raw.del(...keys);
      deletedCount += delRes;
    }
  } while (cursor !== '0');

  return deletedCount;
}

/**
 * Clear all blog list caches (blogs:*)
 */
export async function clearBlogListCache(): Promise<void> {
  const deleted = await delPattern('blogs:*');
  console.log(`🧹 Cleared ${deleted} general blog list cache entries`);
}

/**
 * Clear all cached blogs of a specific user (userBlogs:<userId>:*)
 */
export async function clearBlogCacheForUser(userId: string): Promise<void> {
  const deleted = await delPattern(`userBlogs:${userId}:*`);
  console.log(`🧹 Cleared ${deleted} userBlogs cache entries for user ${userId}`);
}

/**
 * Clear individual blog cache by slug
 */
export async function clearBlogBySlug(slug: string): Promise<void> {
  const deleted = await redis.del(`blog:slug:${slug}`);
  console.log(`🧹 Cleared blog cache for slug: ${slug}`);
}

/**
 * Clear all caches related to blogs (lists + individual)
 */
export async function clearAllBlogCaches(): Promise<void> {
  await clearBlogListCache();
  await delPattern('userBlogs:*');
  console.log('🧹 Cleared all blog caches');
}

/**
 * Clear all cached comments for a specific blog
 */
export async function clearCommentsByBlogId(blogId: string): Promise<void> {
  const deleted = await redis.del(`blog:comments:${blogId}`);
  console.log(`🧹 Cleared comments cache for blogId: ${blogId}`);
}

/**
 * Clear paginated comment cache
 */
export async function clearCommentsPagination(offset?: number, limit?: number): Promise<void> {
  const cacheKey = `comments:offset:${offset ?? '*'}:limit:${limit ?? '*'}`;
  // Use scan and del for wildcard deletion if needed
  const keys = await redis.keys(cacheKey); 
  if (keys.length) {
    for (const key of keys) {
      await redis.del(key);
    }
    console.log(`🧹 Cleared paginated comments cache for cacheKey=${cacheKey}`);
  }
}

/**
 * Clear all paginated comments cache
 */
export async function clearCommentsCache(): Promise<void> {
  try {
    // Match all paginated comments keys
    const keys = await redis.keys('comments:offset:*:limit:*');

    if (keys.length > 0) {
      for (const key of keys) {
        await redis.del(key);
      }
      console.log(`🧹 Cleared all paginated comments cache`);
    }
  } catch (err) {
    console.error('Error clearing comments cache', err);
  }
}

/**
 * Clear all cache related to a specific user
 * @param userId - The ID of the user whose cache should be cleared
 */
export async function clearUserCache(userId: string): Promise<void> {
  try {
    // Find all keys related to this user
    const keys = await redis.keys(`user:${userId}*`);

    if (keys.length > 0) {
      // Delete all matching keys
      for (const key of keys) {
        await redis.del(key);
      }
      console.info(`🧹 Cleared cache for user: ${userId}`);
    }
  } catch (err) {
    console.error(`Error clearing cache for user ${userId}`, err);
  }
}

/**
 * Clear cache for a user by email
 * @param email - The email of the user whose cache should be cleared
 */
export async function clearUserCacheByEmail(email: string): Promise<void> {
  try {
    const cacheKey = `user:email:${email}`;

    const deleted = await redis.del(cacheKey);

    if (deleted) {
      console.info(`🧹 Cleared cache for user with email: ${email}`);
    } else {
      console.info(`No cache found for user with email: ${email}`);
    }
  } catch (err) {
    console.error(`Error clearing cache for user with email ${email}`, err);
  }
}