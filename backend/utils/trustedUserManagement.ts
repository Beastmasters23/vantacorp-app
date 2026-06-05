// File: backend/utils/trustedUserManagement.ts

import { TrustedUserContactInfo } from '../types/communication'; // Assuming this type will be defined soon

export async function getTrustedUsersContactInfo(userId: string): Promise<TrustedUserContactInfo | undefined> {
  // This is a temporary, hardcoded implementation for initial functionality.
  // In the future, this data should be fetched securely from a database or configuration service.

  const trustedUsers: { [key: string]: TrustedUserContactInfo } = {
    "Frankie": { // Using "Frankie" as the User ID
      email: "delgadofrankie139@gmail.com",
      phoneNumber: "+19033376079",
      preferences: { // Example of future preferences
        receiveCriticalAlerts: true,
        defaultChannel: "sms"
      }
    },
    // Add other trusted users here (Jonah, Kalib) when their info is available
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