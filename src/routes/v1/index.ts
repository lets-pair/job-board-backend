import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import userPrefsRoute from './userPrefs.route';
import docsRoute from './docs.route';
import config from '../../config/config';
import appointmentRoute from './appointment.route';
import configRoute from './config.route';
import paymentRoute from './payment.route';
import blogRoute from './blog.route';
import emailRoute from './email.route';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/appointment',
    route: appointmentRoute
  },
  {
    path: '/auth',
    route: authRoute
  },
  {
    path: '/users',
    route: userRoute
  },
  {
    path: '/users-prefs',
    route: userPrefsRoute
  },
  {
    path: '/config',
    route: configRoute
  },
  {
    path: '/payment',
    route: paymentRoute
  },
  {
    path: '/blog',
    route: blogRoute
  },
  {
    path: '/email',
    route: emailRoute
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
