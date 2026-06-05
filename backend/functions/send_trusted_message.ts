// File: backend/functions/send_trusted_message.ts

import { sendEmail, sendSMS } from '../utils/communication';
import { getTrustedUsersContactInfo } from '../utils/trustedUserManagement';

export default async function sendTrustedMessage(
  recipientUserId: string,
  subject: string,
  body: string,
  channels: ('email' | 'sms')[] = ['email']
) {
  const contactInfo = await getTrustedUsersContactInfo(recipientUserId);
  if (!contactInfo) {
    throw new Error(`Trusted user ${recipientUserId} not found or contact info unavailable.`);
  }
  const results = [];
  for (const channel of channels) {
    try {
      if (channel === 'email' && contactInfo.email) {
        const emailResult = await sendEmail(contactInfo.email, subject, body);
        results.push({ channel: 'email', status: emailResult.status, message: emailResult.message });
      } else if (channel === 'sms' && contactInfo.phoneNumber) {
        const smsResult = await sendSMS(contactInfo.phoneNumber, body);
        results.push({ channel: 'sms', status: smsResult.status, message: smsResult.message });
      } else {
        results.push({ channel, status: 'skipped', message: `Contact info missing or channel not supported for ${channel}` });
      }
    } catch (error) {
      results.push({ channel, status: 'error', message: error.message });
    }
  }
  console.log(`Secure message attempt for ${recipientUserId}:`, JSON.stringify(results));
  return {
    success: results.every(r => r.status === 'sent'),
    results: results
  };
}