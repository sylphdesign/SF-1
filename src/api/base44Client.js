import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "689a32886eb0e9ed7f2d0822", 
  requiresAuth: true // Ensure authentication is required for all operations
});
