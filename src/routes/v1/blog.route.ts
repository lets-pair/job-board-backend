import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { blogValidation } from '../../validations';
import { blogController } from '../../controllers';

const router = express.Router();

router
  .route('/slug/:slug')
  .get(validate(blogValidation.getBlogBySlug), blogController.getBlogBySlug);

router
  .route('/')
  .post(auth(), validate(blogValidation.createBlog), blogController.createBlog)
  .get(validate(blogValidation.getBlogs), blogController.getBlogs);

router
  .route('/:blogId')
  .get(validate(blogValidation.getBlogById), blogController.getBlogById)
  .patch(auth(), validate(blogValidation.updateBlog), blogController.updateBlogById)
  .delete(auth(), validate(blogValidation.deleteBlog), blogController.deleteBlogById);

export default router;
