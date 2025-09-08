import httpStatus from 'http-status';
import pick from '../utils/pick';
import catchAsync from '../utils/catchAsync';
import { emailService } from '../services';
import ApiError from '../utils/ApiError';

const sendEmail = catchAsync(async (req, res) => {
  const { name, email, message } = req.body;
  const blog = await emailService.contactForm(name, email, message);
  res.status(httpStatus.CREATED).send(blog);
});

export default {
  sendEmail
};
