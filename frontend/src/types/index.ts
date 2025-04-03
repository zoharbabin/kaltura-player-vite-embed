// Kaltura Player types
declare global {
  interface Window {
    KalturaPlayer: {
      setup: (config: KalturaPlayerConfig) => KalturaPlayer;
    };
  }
}

export interface KalturaPlayerConfig {
  targetId: string;
  provider: {
    partnerId: number;
    uiConfId: number;
    ks?: string;
  };
  playback?: {
    autoplay?: boolean;
    muted?: boolean;
    preload?: 'auto' | 'none';
  };
  ui?: {
    components?: {
      seekbar?: {
        thumbsSprite?: string;
        thumbsWidth?: number;
        thumbsSlices?: number;
      };
    };
  };
  log?: {
    playerVersion?: boolean;
    level?: string;
  };
}

export interface KalturaPlayer {
  loadMedia: (options: { entryId: string }) => Promise<void>;
  addEventListener: (eventName: string, callback: (event: any) => void) => void;
  removeEventListener: (eventName: string, callback: (event: any) => void) => void;
  destroy: () => void;
}

// API response types
export interface KsResponse {
  ks: string;
}

export interface ApiError {
  error: string;
  status: number;
}