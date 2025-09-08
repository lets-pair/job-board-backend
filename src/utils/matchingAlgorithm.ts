import moment from 'moment-timezone';
import prisma from '../client';
import { Languages, OperatingSystem, ProjectRole, SkillLevel } from '@prisma/client';

export interface Persona {
  userId: number;
  language: Languages;
  skillLevel: SkillLevel;
  partnerSkillLevel: SkillLevel;
  projectRole: ProjectRole;
  os: OperatingSystem;
  appointmentId?: string;
  name?: string | null;
  email?: string;
  startTime?: string;
  date?: string;
  station?: string;
}

// Helper function to check compatibility by setting a score system and pairing the best options of the arrays
const isCompatible = (P1: Persona, P2: Persona): number => {
  let score = 0;

  // 1st priority is checking language compatibility
  if (P1.language === P2.language || (P1.language === 'OPEN' && P2.language === 'OPEN')) {
    score += 3;
  } else if (P1.language === 'OPEN' || P2.language === 'OPEN') {
    score += 2;
  } else if (P1.language !== P2.language) {
    score -= 1;
  }

  // Skill level compatibility
  if (P1.skillLevel === 'EXPLORER' && ['EXPLORER', 'BUILDER'].includes(P2.skillLevel)) {
    score += 1;
  }
  if (P1.skillLevel === 'CREATOR' && P2.skillLevel === 'CREATOR') {
    score += 1;
  }

  // 2nd priority is to check project role compatibility
  if (
    (P1.projectRole === 'PROVIDER' && P2.projectRole === 'TAKER') ||
    (P1.projectRole === 'TAKER' && P2.projectRole === 'PROVIDER')
  ) {
    score += 1;
  }

  // Check operating system compatibility
  if (P1.os === P2.os) {
    score += 1;
  }

  return score;
};

// Function to pair personas based on the highest compatibility score
export const pairPersonas = async (): Promise<[Persona, Persona | undefined][]> => {
  const currentDate = moment();
  const pstDate = currentDate.tz('America/Los_Angeles');
  const formattedDate = pstDate.format('DD-MM-YYYY');
  // const formattedTime = pstDate.format('HH:mm');
  const oneHourAhead = pstDate.clone().add(1, 'hours').format('HH:mm');
  const nextHourAppointments = await prisma.appointment.findMany({
    where: {
      startTime: oneHourAhead,
      date: formattedDate,
      isPaired: false
    },
    select: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      id: true,
      userId: true,
      isPaired: true,
      pairedWith: true,
      paymentStatus: true,
      feedback: true,
      date: true,
      startTime: true,
      endTime: true,
      duration: true,
      deletedFor: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (nextHourAppointments?.length > 0) {
    const userIds = nextHourAppointments.map((appointment) => {
      return {
        userId: appointment.userId,
        appointmentId: appointment.id,
        name: appointment.user.name,
        email: appointment.user.email,
        startTime: appointment.startTime,
        date: appointment.date
      };
    });

    const personas: Persona[] = [];
    for (const item of userIds) {
      const userPref: Persona | null = await prisma.userPrefs.findUnique({
        where: {
          userId: item.userId
        },
        select: {
          userId: true,
          language: true,
          skillLevel: true,
          partnerSkillLevel: true,
          projectRole: true,
          os: true
        }
      });

      if (userPref) {
        userPref['appointmentId'] = item.appointmentId;
        userPref['name'] = item.name;
        userPref['email'] = item.email;
        userPref['startTime'] = item.startTime;
        userPref['date'] = item.date;
        personas.push(userPref);
      }
    }
    // run matching algo
    const paired = new Set<number>();
    const resultPairs: [Persona, Persona | undefined][] = [];

    personas.forEach((P1) => {
      if (paired.has(P1.userId)) return;

      const scorePair: { [key: string]: number } = {};

      personas.forEach((P2) => {
        const len = personas.length;
        const maxPossiblePairs = Math.floor(len / 2);

        // If the last person for an odd number of users
        if (maxPossiblePairs === resultPairs.length) {
          scorePair[`${P1.userId}`] = 10; // Set to an arbitrary value
        }

        if (paired.has(P2.userId) || P1.userId === P2.userId) return;

        // Pairing score
        const score = isCompatible(P1, P2);
        scorePair[`${P1.userId},${P2.userId}`] = score;
      });

      // Pick the highest score
      const scoreArr = Object.values(scorePair);
      const maxScore = Math.max(...scoreArr);

      // Find the pair ids
      const maxScorePair =
        Object.keys(scorePair)
          .find((key) => scorePair[key] === maxScore)
          ?.split(',') ?? [];
      const score1 = parseInt(maxScorePair[0], 10);
      const score2 = parseInt(maxScorePair[1], 10);

      // maxScorePair includes the id for the pair
      const objPair1 = personas.find((o) => o.userId === score1);
      const objPair2 = personas.find((o) => o.userId === score2);

      if (objPair1) {
        resultPairs.push([objPair1, objPair2]);
        paired.add(score1);
        if (objPair2) paired.add(score2);
      }
    });
    return resultPairs;
  }

  return [];
};
