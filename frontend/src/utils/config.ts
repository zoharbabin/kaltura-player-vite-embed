/**
 * Frontend configuration for the Kaltura video player
 */

// Load environment variables from window object if available
const env = (window as any).ENV || {};

export const config = {
  // API endpoints
  api: {
    baseUrl: env.API_BASE_URL || '/api',
    ksEndpoint: env.API_KS_ENDPOINT || '/api/ks',
  },
  
  // Kaltura player configuration
  player: {
    partnerId: parseInt(env.KALTURA_PARTNER_ID || '0', 10),
    uiConfId: parseInt(env.KALTURA_UICONF_ID || '0', 10),
    defaultEntryId: env.DEFAULT_ENTRY_ID || '', // Default video entry ID
  },
  
  // UI configuration
  ui: {
    containerClass: 'kaltura-player-container',
    playerClass: 'kaltura-player',
    aspectRatio: '16:9',
  }
};