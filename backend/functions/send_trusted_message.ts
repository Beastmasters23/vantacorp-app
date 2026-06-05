// File: backend/functions/send_trusted_message.ts

import { sendEmail, sendSMS } from '../utils/communication'; // Assuming these utilities exist or will be proposed separately
import { getTrustedUsersContactInfo } from '../utils/trustedUserManagement'; // Assuming this utility exists

export default async function sendTrustedMessage(
  recipientUserId: string,
  subject: string,
  body: string,
  channels: ('email' | 'sms')[] = ['email']
) {
  // Authentication and authorization checks for trusted users will happen at the API gateway
  // and in the `trustedUserManagement` module.

  // Retrieve contact information for the specified trusted user
  const contactInfo = await getTrustedUsersContactInfo(recipientUserId);

  if (!contactInfo) {
    throw new Error(`Trusted user ${recipientUserId} not found or contact info unavailable.`);
  }

  // Securely send the message through specified channels
  const results = [];
  for (const channel of channels) {
    if (channel === 'email' && contactInfo.email) {
      try {
        const emailResult = await sendEmail(contactInfo.email, subject, body);
        results.push({ channel: 'email', status: emailResult.status, message: emailResult.message });
      } catch (error) {
        results.push({ channel: 'email', status: 'failed', message: error.message });
      }
    } else if (channel === 'sms' && contactInfo.phoneNumber) {
      try {
        const smsResult = await sendSMS(contactInfo.phoneNumber, body);
        results.push({ channel: 'sms', status: smsResult.status, message: smsResult.message });
      } catch (error) {
        results.push({ channel: 'sms', status: 'failed', message: error.message });
      }
    } else {
      results.push({ channel, status: 'skipped', message: `Contact info missing or channel not supported for ${channel}` });
    }
  }

  // Log the secure message attempt for auditability, per UEGM/CPM.
  console.log(`Secure message attempt for ${recipientUserId}:`, JSON.stringify(results));

  return {
    success: results.some(r => r.status === 'sent'),
    results: results,
    auditTrailId: await generateAuditId() // Placeholder for actual audit ID generation
  };
}

async function generateAuditId() {
  // Logic to generate a unique audit ID
  return 'some_unique_audit_id';
}