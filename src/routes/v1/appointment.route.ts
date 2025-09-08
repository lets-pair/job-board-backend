import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { appointmentValidation } from '../../validations';
import { appointmentController } from '../../controllers';

const router = express.Router();

router
  .route('/')
  .post(
    auth(),
    validate(appointmentValidation.createAppointment),
    appointmentController.createAppointment
  )
  .get(
    auth(),
    validate(appointmentValidation.getAppointments),
    appointmentController.getAppointments
  );

router
  .route('/reschedule/:appointmentId')
  .patch(
    auth(),
    validate(appointmentValidation.rescheduleAppointment),
    appointmentController.rescheduleAppointment
  );

router
  .route('/reschedule-pair')
  .patch(
    auth(),
    validate(appointmentValidation.reschedulePairAppointments),
    appointmentController.reschedulePairAppointments
  );

router
  .route('/get-availability')
  .get(
    auth(),
    validate(appointmentValidation.getAvailability),
    appointmentController.getAvailability
  );

router
  .route('/pair-booking')
  .post(
    auth(),
    validate(appointmentValidation.createPairBooking),
    appointmentController.createPairBooking
  );

router
  .route('/manual-pairing')
  .patch(
    auth(),
    validate(appointmentValidation.createManualPair),
    appointmentController.createManualPair
  );

router
  .route('/:appointmentId')
  .get(
    auth(),
    validate(appointmentValidation.getAppointmentById),
    appointmentController.getAppointmentById
  )
  .patch(
    auth(),
    validate(appointmentValidation.updateAppointmentById),
    appointmentController.updateAppointmentById
  )
  .delete(
    auth(),
    validate(appointmentValidation.deleteAppointmentById),
    appointmentController.deleteAppointmentById
  );

export default router;
