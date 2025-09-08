import { Role } from '@prisma/client';
import Joi from 'joi';
import { password } from './custom.validation';

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    birthDay: Joi.string()
      .pattern(/^\d{2}-\d{2}-\d{4}$/, 'Format should be dd-mm-yyyy')
      .required(),
    guardianEmail: Joi.string().email().allow(''),
    role: Joi.string().required().valid(Role.USER, Role.ADMIN),
    sessionCount: Joi.number().integer(),
    address: Joi.string().optional().allow(''),
    phoneNumber: Joi.string().allow('')
  })
};

const createAdmin = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    birthDay: Joi.string()
      .pattern(/^\d{2}-\d{2}-\d{4}$/, 'Format should be dd-mm-yyyy')
      .required(),
    guardianEmail: Joi.string().email(),
    role: Joi.string().required().valid(Role.ADMIN),
    sessionCount: Joi.number().integer(),
    address: Joi.string(),
    phoneNumber: Joi.string()
  })
};

const getUsers = {
  query: Joi.object().keys({
    role: Joi.string(),
    isEmailVerified: Joi.boolean(),
    isConsented: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    sortType: Joi.string(),
    search: Joi.string(),
    isDisabled: Joi.boolean()
  })
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  })
};

const getUserInfo = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  })
};

const deactivateUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  })
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      name: Joi.string(),
      sessionCount: Joi.number().integer(),
      address: Joi.string(),
      phoneNumber: Joi.string(),
      isConsented: Joi.boolean(),
      birthDay: Joi.string().pattern(/^\d{2}-\d{2}-\d{4}$/, 'Format should be dd-mm-yyyy'),
      guardianEmail: Joi.string().email(),
      isDisabled: Joi.boolean()
    })
    .min(1)
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  })
};

export default {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  createAdmin,
  getUserInfo,
  deactivateUser
};
