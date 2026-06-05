// File: backend/utils/trustedUserManagement.ts

import { TrustedUserContactInfo } from '../types/communication';

export async function getTrustedUsersContactInfo(userId: string): Promise<TrustedUserContactInfo | undefined> {
  // This is a temporary, hardcoded implementation for initial functionality.
  // In the future, this data should be fetched securely from a database or configuration service.

  const trustedUsers: { [key: string]: TrustedUserContactInfo } = {
    "frankie_delgado": { // Using "frankie_delgado" as the User ID
      email: "delgadofrankie139@gmail.com",
      phoneNumber: "+19033376079",
      preferences: { // Example of future preferences
        receiveCriticalAlerts: true,
        defaultChannel: "sms"
      }
    },
    "crazyaj13": { // Adding Jonah Strayer with user ID crazyaj13
      email: "js116466@gmail.com",
      phoneNumber: "+19495547816",
      preferences: {
        receiveCriticalAlerts: true,
        defaultChannel: "email" // Default to email for now, can be adjusted
      }
    } // Add other trusted users here (Kalib) when their info is available
  };

  return trustedUsers[userId];
}

// Temporary type definition for demonstration. Will be moved to a shared types file.
export interface TrustedUserContactInfo {
  email: string;
  phoneNumber?: string;
  preferences?: {
    receiveCriticalAlerts?: boolean;
    defaultChannel?: "email" | "sms";
  };
}