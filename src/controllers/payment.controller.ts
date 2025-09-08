import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { paymentService } from '../services';

const makePayment = catchAsync(async (req, res) => {
  const payment = await paymentService.makePayment(req.body);
  res.status(httpStatus.OK).send(payment);
});

const successPayment = catchAsync(async (req, res) => {
  const CHECKOUT_SESSION_ID = req.query['CHECKOUT_SESSION_ID'] as string;
  const result = await paymentService.successPayment(CHECKOUT_SESSION_ID);
  res.status(httpStatus.OK).send(result);
});

export default {
  makePayment,
  successPayment
};
