import cron from 'node-cron';
import prisma from '../client';
import moment from 'moment-timezone';
import emailService from '../services/email.service';

export const morningReminderCron = () => {
  cron.schedule(
    '0 11 * * *',
    async () => {
      const currentDate = moment();
      const pstDate = currentDate.tz('America/Los_Angeles');
      const formattedDate = pstDate.format('DD-MM-YYYY');
      const todaysAppointments = await prisma.appointment.findMany({
        where: {
          date: formattedDate,
          startTime: {
            not: '12:00'
          }
        },
        include: {
          user: true
        }
      });
      for (const appointment of todaysAppointments) {
        if (!appointment || !appointment.user) {
          continue;
        } else {
          emailService.sendMorningReminderEmail(
            appointment.user.email,
            appointment.user.name,
            appointment.startTime,
            appointment.date
          );
        }
      }
    },
    {
      timezone: 'America/Los_Angeles'
    }
  );
};
