import Joi from 'joi';

const createUserPrefs = {
  body: Joi.object().keys({
    userId: Joi.number().required(),
    language: Joi.string().valid('PYTHON', 'JAVASCRIPT', 'OPEN').required(),
    skillLevel: Joi.string().valid('EXPLORER', 'BUILDER', 'CREATOR').required(),
    partnerSkillLevel: Joi.string().valid('EXPLORER', 'BUILDER', 'CREATOR').required(),
    projectRole: Joi.string().valid('TAKER', 'PROVIDER').required(),
    os: Joi.string().valid('WINDOWS', 'MAC').required()
  })
};

const getUserPrefs = {
  query: Joi.object().keys({
    language: Joi.string(),
    skillLevel: Joi.string(),
    partnerSkillLevel: Joi.string(),
    projectRole: Joi.string(),
    os: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getUserPrefsById = {
  params: Joi.object().keys({
    userPrefsId: Joi.string()
  })
};

const getUserPrefsByUserId = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  })
};

const updateUserPrefs = {
  params: Joi.object().keys({
    userPrefsId: Joi.string()
  }),
  body: Joi.object()
    .keys({
      language: Joi.string().valid('PYTHON', 'JAVASCRIPT', 'OPEN'),
      skillLevel: Joi.string().valid('EXPLORER', 'BUILDER', 'CREATOR'),
      partnerSkillLevel: Joi.string().valid('EXPLORER', 'BUILDER', 'CREATOR'),
      projectRole: Joi.string().valid('TAKER', 'PROVIDER'),
      os: Joi.string().valid('WINDOWS', 'MAC')
    })
    .min(1)
};

const deleteUserPrefs = {
  params: Joi.object().keys({
    userPrefsId: Joi.string()
  })
};

export default {
  createUserPrefs,
  getUserPrefsById,
  getUserPrefsByUserId,
  getUserPrefs,
  updateUserPrefs,
  deleteUserPrefs
};
