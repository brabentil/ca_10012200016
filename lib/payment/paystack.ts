import axios, { AxiosError } from 'axios';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackChargeResponse {
  status: boolean;
  message: string;
  data: {
    amount: number;
    currency: string;
    transaction_date: string;
    status: string;
    reference: string;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
    customer: {
      id: number;
      customer_code: string;
      email: string;
    };
  };
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    fees: number;
    customer: {
      id: number;
      customer_code: string;
      email: string;
      first_name: string | null;
      last_name: string | null;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
  };
}

/**
 * Initialize a Paystack transaction
 * @param email - Customer email
 * @param amount - Amount in kobo (multiply GHS by 100)
 * @param reference - Unique transaction reference
 * @param metadata - Additional transaction data
 * @param channels - Payment channels to enable (e.g., ['card', 'mobile_money'])
 * @returns Payment URL and transaction reference
 */
export async function initializeTransaction(
  email: string,
  amount: number,
  reference: string,
  metadata?: Record<string, any>,
  channels?: string[]
): Promise<PaystackInitializeResponse> {
  try {
    // Get callback URL from environment or construct default
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/payment/verify`;

    const response = await axios.post<PaystackInitializeResponse>(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        reference,
        callback_url: callbackUrl,
        metadata,
        channels: channels || ['card', 'mobile_money'],
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        `Paystack initialization failed: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}

/**
 * Charge a saved authorization code
 * @param authorizationCode - Authorization code from previous transaction
 * @param email - Customer email
 * @param amount - Amount in kobo (multiply GHS by 100)
 * @param reference - Unique transaction reference
 * @returns Transaction result
 */
export async function chargeAuthorization(
  authorizationCode: string,
  email: string,
  amount: number,
  reference: string
): Promise<PaystackChargeResponse> {
  try {
    const response = await axios.post<PaystackChargeResponse>(
      `${PAYSTACK_BASE_URL}/transaction/charge_authorization`,
      {
        authorization_code: authorizationCode,
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        reference,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        `Paystack charge failed: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}

/**
 * Verify Paystack webhook signature
 * @param signature - X-Paystack-Signature header value
 * @param payload - Raw request body
 * @returns True if signature is valid
 */
export function verifyWebhookSignature(signature: string, payload: string): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest('hex');

  return hash === signature;
}

/**
 * Verify a transaction
 * @param reference - Transaction reference
 * @returns Transaction details
 */
export async function verifyTransaction(reference: string): Promise<any> {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        `Transaction verification failed: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}
