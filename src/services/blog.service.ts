import { Blog, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import sanitizeHtml from 'sanitize-html';
import he from 'he';

/**
 * Create a blog
 * @param {Object} blogBody
 * @returns {Promise<Blog>}
 */
const createBlog = async (
  title: string,
  content: string,
  published: boolean,
  slug: string,
  category: string,
  coverImage?: string,
  summary?: string
): Promise<Blog> => {
  // check slug
  const slugCheck = await prisma.blog.findFirst({
    where: {
      slug
    }
  });
  if (slugCheck) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug Already Exists');
  }
  // check title
  const titleCheck = await prisma.blog.findFirst({
    where: {
      title
    }
  });
  if (titleCheck) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Title Already Exists');
  }

  // decode content
  const decodedContent = he.decode(content);

  // content sanitization
  const sanitizedContent = sanitizeHtml(decodedContent, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'p',
      'strong',
      'em',
      'u',
      's',
      'blockquote',
      'ol',
      'ul',
      'li',
      'a',
      'img',
      'br'
    ],
    allowedAttributes: {
      '*': ['class'],
      img: ['src', 'alt', 'width', 'height'],
      a: ['href']
    },
    selfClosing: ['img']
  });

  return prisma.blog.create({
    data: { title, content: sanitizedContent, published, slug, category, coverImage, summary }
  });
};

/**
 * Query for blog
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryBlog = async <Key extends keyof Blog>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
    search?: string;
  },
  searchFields: string[],
  keys: Key[] = [
    'id',
    'title',
    'content',
    'published',
    'slug',
    'category',
    'coverImage',
    'summary',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Blog, Key>[]> => {
  if (options.search) {
    const searchWord = options.search.toLowerCase();
    const searchFilter: { OR: { [key: string]: { contains: string; mode: 'insensitive' } }[] } = {
      OR: searchFields.map((field) => ({
        [field]: {
          contains: searchWord,
          mode: 'insensitive'
        }
      }))
    };
    filter = { AND: [filter, searchFilter] };
  }
  const page = options.page ?? 0;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? 'desc';
  const blog = await prisma.blog.findMany({
    where: filter,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: page * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined
  });
  return blog as Pick<Blog, Key>[];
};

/**
 * Get blog by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Blog, Key> | null>}
 */
const getBlogById = async <Key extends keyof Blog>(
  id: string,
  keys: Key[] = [
    'id',
    'title',
    'content',
    'published',
    'slug',
    'category',
    'coverImage',
    'summary',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Blog, Key> | null> => {
  return prisma.blog.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Blog, Key> | null>;
};

/**
 * Get blog by slug
 * @param {ObjectId} slug
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Blog, Key> | null>}
 */
const getBlogBySlug = async <Key extends keyof Blog>(
  slug: string,
  keys: Key[] = [
    'id',
    'title',
    'content',
    'published',
    'slug',
    'category',
    'coverImage',
    'summary',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Blog, Key> | null> => {
  return prisma.blog.findUnique({
    where: { slug },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Blog, Key> | null>;
};

/**
 * Update blog by id
 * @param {ObjectId} blogId
 * @param {Object} updateBody
 * @returns {Promise<Blog>}
 */
const updateBlogById = async <Key extends keyof Blog>(
  blogId: string,
  updateBody: Prisma.BlogUpdateInput,
  keys: Key[] = [
    'id',
    'title',
    'content',
    'published',
    'slug',
    'category',
    'coverImage',
    'summary',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Blog, Key> | null> => {
  const blog = await getBlogById(blogId, ['id']);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  const updatedBlog = await prisma.blog.update({
    where: { id: blog.id },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  });
  return updatedBlog as Pick<Blog, Key> | null;
};

const deleteBlogById = async (blogId: string): Promise<Blog> => {
  const blog = await getBlogById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  // delete the blog
  await prisma.blog.delete({ where: { id: blog.id } });
  return blog;
};

export default {
  createBlog,
  queryBlog,
  getBlogById,
  updateBlogById,
  deleteBlogById,
  getBlogBySlug
};
