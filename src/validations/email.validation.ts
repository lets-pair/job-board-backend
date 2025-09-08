import Joi from 'joi';

const sendEmail = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    message: Joi.string().required()
  })
};

export default {
  sendEmail
};
