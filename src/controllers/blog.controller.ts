import httpStatus from 'http-status';
import pick from '../utils/pick';
import catchAsync from '../utils/catchAsync';
import { blogService } from '../services';
import ApiError from '../utils/ApiError';

const createBlog = catchAsync(async (req, res) => {
  const { title, content, published, slug, category, coverImage, summary } = req.body;
  const blog = await blogService.createBlog(
    title,
    content,
    published,
    slug,
    category,
    coverImage,
    summary
  );
  res.status(httpStatus.CREATED).send(blog);
});

const getBlogs = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['category', 'published']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortType', 'search']);
  const searching = req.query['searchkey'] as string;
  const searchFields = searching ? searching.split(',').map((field) => field.trim()) : [];
  const result = await blogService.queryBlog(filter, options, searchFields);
  res.send(result);
});

const getBlogById = catchAsync(async (req, res) => {
  const blog = await blogService.getBlogById(req.params.blogId);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  res.send(blog);
});

const getBlogBySlug = catchAsync(async (req, res) => {
  const blog = await blogService.getBlogBySlug(req.params.slug);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  res.send(blog);
});

const updateBlogById = catchAsync(async (req, res) => {
  const blog = await blogService.updateBlogById(req.params.blogId, req.body);
  res.send(blog);
});

const deleteBlogById = catchAsync(async (req, res) => {
  await blogService.deleteBlogById(req.params.blogId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlogById,
  deleteBlogById,
  getBlogBySlug
};
