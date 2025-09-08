import httpStatus from 'http-status';
import pick from '../utils/pick';
import catchAsync from '../utils/catchAsync';
import { appointmentService } from '../services';
import { User } from '@prisma/client';
import ApiError from '../utils/ApiError';
import moment from 'moment-timezone';

const createAppointment = catchAsync(async (req, res) => {
  const { userId, date, startTime, endTime, duration } = req.body;
  const user = req.user as User;
  checkAppointmentDateTime(date, startTime, user);
  const appointment = await appointmentService.createAppointment(
    userId,
    date,
    startTime,
    endTime,
    duration
  );
  res.status(httpStatus.CREATED).send(appointment);
});

const createPairBooking = catchAsync(async (req, res) => {
  const { userId, date, startTime, endTime, duration, isPaired, email, pairId } = req.body;
  const user = req.user as User;
  checkAppointmentDateTime(date, startTime, user);
  const appointment = await appointmentService.createPairBooking(
    userId,
    date,
    startTime,
    endTime,
    duration,
    isPaired,
    email,
    pairId
  );
  res.status(httpStatus.CREATED).send(appointment);
});

const getAppointments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['date', 'paymentStatus', 'userId', 'isPaired', 'startTime']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortType', 'search']);
  const result = await appointmentService.queryAppointments(filter, options);
  res.send(result);
});

const getAppointmentById = catchAsync(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(req.params.appointmentId);
  res.send(appointment);
});

const getAvailability = catchAsync(async (req, res) => {
  const date = req.query.date as string;
  const userId = Number(req.query.userId);

  const user = req.user as User;
  if (user.role !== 'ADMIN' && user.id !== userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const availability = await appointmentService.getAvailability(date, userId);
  res.send(availability);
});

const updateAppointmentById = catchAsync(async (req, res) => {
  const appointment = await appointmentService.updateAppointmentById(
    req.params.appointmentId,
    req.body
  );
  res.send(appointment);
});

const deleteAppointmentById = catchAsync(async (req, res) => {
  await appointmentService.deleteAppointmentById(req.params.appointmentId);
  res.status(httpStatus.NO_CONTENT).send();
});

const rescheduleAppointment = catchAsync(async (req, res) => {
  const { date, startTime, endTime, duration } = req.body;
  const user = req.user as User;
  checkAppointmentDateTime(date, startTime, user);
  const appointmentId = req.params.appointmentId;
  const appointment = await appointmentService.rescheduleAppointment(
    appointmentId,
    date,
    startTime,
    endTime,
    duration
  );
  res.status(httpStatus.CREATED).send(appointment);
});

const reschedulePairAppointments = catchAsync(async (req, res) => {
  const { appointmentId1, appointmentId2, date, startTime, endTime, duration } = req.body;
  const user = req.user as User;
  checkAppointmentDateTime(date, startTime, user);
  const appointment = await appointmentService.reschedulePairAppointments(
    appointmentId1,
    appointmentId2,
    date,
    startTime,
    endTime,
    duration
  );
  res.status(httpStatus.CREATED).send(appointment);
});

const createManualPair = catchAsync(async (req, res) => {
  const { appointmentId1, appointmentId2 } = req.body;
  const appointment = await appointmentService.createManualPair(appointmentId1, appointmentId2);
  res.status(httpStatus.CREATED).send(appointment);
});

const checkAppointmentDateTime = (dateString: string, timeString: string, user: User) => {
  if (user.role === 'ADMIN') return;
  const startTimeDate = `${dateString} ${timeString}`;
  const startTimeDateObj = moment.tz(startTimeDate, 'DD-MM-YYYY HH:mm', 'America/Los_Angeles');
  // Get the current date and time
  const pstDate = moment.tz('America/Los_Angeles');
  // Calculate the beginning of the next hour
  const nextHour = pstDate.clone().add(1, 'hour').startOf('hour');
  if (startTimeDateObj.isBefore(nextHour)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You can not book before the beginning of the next hour.'
    );
  }
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
