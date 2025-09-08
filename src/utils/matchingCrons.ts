import cron from 'node-cron';
import { pairPersonas, Persona } from './matchingAlgorithm';
import prisma from '../client';
import emailService from '../services/email.service';

export const matchingCheck = () => {
  // Schedule tasks to be run on the server.
  cron.schedule('* * * * *', async function () {
    const resultPairs = (await pairPersonas()) as [Persona, Persona | undefined][];

    // list of letters
    const alphabet: string[] = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z'
    ];
    let index = 0;
    if (resultPairs?.length && resultPairs?.length > 0) {
      for (const pair of resultPairs) {
        if (pair[0] && !pair[1]) {
          await prisma.appointment.update({
            where: {
              id: pair[0].appointmentId
            },
            data: {
              station: alphabet[index]
            }
          });
          pair[0]['station'] = alphabet[index];
          continue;
        } else if (pair[0] && pair[1]) {
          // updating first person
          await prisma.appointment.update({
            where: {
              id: pair[0].appointmentId
            },
            data: {
              pairedWith: {
                connect: [{ id: pair[1]?.userId }]
              },
              isPaired: true,
              station: alphabet[index],
              pairedAppointmentId: pair[1].appointmentId
            }
          });
          // updating second person
          await prisma.appointment.update({
            where: {
              id: pair[1].appointmentId
            },
            data: {
              pairedWith: {
                connect: [{ id: pair[0]?.userId }]
              },
              isPaired: true,
              station: alphabet[index],
              pairedAppointmentId: pair[0].appointmentId
            }
          });
          pair[0]['station'] = alphabet[index];
          pair[1]['station'] = alphabet[index];
        }
        index++;
      }
      // send emails
      for (const pair of resultPairs) {
        if (pair[0] && pair[1]) {
          const {
            email: email1,
            name: name1,
            startTime: startTime1,
            date: date1,
            station: station1
          } = pair[0];
          if (email1 && name1 && startTime1 && date1 && station1)
            await emailService.sendPairReminderEmail(email1, name1, startTime1, date1, station1);

          const {
            email: email2,
            name: name2,
            startTime: startTime2,
            date: date2,
            station: station2
          } = pair[1];
          if (email2 && name2 && startTime2 && date2 && station2)
            await emailService.sendPairReminderEmail(email2, name2, startTime2, date2, station2);
        }

        if (pair[0] && !pair[1]) {
          const { email, name, startTime, date, station } = pair[0];
          if (email && name && startTime && date && station)
            await emailService.sendSoloReminderEmail(email, name, startTime, date, station);
        }
      }
    }
  });
};
