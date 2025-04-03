import { useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import { config } from './utils/config';
import './App.css';

// SVG Icons as components
const PlayIcon = () => (
  <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
  </svg>
);

const VideoIcon = () => (
  <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M10 9L15 12L10 15V9Z" fill="currentColor" />
  </svg>
);

function App() {
  const [entryId, setEntryId] = useState<string>(config.player.defaultEntryId);
  const [customEntryId, setCustomEntryId] = useState<string>('');

  const handleEntryIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomEntryId(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEntryId.trim()) {
      setEntryId(customEntryId.trim());
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <VideoIcon />
          Kaltura Video Player
        </h1>
      </header>
      
      <main className="app-main">
        <VideoPlayer entryId={entryId} />
        
        <div className="video-controls">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="entryId">Video Entry ID:</label>
              <input
                type="text"
                id="entryId"
                value={customEntryId}
                onChange={handleEntryIdChange}
                placeholder="Enter Kaltura Entry ID"
                aria-label="Video Entry ID"
              />
              <button type="submit" className="primary-button">
                <PlayIcon />
                Load Video
              </button>
            </div>
          </form>
          
          <div className="current-video-info">
            <p>Currently playing: <strong>{entryId || 'No video selected'}</strong></p>
            {entryId && (
              <div className="video-badge">
                <VideoIcon />
                <span>Active Video</span>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Kaltura Video Embedding Application</p>
        <div className="footer-links">
          <a href="#" className="footer-link">Documentation</a>
          <a href="#" className="footer-link">Support</a>
          <a href="#" className="footer-link">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}

export default App;