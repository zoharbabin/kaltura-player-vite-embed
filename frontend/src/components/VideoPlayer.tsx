import { useEffect, useRef, useState } from 'react';
import { config } from '../utils/config';
import api from '../services/api';
import { KalturaPlayer } from '../types';

import './VideoPlayer.css';

// SVG Icons as components
const LoadingIcon = () => (
  <svg className="loading-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeLinecap="round" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="error-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
);

interface VideoPlayerProps {
  entryId?: string;
}

// Use a fixed ID for the player container
const PLAYER_CONTAINER_ID = 'kaltura-player-container';

const VideoPlayer = ({ entryId = config.player.defaultEntryId }: VideoPlayerProps) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<KalturaPlayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(!!window.KalturaPlayer);
  const [playerInitialized, setPlayerInitialized] = useState<boolean>(false);

  // Check if Kaltura Player script is loaded
  useEffect(() => {
    if (window.KalturaPlayer) {
      setScriptLoaded(true);
      return;
    }

    const checkScriptLoaded = () => {
      if (window.KalturaPlayer) {
        setScriptLoaded(true);
      }
    };

    // Check every 500ms if the script has loaded
    const intervalId = setInterval(checkScriptLoaded, 500);
    
    // Set a timeout to stop checking after 10 seconds
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (!window.KalturaPlayer) {
        setError('Kaltura Player script failed to load. Please refresh the page and try again.');
        setIsLoading(false);
      }
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  // Cleanup function to properly destroy the player
  const cleanupPlayer = () => {
    if (playerInstanceRef.current) {
      try {
        console.log('Destroying Kaltura player instance');
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
        setPlayerInitialized(false);
      } catch (err) {
        console.error('Error during player cleanup:', err);
      }
    }
  };

  // Initialize player when script is loaded and entryId changes
  useEffect(() => {
    // Skip if script isn't loaded or player container isn't ready
    if (!scriptLoaded || !playerContainerRef.current) return;
    
    // Always clean up previous player instance first
    cleanupPlayer();
    
    // Delay initialization to ensure DOM is ready
    const initializationTimeout = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get KS token from backend
        let ks: string;
        try {
          ks = await api.getKs(entryId);
          console.log('KS token received successfully');
        } catch (ksError) {
          console.error('Failed to get KS token:', ksError);
          setError('Failed to authenticate with the video service. Please try again later.');
          setIsLoading(false);
          return;
        }

        // Setup player configuration
        const playerConfig = {
          targetId: PLAYER_CONTAINER_ID,
          provider: {
            partnerId: config.player.partnerId,
            uiConfId: config.player.uiConfId,
            ks: ks
          },
          playback: {
            autoplay: false,
            muted: false,
            preload: 'auto' as const
          },
          log: {
            playerVersion: false // Disable player version logging
          }
        };

        try {
          // Create player instance
          playerInstanceRef.current = window.KalturaPlayer.setup(playerConfig);
          
          // Add event listeners
          playerInstanceRef.current.addEventListener('playing', () => {
            console.log('Video started playing');
          });

          playerInstanceRef.current.addEventListener('error', (event) => {
            console.error('Player error:', event);
            setError('An error occurred during playback. Please try again later.');
          });
          
          // Load media
          await playerInstanceRef.current.loadMedia({ entryId });
          console.log('Kaltura player initialized successfully');
          setPlayerInitialized(true);
        } catch (setupError) {
          console.error('Error setting up Kaltura player:', setupError);
          setError('Failed to initialize video player. Please try again later.');
        }
      } catch (err) {
        console.error('Error initializing Kaltura player:', err);
        setError('Failed to initialize video player. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }, 500); // Delay initialization by 500ms to ensure DOM is ready
    
    // Cleanup function
    return () => {
      clearTimeout(initializationTimeout);
      cleanupPlayer();
    };
  }, [entryId, scriptLoaded]); // Re-initialize player when entryId changes or script loads

  // Final cleanup on component unmount
  useEffect(() => {
    return cleanupPlayer;
  }, []);

  return (
    <div className={config.ui.containerClass}>
      {/* Status messages */}
      {isLoading && (
        <div className="player-loading fade-in">
          <LoadingIcon />
          <span>Loading player...</span>
        </div>
      )}
      
      {error && (
        <div className="player-error fade-in">
          <ErrorIcon />
          <span>{error}</span>
          <button
            className="retry-button"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              // Force re-initialization
              const currentEntryId = entryId;
              setTimeout(() => {
                if (playerInstanceRef.current) {
                  playerInstanceRef.current.loadMedia({ entryId: currentEntryId });
                }
                setIsLoading(false);
              }, 1000);
            }}
          >
            Try Again
          </button>
        </div>
      )}
      
      {!scriptLoaded && !error && (
        <div className="player-loading fade-in">
          <LoadingIcon />
          <span>Loading Kaltura Player script...</span>
        </div>
      )}
      
      {/* Player container - always rendered but may be hidden */}
      <div
        id={PLAYER_CONTAINER_ID}
        ref={playerContainerRef}
        className={`${config.ui.playerClass} ${playerInitialized ? 'player-ready' : ''}`}
        style={{
          display: error ? 'none' : 'block',
          width: '100%',
          aspectRatio: '16/9',
          minHeight: '300px',
          backgroundColor: '#000'
        }}
      ></div>
      
      {/* Video info overlay - only shown when player is initialized */}
      {playerInitialized && !isLoading && !error && (
        <div className="video-info-overlay fade-in">
          <div className="video-entry-id">ID: {entryId}</div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;