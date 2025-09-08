import Joi from 'joi';

const createConfig = {
  body: Joi.object().keys({
    numComputers: Joi.number().required(),
    startDay: Joi.string()
      .pattern(/^\d{2}:\d{2}$/, 'Format should be hh:mm')
      .required(),
    endDay: Joi.string()
      .pattern(/^\d{2}:\d{2}$/, 'Format should be hh:mm')
      .required(),
    duration: Joi.number().min(15).max(180).required()
  })
};

const getConfig = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const updateConfig = {
  params: Joi.object().keys({
    configId: Joi.string()
  }),
  body: Joi.object()
    .keys({
      numComputers: Joi.number(),
      startDay: Joi.string().pattern(/^\d{2}:\d{2}$/, 'Format should be hh:mm'),
      endDay: Joi.string().pattern(/^\d{2}:\d{2}$/, 'Format should be hh:mm'),
      duration: Joi.number().min(15).max(180)
    })
    .min(1)
};

export default {
  createConfig,
  getConfig,
  updateConfig
};
