import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { userPrefsValidation } from '../../validations';
import { userPrefsController } from '../../controllers';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(userPrefsValidation.createUserPrefs), userPrefsController.createUserPrefs)
  .get(auth(), validate(userPrefsValidation.getUserPrefs), userPrefsController.getUserPrefs);

router
  .route('/:userPrefsId')
  .get(auth(), validate(userPrefsValidation.getUserPrefs), userPrefsController.getUserPrefsById)
  .patch(auth(), validate(userPrefsValidation.updateUserPrefs), userPrefsController.updateUserPrefs)
  .delete(
    auth(),
    validate(userPrefsValidation.deleteUserPrefs),
    userPrefsController.deleteUserPrefs
  );

router
  .route('/user/:userId')
  .get(
    auth(),
    validate(userPrefsValidation.getUserPrefsByUserId),
    userPrefsController.getUserPrefsByUserId
  );

export default router;
