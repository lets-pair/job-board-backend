import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { configValidation } from '../../validations';
import { configController } from '../../controllers';

const router = express.Router();

router
  .route('/')
  .post(auth('editConfigs'), validate(configValidation.createConfig), configController.createConfig)
  .get(auth(), validate(configValidation.getConfig), configController.getConfig);

router
  .route('/:configId')
  .patch(
    auth('editConfigs'),
    validate(configValidation.updateConfig),
    configController.updateConfig
  );

export default router;
