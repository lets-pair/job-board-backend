import cron from 'node-cron';
import prisma from '../client';
import moment from 'moment-timezone';
import emailService from '../services/email.service';

export const postEmailCron = () => {
  cron.schedule(
    '0 19 * * *',
    async () => {
      const currentDate = moment();
      const pstDate = currentDate.tz('America/Los_Angeles');
      const formattedDate = pstDate.format('DD-MM-YYYY');
      const todaysAppointments = await prisma.appointment.findMany({
        where: {
          date: formattedDate
        },
        include: {
          user: true
        }
      });
      for (const appointment of todaysAppointments) {
        if (!appointment || !appointment.user) {
          continue;
        } else {
          emailService.sendPostSessionEmail(appointment.user.email);
        }
      }
    },
    {
      timezone: 'America/Los_Angeles'
    }
  );
};
