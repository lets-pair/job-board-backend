import { Appointment, Prisma } from '@prisma/client';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import moment from 'moment-timezone';
import emailService from './email.service';

/**
 * Create a appointment
 * @param {Object} appointmentBody
 * @returns {Promise<Appointment>}
 */
const createAppointment = async (
  userId: number,
  date: string,
  startTime: string,
  endTime: string,
  duration: number
): Promise<Appointment> => {
  // check if user exists
  const userCheck = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!userCheck) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User was not found');
  }

  // Check if user prefs are set.
  const userPref = await prisma.userPrefs.findUnique({
    where: {
      userId
    }
  });
  if (!userPref) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please Complete your user preferances first');
  }
  // Check availability for the sepcified date and time
  const appointmentsPerHour = await prisma.appointment.findMany({
    where: {
      startTime,
      endTime,
      date,
      duration
    }
  });
  // Check if configs are set.
  const configDetails = await prisma.config.findFirst();
  if (!configDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Could not fetch number of computers');
  }

  if (configDetails?.startDay && configDetails?.endDay) {
    const pstDate = moment.tz('America/Los_Angeles');

    const startTimeDate = `${date} ${startTime}`;
    const endTimeDate = `${date} ${endTime}`;
    const startDayDate = `${date} ${configDetails.startDay}`;
    const endDayDate = `${date} ${configDetails.endDay}`;
    const startTimeDateObj = moment.tz(startTimeDate, 'DD-MM-YYYY HH:mm', 'America/Los_Angeles');
    const endTimeDateObj = moment.tz(endTimeDate, 'DD-MM-YYYY HH:mm', 'America/Los_Angeles');
    const startDayDateObj = moment.tz(startDayDate, 'DD-MM-YYYY HH:mm', 'America/Los_Angeles');
    const endDayDateObj = moment.tz(endDayDate, 'DD-MM-YYYY HH:mm', 'America/Los_Angeles');

    // Check if in the past
    if (startTimeDateObj.isBefore(pstDate)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Appointments start time can not be in the past');
    }

    // Check if Appointment is in range
    // isBefore return false when both are same
    if (startTimeDateObj.isBefore(startDayDateObj) || endTimeDateObj.isAfter(endDayDateObj)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Appointment can only be booked when open');
    }
  }

  const appointmentAlreadyBooked = await prisma.appointment.findFirst({
    where: {
      userId,
      date,
      startTime,
      endTime,
      duration
    }
  });
  if (appointmentAlreadyBooked) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You have already booked an appointment for this slot.'
    );
  }
  if (appointmentsPerHour?.length < configDetails?.numComputers * 2) {
    // check if free trial (No previous appointments)
    // const freeTrialCheck = await prisma.appointment.findFirst({
    //   where: {
    //     userId
    //   }
    // });
    // const pstDate = moment.tz('America/Los_Angeles').format('DD-MM-YYYY');
    // const pstDay = moment.tz('America/Los_Angeles').format('dddd');
    const day = moment(date, 'DD-MM-YYYY').format('dddd');
    const pstDayCheck = ['Monday', 'Tuesday', 'Wednesday'].includes(day);
    const freeTrialCheck = await prisma.appointment.count({
      where: {
        date
      }
    });

    const hasFirstSession = await prisma.appointment.findFirst({
      where: {
        userId
      }
    });

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        date,
        startTime,
        endTime,
        duration
      }
    });

    let finalAppointment: Appointment = appointment;
    if (pstDayCheck && freeTrialCheck > 3 && hasFirstSession) {
      // update user totals
      await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          totalAmount: {
            increment: configDetails.sessionCost
          },
          dueAmount: {
            increment: configDetails.sessionCost
          },
          sessionCount: {
            increment: 1
          }
        }
      });
    } else if (pstDayCheck && freeTrialCheck < 4 && hasFirstSession) {
      if (userCheck.guardianEmail && !userCheck.isConsented) {
        await emailService.sendConsentFormEmail(userCheck.guardianEmail, userCheck.name);
      }
      finalAppointment = await prisma.appointment.update({
        where: {
          id: appointment.id
        },
        data: {
          paymentStatus: 'WAIVED'
        }
      });
      // update user totals
      await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          sessionCount: {
            increment: 1
          }
        }
      });
    } else if (!pstDayCheck && hasFirstSession) {
      // update user totals
      await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          totalAmount: {
            increment: configDetails.sessionCost
          },
          dueAmount: {
            increment: configDetails.sessionCost
          },
          sessionCount: {
            increment: 1
          }
        }
      });
    } else if (!hasFirstSession) {
      if (userCheck.guardianEmail && !userCheck.isConsented) {
        await emailService.sendConsentFormEmail(userCheck.guardianEmail, userCheck.name);
      }
      finalAppointment = await prisma.appointment.update({
        where: {
          id: appointment.id
        },
        data: {
          paymentStatus: 'WAIVED'
        }
      });
      // update user totals
      await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          sessionCount: {
            increment: 1
          }
        }
      });
    }
    // send appointment confirmed email
    await emailService.sendAppointmentConfirmationEmail(
      userCheck.email,
      userCheck.name,
      appointment.startTime,
      appointment.date
    );
    return finalAppointment;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'There is no availability! Book for another slot.');
  }
};

/**
 * Create a pair appointment
 * @param {Object} appointmentBody
 * @returns {Promise<Appointment>}
 */
const createPairBooking = async (
  userId: number,
  date: string,
  startTime: string,
  endTime: string,
  duration: number,
  isPaired: boolean,
  email: string,
  pairId?: number
): Promise<Appointment[]> => {
  // check if both ID's are the same
  if (pairId && userId === pairId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Pair id can not be your own id.');
  }
  // Check availability
  const appointmentsPerHour = await prisma.appointment.findMany({
    where: {
      startTime,
      endTime,
      date,
      duration
    }
  });
  const configDetails = await prisma.config.findFirst();
  if (!configDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Could not fetch number of computers');
  }

  const pairExists = await prisma.user.findUnique({
    where: {
      email
    }
  });

  const userExists = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!pairExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Pair not found');
  }
  if (!userExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
  }

  if (pairExists.id === userExists.id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You can not pair with your own email');
  }

  if (configDetails?.startDay && configDetails?.endDay) {
    const pstDate = moment.tz('America/Los_Angeles');

    const startTimeDate = `${date} ${startTime}`;
    const endTimeDate = `${date} ${endTime}`;
    const startDayDate = `${date} ${configDetails.startDay}`;
    const endDayDate = `${date} ${configDetails.endDay}`;
    const startTimeDateObj = moment.tz(startTimeDate, 'DD-MM-YYYY HH:mm', 'America/Los_Angeles');
    const endTimeDateObj = moment.tz(endTimeDate, 'DD-MM-YYYY HH:mm', 'America/Los_Angeles');
    const startDayDateObj = moment.tz(startDayDate, 'DD-MM-YYYY HH:mm', 'America/Los_Angeles');
    const endDayDateObj = moment.tz(endDayDate, 'DD-MM-YYYY HH:mm', 'America/Los_Angeles');

    // Check if in the past
    if (startTimeDateObj.isBefore(pstDate)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Appointments cannot be booked in the past');
    }

    // Check if Appointment is in range
    // isBefore return false when both are same
    if (startTimeDateObj.isBefore(startDayDateObj) || endTimeDateObj.isAfter(endDayDateObj)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Appointment can only be booked when open');
    }
  }

  const appointmentAlreadyBooked = await prisma.appointment.findFirst({
    where: {
      userId,
      date,
      startTime,
      endTime,
      duration
    }
  });
  const pairAppointmentAlreadyBooked = await prisma.appointment.findFirst({
    where: {
      userId: pairExists.id,
      date,
      startTime,
      endTime,
      duration
    }
  });
  if (appointmentAlreadyBooked) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You have already booked an appointment for this slot'
    );
  }
  if (pairAppointmentAlreadyBooked) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Pair partner already has an appointment booked for this slot.'
    );
  }
  // user prefs check
  const user1Pref = await prisma.userPrefs.findUnique({
    where: {
      userId
    }
  });
  const user2Pref = await prisma.userPrefs.findUnique({
    where: {
      userId: pairExists.id
    }
  });
  if (!user1Pref || !user2Pref) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You or your partner have to complete user preferences first'
    );
  }
  if (appointmentsPerHour?.length < configDetails?.numComputers * 2 - 2) {
    const day = moment(date, 'DD-MM-YYYY').format('dddd');
    const pstDayCheck = ['Monday', 'Tuesday', 'Wednesday'].includes(day);
    const freeSessionCheckUser = await prisma.appointment.count({
      where: {
        date
      }
    });

    const userHasFirstSession = await prisma.appointment.findFirst({
      where: {
        userId
      }
    });
    const pairHasFirstSession = await prisma.appointment.findFirst({
      where: {
        userId: pairExists.id
      }
    });

    const userAppointment = await prisma.appointment.create({
      data: {
        userId,
        date,
        startTime,
        endTime,
        duration,
        isPaired,
        pairedWith: {
          connect: [{ id: pairExists.id }]
        }
      }
    });
    const pairAppointment = await prisma.appointment.create({
      data: {
        userId: pairExists.id,
        date,
        startTime,
        endTime,
        duration,
        isPaired,
        pairedWith: {
          connect: [{ id: userId }]
        },
        pairedAppointmentId: userAppointment.id
      }
    });

    const updatedUserAppointment = await prisma.appointment.update({
      where: {
        id: userAppointment.id
      },
      data: {
        pairedAppointmentId: pairAppointment.id
      }
    });

    // update user totals
    let finalUserAppointment = updatedUserAppointment;
    let finalPairAppointment = pairAppointment;
    if (pstDayCheck && freeSessionCheckUser > 3 && userHasFirstSession) {
      await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          totalAmount: {
            increment: configDetails.sessionCost * 2
          },
          dueAmount: {
            increment: configDetails.sessionCost * 2
          },
          sessionCount: {
            increment: 1
          }
        }
      });
    } else if (pstDayCheck && freeSessionCheckUser < 4 && userHasFirstSession) {
      finalUserAppointment = await prisma.appointment.update({
        where: {
          id: userAppointment.id
        },
        data: {
          paymentStatus: 'WAIVED'
        }
      });
    } else if (!pstDayCheck && userHasFirstSession) {
      await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          totalAmount: {
            increment: configDetails.sessionCost * 2
          },
          dueAmount: {
            increment: configDetails.sessionCost * 2
          },
          sessionCount: {
            increment: 1
          }
        }
      });
    } else if (!userHasFirstSession) {
      finalUserAppointment = await prisma.appointment.update({
        where: {
          id: userAppointment.id
        },
        data: {
          paymentStatus: 'WAIVED'
        }
      });
    }
    const freeSessionCheckPair = await prisma.appointment.count({
      where: {
        date
      }
    });
    // update pair totals
    if (pstDayCheck && freeSessionCheckPair > 3 && pairHasFirstSession) {
      await prisma.user.update({
        where: {
          id: pairExists.id
        },
        data: {
          sessionCount: {
            increment: 1
          }
        }
      });
    } else if (pstDayCheck && freeSessionCheckPair < 4 && pairHasFirstSession) {
      finalPairAppointment = await prisma.appointment.update({
        where: {
          id: pairAppointment.id
        },
        data: {
          paymentStatus: 'WAIVED'
        }
      });
    } else if (!pstDayCheck && pairHasFirstSession) {
      await prisma.user.update({
        where: {
          id: pairExists.id
        },
        data: {
          sessionCount: {
            increment: 1
          }
        }
      });
    } else if (!pairHasFirstSession) {
      finalPairAppointment = await prisma.appointment.update({
        where: {
          id: pairAppointment.id
        },
        data: {
          paymentStatus: 'WAIVED'
        }
      });
    }

    return [finalUserAppointment, finalPairAppointment];
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'There is no availability! Book for another slot.');
  }
};

/**
 * Reschedule an appointment
 * @param {Object} appointmentBody
 * @returns {Promise<Appointment>}
 */
const rescheduleAppointment = async (
  appointmentId: string,
  date: string,
  startTime: string,
  endTime: string,
  duration: number
): Promise<Appointment> => {
  // check appointment
  const appointmentCheck = await prisma.appointment.findUnique({
    where: {
      id: appointmentId
    }
  });

  if (!appointmentCheck) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'The Appointment you are trying to reschedule was not found'
    );
  }
  if (appointmentCheck.isPaired) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You can not reschedule your appointment because you are paired.'
    );
  }
  // Check availability
  const appointmentsPerHour = await prisma.appointment.findMany({
    where: {
      startTime,
      endTime,
      date,
      duration
    }
  });
  const configDetails = await prisma.config.findFirst();
  if (!configDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Could not fetch number of computers');
  }
  if (appointmentsPerHour?.length < configDetails?.numComputers * 2) {
    const userDetails = await prisma.user.findUnique({
      where: {
        id: appointmentCheck.userId
      }
    });
    // Check appointments table for concurrent appointment
    //Make sure to update in pairs if 2 people have booked an appointment in pairs, and want to reschedule in the same pair
    const rescheduledAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId
      },
      data: {
        date,
        startTime,
        endTime,
        duration
      }
    });
    // send an email to notify the user.

    if (userDetails && userDetails.name) {
      await emailService.sendRescheduleAppointmentEmail(
        userDetails.email,
        userDetails.name,
        startTime,
        date
      );
    }

    return rescheduledAppointment;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'There is no availability! Book for another slot.');
  }
};

/**
 * Reschedule pair appointments
 * @param {Object} appointmentBody
 * @returns {Promise<Appointment>}
 */
const reschedulePairAppointments = async (
  appointmentId1: string,
  appointmentId2: string,
  date: string,
  startTime: string,
  endTime: string,
  duration: number
): Promise<Appointment> => {
  // check appointments
  const appointmentCheck1 = await prisma.appointment.findUnique({
    where: {
      id: appointmentId1
    }
  });

  const appointmentCheck2 = await prisma.appointment.findUnique({
    where: {
      id: appointmentId2
    }
  });

  if (!appointmentCheck1 || !appointmentCheck2) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'An appointment you are trying to reschedule was not found'
    );
  }

  // chech if both appointments are paired
  const isPairedResult = await isPairedAppointments(
    appointmentId1,
    appointmentId2,
    appointmentCheck1.userId,
    appointmentCheck2.userId
  );
  if (!isPairedResult) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'These appointments are not paired');
  }
  // Check availability
  const appointmentsPerHour = await prisma.appointment.findMany({
    where: {
      startTime,
      endTime,
      date,
      duration
    }
  });
  const configDetails = await prisma.config.findFirst();
  if (!configDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Could not fetch number of computers');
  }
  if (appointmentsPerHour?.length < configDetails?.numComputers * 2 - 1) {
    const userDetails = await prisma.user.findUnique({
      where: {
        id: appointmentCheck1.userId
      }
    });
    // Needed to send the section email
    const userDetails2 = await prisma.user.findUnique({
      where: {
        id: appointmentCheck2.userId
      }
    });

    // Check appointments table for concurrent appointment
    // Make sure both pairs have an appointment together
    const rescheduledAppointment1 = await prisma.appointment.update({
      where: {
        id: appointmentId1
      },
      data: {
        date,
        startTime,
        endTime,
        duration
      }
    });

    await prisma.appointment.update({
      where: {
        id: appointmentId2
      },
      data: {
        date,
        startTime,
        endTime,
        duration
      }
    });
    // send an email to notify both users.

    if (userDetails && userDetails.name) {
      await emailService.sendRescheduleAppointmentEmail(
        userDetails.email,
        userDetails.name,
        startTime,
        date
      );
    }

    if (userDetails2 && userDetails2.name) {
      await emailService.sendRescheduleAppointmentEmail(
        userDetails2.email,
        userDetails2.name,
        startTime,
        date
      );
    }

    return rescheduledAppointment1;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'There is no availability! Book for another slot.');
  }
};

/**
  Check if two appointments are paired
 */
const isPairedAppointments = async (
  appointmentId1: string,
  appointmentId2: string,
  userId1: number,
  userId2: number
) => {
  const pairedWith1 = await prisma.appointment.findUnique({
    where: {
      id: appointmentId1
    },
    select: {
      pairedWith: {
        select: {
          id: true
        }
      }
    }
  });
  const pairedWith2 = await prisma.appointment.findUnique({
    where: {
      id: appointmentId2
    },
    select: {
      pairedWith: {
        select: {
          id: true
        }
      }
    }
  });
  let pair1UserId: number | null = null;
  let pair2UserId: number | null = null;
  if (pairedWith1?.pairedWith && pairedWith1.pairedWith.length === 1) {
    pair1UserId = pairedWith1.pairedWith[0].id;
  }
  if (pairedWith2?.pairedWith && pairedWith2.pairedWith.length === 1) {
    pair2UserId = pairedWith2.pairedWith[0].id;
  }
  return pair1UserId === userId2 && pair2UserId === userId1;
};
/**
 *  Create a manual pair for drop-ins and leftovers from matchmaking algorithm
 */

const createManualPair = async (appointmentId1: string, appointmentId2: string) => {
  // Check if both appointments exist
  const appointmentCheck1 = await prisma.appointment.findUnique({
    where: {
      id: appointmentId1
    }
  });

  const appointmentCheck2 = await prisma.appointment.findUnique({
    where: {
      id: appointmentId2
    }
  });

  if (!appointmentCheck1 || !appointmentCheck2) {
    throw new ApiError(httpStatus.NOT_FOUND, 'One of the appointments was not found');
  }
  const isPairedCheck = await isPairedAppointments(
    appointmentId1,
    appointmentId2,
    appointmentCheck1.userId,
    appointmentCheck2.userId
  );

  if (isPairedCheck) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'These appointments are already paired');
  }

  if (appointmentCheck1.isPaired || appointmentCheck2.isPaired) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'One of these appointments is already paired');
  }

  // check if they both start in the same hour.
  const startTime1 = appointmentCheck1.startTime.slice(0, 2);
  const startTime2 = appointmentCheck2.startTime.slice(0, 2);
  if (startTime1 !== startTime2) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'These appointments do not start within the same hour'
    );
  }

  // Connect two appointments
  const updatedAppointment1 = await prisma.appointment.update({
    where: {
      id: appointmentId1
    },
    data: {
      isPaired: true,
      pairedWith: {
        connect: [{ id: appointmentCheck2.userId }]
      },
      pairedAppointmentId: appointmentId2
    }
  });
  await prisma.appointment.update({
    where: {
      id: appointmentId2
    },
    data: {
      isPaired: true,
      pairedWith: {
        connect: [{ id: appointmentCheck1.userId }]
      },
      pairedAppointmentId: appointmentId1
    }
  });
  return updatedAppointment1;
};

/**
 * Query for appointments
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
type AppointmentWithUser = Prisma.AppointmentGetPayload<{
  select: {
    id: true;
    userId: true;
    isPaired: true;
    pairedAppointmentId: true;
    paymentStatus: true;
    feedback: true;
    date: true;
    startTime: true;
    endTime: true;
    duration: true;
    deletedFor: true;
    createdAt: true;
    updatedAt: true;
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

type SearchFilter = {
  OR: Array<
    | {
        [key: string]: { contains: string | number; mode: 'insensitive' };
      }
    | {
        user: {
          [key: string]: { contains: string | number; mode: 'insensitive' };
        };
      }
    | {
        user: {
          [key: string]: number;
        };
      }
  >;
};

const queryAppointments = async <Key extends keyof AppointmentWithUser>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
    search?: string;
  },
  keys: Key[] = [
    'id',
    'userId',
    'user',
    'isPaired',
    'pairedAppointmentId',
    'paymentStatus',
    'feedback',
    'date',
    'startTime',
    'endTime',
    'duration',
    'deletedFor',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<AppointmentWithUser, Key>[]> => {
  if (options.search) {
    const searchWord = options.search.toLowerCase();
    const searchFilter: SearchFilter = {
      OR: [
        {
          user: {
            name: {
              contains: searchWord,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: searchWord,
              mode: 'insensitive'
            }
          }
        }
      ]
    };
    filter = { AND: [filter, searchFilter] };
  }
  const page = options.page ?? 0;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? 'desc';
  const appointments = await prisma.appointment.findMany({
    where: filter,
    select: keys.reduce((obj, k) => {
      if (k === 'user') {
        return {
          ...obj,
          [k]: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        };
      }
      return { ...obj, [k]: true };
    }, {}),
    skip: page * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined
  });
  return appointments as Pick<AppointmentWithUser, Key>[];
};

/**
 * Get appointment by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Appointment, Key> | null>}
 */
const getAppointmentById = async <Key extends keyof AppointmentWithUser>(
  id: string,
  keys: Key[] = [
    'id',
    'userId',
    'isPaired',
    'pairedAppointmentId',
    'user',
    'paymentStatus',
    'feedback',
    'date',
    'startTime',
    'endTime',
    'duration',
    'deletedFor',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<AppointmentWithUser, Key> | null> => {
  const appointment = (await prisma.appointment.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => {
      if (k === 'user') {
        return {
          ...obj,
          [k]: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        };
      }
      return { ...obj, [k]: true };
    }, {})
  })) as Promise<Pick<AppointmentWithUser, Key> | null>;
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  }
  return appointment;
};
interface Availability {
  [hour: string]: { totalBooked: number; userBooked: boolean };
}
/*
{time: 9:00,
isAvailable:true}
*/
const getAvailability = async (date: string, userId: number): Promise<Availability | []> => {
  // Good Friday 2025
  if (date === '18-04-2025' || date === '2025-04-18') {
    return [];
  }
  // Config
  const configDetails = await prisma.config.findFirst();

  const startDay = configDetails?.startDay;
  const endDay = configDetails?.endDay;
  if (!startDay || !endDay) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'start day or end day is not defined');
  }
  const datePST = moment.tz('America/Los_Angeles');
  const hourNowPST = datePST.hour(); // returns 0-23 that's why i add one to it
  const formattedDate = datePST.format('DD-MM-YYYY');

  let startDayInt = parseInt(startDay.split(':')[0]);
  if (startDayInt < hourNowPST && formattedDate === date) {
    startDayInt = hourNowPST + 1;
  } else if (startDayInt === hourNowPST && formattedDate === date) {
    startDayInt = hourNowPST + 1;
  }
  const startDayStr = startDayInt < 10 ? '0' + startDayInt + ':00' : startDayInt + ':00';
  const endDayInt = parseInt(endDay.split(':')[0]);
  const availability: Availability = {};
  const arrayLength = endDayInt - startDayInt; // 19 - 11 = 8
  // generate availability list structure
  for (let i = 0; i < arrayLength; i++) {
    let hour;
    if (startDayInt + i < 10) {
      hour = '0' + (startDayInt + i) + ':00';
    } else {
      hour = startDayInt + i + ':00';
    }

    availability[hour] = { totalBooked: 0, userBooked: false };
  }

  // for Sundays (0) and Saturdays(6)
  const dateObj = moment(date, 'DD-MM-YYYY');
  if (dateObj.day() === 0 || dateObj.day() === 6) {
    return [];
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      date,
      startTime: {
        gte: startDayStr
      }
    }
  });
  appointments.forEach((appointment) => {
    if (availability.hasOwnProperty(appointment.startTime)) {
      availability[appointment.startTime]['totalBooked'] += 1;
    }

    if (appointment.userId === userId) {
      availability[appointment.startTime]['userBooked'] = true;
    }
  });
  return availability;
};

/**
 * Update appointment by id
 * @param {ObjectId} appointmentId
 * @param {Object} updateBody
 * @returns {Promise<Appointment>}
 */
const updateAppointmentById = async <Key extends keyof AppointmentWithUser>(
  appointmentId: string,
  updateBody: Prisma.AppointmentUpdateInput,
  keys: Key[] = [
    'id',
    'userId',
    'isPaired',
    'paymentStatus',
    'pairedAppointmentId',
    'user',
    'feedback',
    'date',
    'startTime',
    'endTime',
    'duration',
    'deletedFor',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<AppointmentWithUser, Key> | null> => {
  const appointment = await getAppointmentById(appointmentId, ['id', 'userId']);
  const config = await prisma.config.findFirst();
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  }
  const updatedAppointment = (await prisma.appointment.update({
    where: { id: appointment.id },
    data: updateBody,
    select: keys.reduce((obj, k) => {
      if (k === 'user') {
        return {
          ...obj,
          [k]: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        };
      }
      return { ...obj, [k]: true };
    }, {})
  })) as AppointmentWithUser;
  if (updateBody?.paymentStatus === 'PAID' && config) {
    await prisma.user.update({
      where: {
        id: appointment.userId
      },
      data: {
        dueAmount: {
          decrement: config.sessionCost
        },
        paidAmount: {
          increment: config.sessionCost
        }
      }
    });
  }
  if (updateBody?.deletedFor === 'CANCELLED' && config) {
    const { email, name } = updatedAppointment.user;
    emailService.sendCancelationEmail(
      email,
      name,
      updatedAppointment.startTime,
      updatedAppointment.date
    );
  }
  return updatedAppointment as Pick<AppointmentWithUser, Key> | null;
};

/**
 * Delete appointment by id
 * @param {ObjectId} appointmentId
 * @returns {Promise<Appointment>}
 */
const deleteAppointmentById = async (appointmentId: string): Promise<AppointmentWithUser> => {
  const appointment = await getAppointmentById(appointmentId);
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  }
  await prisma.appointment.delete({ where: { id: appointment.id } });
  return appointment;
};

export default {
  createAppointment,
  createPairBooking,
  createManualPair,
  rescheduleAppointment,
  reschedulePairAppointments,
  queryAppointments,
  getAppointmentById,
  updateAppointmentById,
  deleteAppointmentById,
  getAvailability
};
