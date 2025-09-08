import Joi from 'joi';

const createBlog = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    content: Joi.string().required(),
    published: Joi.boolean().required(),
    slug: Joi.string().required(),
    category: Joi.string().required(),
    coverImage: Joi.string().optional(),
    summary: Joi.string().optional()
  })
};

const getBlogs = {
  query: Joi.object().keys({
    published: Joi.boolean(),
    category: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    sortType: Joi.string(),
    search: Joi.string(),
    searchkey: Joi.string()
  })
};

const getBlogById = {
  params: Joi.object().keys({
    blogId: Joi.string()
  })
};

const getBlogBySlug = {
  params: Joi.object().keys({
    slug: Joi.string()
      .pattern(/^[a-z0-9-]+$/)
      .min(1)
      .max(100)
      .required()
  })
};

const updateBlog = {
  params: Joi.object().keys({
    blogId: Joi.string()
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().optional(),
      content: Joi.string().optional(),
      published: Joi.boolean().optional(),
      slug: Joi.string().optional(),
      category: Joi.string().optional(),
      coverImage: Joi.string().optional(),
      summary: Joi.string().optional()
    })
    .min(1)
};

const deleteBlog = {
  params: Joi.object().keys({
    blogId: Joi.string()
  })
};

export default {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getBlogBySlug
};
