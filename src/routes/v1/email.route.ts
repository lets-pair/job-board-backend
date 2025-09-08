import express from 'express';
import validate from '../../middlewares/validate';
import { emailValidation } from '../../validations';
import { emailController } from '../../controllers';

const router = express.Router();

router.route('/contact-form').post(validate(emailValidation.sendEmail), emailController.sendEmail);

export default router;
