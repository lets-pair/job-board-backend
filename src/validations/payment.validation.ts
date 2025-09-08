import Joi from 'joi';

const lineItemSchema = {
  price_data: Joi.object().keys({
    currency: Joi.string().valid('cad').required(),
    product_data: Joi.object({
      name: Joi.string().required()
    }),
    unit_amount: Joi.number().required()
  }),
  quantity: Joi.number().integer().required()
};

const makePayment = {
  body: Joi.object().keys({
    line_items: Joi.array().items(lineItemSchema),
    mode: Joi.string().valid('payment'),
    success_url: Joi.string().required(),
    cancel_url: Joi.string().required(),
    metadata: Joi.object()
      .keys({
        userId: Joi.number().required(),
        appointmentId: Joi.string().required()
      })
      .required()
  })
};

const successPayment = {
  query: Joi.object().keys({
    CHECKOUT_SESSION_ID: Joi.string().required()
  })
};

export default {
  makePayment,
  successPayment
};
