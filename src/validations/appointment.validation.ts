import Joi from 'joi';

const createAppointment = {
  body: Joi.object().keys({
    userId: Joi.number().integer().required(),
    date: Joi.string().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    duration: Joi.number().required() // Duration in minutes
  })
};

const getAppointments = {
  query: Joi.object().keys({
    date: Joi.string(),
    paymentStatus: Joi.string(),
    userId: Joi.number().integer(),
    isPaired: Joi.boolean(),
    startTime: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    sortType: Joi.string(),
    search: Joi.string()
  })
};

const getAppointmentById = {
  params: Joi.object().keys({
    appointmentId: Joi.string()
  })
};

const getAvailability = {
  query: Joi.object().keys({
    date: Joi.string().required(),
    userId: Joi.number().required()
  })
};

const updateAppointmentById = {
  params: Joi.object().keys({
    appointmentId: Joi.string()
  }),
  body: Joi.object()
    .keys({
      isPaired: Joi.boolean(),
      paymentStatus: Joi.string(),
      feedback: Joi.string(),
      deletedFor: Joi.string()
    })
    .min(1)
};

const deleteAppointmentById = {
  params: Joi.object().keys({
    appointmentId: Joi.string()
  })
};

const rescheduleAppointment = {
  params: Joi.object().keys({
    appointmentId: Joi.string().required()
  }),
  body: Joi.object().keys({
    date: Joi.string().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    duration: Joi.number().required() // Duration in minutes
  })
};

const reschedulePairAppointments = {
  body: Joi.object().keys({
    appointmentId1: Joi.string().required(),
    appointmentId2: Joi.string().required(),
    date: Joi.string().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    duration: Joi.number().required() // Duration in minutes
  })
};

const createPairBooking = {
  body: Joi.object().keys({
    userId: Joi.number().integer().required(),
    isPaired: Joi.boolean(),
    pairId: Joi.number().integer().optional(),
    email: Joi.string().required().email(),
    date: Joi.string().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    duration: Joi.number().required()
  })
};

const createManualPair = {
  body: Joi.object().keys({
    appointmentId1: Joi.string().required(),
    appointmentId2: Joi.string().required()
  })
};

export default {
  createAppointment,
  createManualPair,
  rescheduleAppointment,
  reschedulePairAppointments,
  getAppointments,
  getAppointmentById,
  updateAppointmentById,
  deleteAppointmentById,
  getAvailability,
  createPairBooking
};
