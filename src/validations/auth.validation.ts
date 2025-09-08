import Joi from 'joi';
import { password } from './custom.validation';
import moment from 'moment';

const nineteenYearsAgo = moment().subtract(19, 'years').toDate();

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string()
      .pattern(/^[a-zA-ZÀ-ÿ]+( [a-zA-ZÀ-ÿ]+)*$/, 'full name')
      .required(),
    birthDay: Joi.string()
      .pattern(/^\d{2}-\d{2}-\d{4}$/, 'Format should be dd-mm-yyyy')
      .required(),
    guardianEmail: Joi.string()
      .email()
      .when('birthDay', {
        is: Joi.date().greater(nineteenYearsAgo),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
  })
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required()
  })
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required()
  })
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required()
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password)
  })
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required()
  })
};

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail
};
