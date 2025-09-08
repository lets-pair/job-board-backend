import prisma from '../client';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import Stripe from 'stripe';
import config from '../config/config';
const stripe = new Stripe(config.stripeSecretKey);

/**
 * Create a payment
 * @param {Object} paymentBody
 * @returns {Promise<Payment>}
 */
interface LineItem {
  price_data: {
    currency: 'cad';
    product_data: {
      name: string;
    };
    unit_amount: number;
  };
  quantity: number;
}

interface Metadata {
  [key: string]: string | number;
}
interface CheckoutSession {
  line_items: LineItem[];
  mode: 'payment';
  success_url: string;
  cancel_url: string;
  metadata: Metadata;
}
const makePayment = async (bodyData: CheckoutSession): Promise<string> => {
  const appointmentId = bodyData['metadata']['appointmentId'] as string;
  if (!appointmentId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No Appointment id was provided');
  }
  const appointment = await prisma.appointment.findUnique({
    where: {
      id: appointmentId
    }
  });
  if (!appointment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Appointment was not found');
  }
  if (appointment.paymentStatus === 'PAID') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Appointment is already paid');
  }
  if (appointment.paymentStatus === 'WAIVED') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Appointment is waived');
  }
  const session = await stripe.checkout.sessions.create(bodyData);
  if (!session || !session.url) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to get payment URL');
  }
  return session.url;
};

const successPayment = async (checkoutSessionId: string): Promise<any> => {
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
  console.log(session);
  if (session.payment_status === 'paid' && session.metadata) {
    const amountTotal = session.amount_total;
    const { userId, appointmentId } = session.metadata;
    console.log(typeof amountTotal);
    if (!userId || !appointmentId || !amountTotal) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'userId or appointmentId was not found');
    }
    // update user totals
    await prisma.user.update({
      where: {
        id: Number(userId)
      },
      data: {
        paidAmount: {
          increment: amountTotal
        },
        dueAmount: {
          decrement: amountTotal
        }
      }
    });
    // update appointment status
    await prisma.appointment.update({
      where: {
        id: appointmentId
      },
      data: {
        paymentStatus: 'PAID'
      }
    });
    return session;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment was not successful');
  }
};

export default {
  makePayment,
  successPayment
};
