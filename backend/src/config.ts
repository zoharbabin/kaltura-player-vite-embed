/**
 * Configuration management for the Kaltura video embedding application
 * Handles environment variables and default configurations
 */

interface KalturaConfig {
  apiEndpoint: string;
  partnerId: number;
  adminSecret: string;
  ksExpirySeconds: number;
  defaultPrivileges: string[];
}

interface ServerConfig {
  port: number;
  corsAllowedOrigins: string[];
}

interface AppConfig {
  kaltura: KalturaConfig;
  server: ServerConfig;
}

// Function to build default privileges from environment variables
const buildDefaultPrivileges = (): string[] => {
  const defaultEntryId = process.env.KALTURA_DEFAULT_ENTRY_ID || '';
  const privacyContext = process.env.KALTURA_PRIVACY_CONTEXT || '';
  const appId = process.env.KALTURA_APP_ID || '';
  const virtualEventId = process.env.KALTURA_VIRTUAL_EVENT_ID || '';
  
  return [
    'setrole:PLAYBACK_BASE_ROLE',
    defaultEntryId ? `sview:${defaultEntryId}` : '',
    defaultEntryId ? `eventsessioncontextid:${defaultEntryId}` : '',
    privacyContext ? `privacycontext:${privacyContext}` : '',
    'enableentitlement',
    appId ? `appid:${appId}` : '',
    virtualEventId ? `virtualeventid:${virtualEventId}` : '',
    'restrictexplicitliveview:*'
  ].filter(Boolean); // Remove empty strings
};

// Default privileges required for the Kaltura session
const defaultPrivileges = buildDefaultPrivileges();

// Configuration object with defaults and environment variable overrides
const config: AppConfig = {
  kaltura: {
    apiEndpoint: process.env.KALTURA_API_ENDPOINT || '',
    partnerId: parseInt(process.env.KALTURA_PARTNER_ID || '0', 10),
    adminSecret: process.env.KALTURA_ADMIN_SECRET || '',
    ksExpirySeconds: parseInt(process.env.KALTURA_KS_EXPIRY_SECONDS || '86400', 10), // 24 hours by default
    defaultPrivileges
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || '*').split(',')
  }
};

export default config;