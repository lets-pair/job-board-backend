import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { paymentValidation } from '../../validations';
import { paymentController } from '../../controllers';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(paymentValidation.makePayment), paymentController.makePayment);

router
  .route('/success')
  .post(auth(), validate(paymentValidation.successPayment), paymentController.successPayment);

export default router;
