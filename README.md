# Kaltura Video Player Integration

This project provides a secure integration with the Kaltura video platform, allowing you to embed and play Kaltura videos in your web application.

## Project Structure

- `frontend/`: React-based frontend application with Kaltura Player integration
- `backend/`: Node.js/Express backend for secure Kaltura Session (KS) generation
- `create-env.sh`: Script to create backend environment configuration
- `create-frontend-env.sh`: Script to create frontend environment configuration
- `start-dev.sh`: Development environment launcher script

## Security Features

- All sensitive API credentials are stored in environment variables only
- No hardcoded secrets in the codebase
- Interactive setup scripts for secure configuration
- Proper .gitignore to prevent accidental exposure of secrets

## Prerequisites

- Node.js (v14+)
- npm or yarn
- A Kaltura account with API access

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/kaltura-video-player.git
cd kaltura-video-player
```

### 2. Install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to project root
cd ..
```

### 3. Configure environment variables

Run the setup scripts to create environment configuration files:

```bash
# Make scripts executable
chmod +x create-env.sh create-frontend-env.sh start-dev.sh

# Create backend environment configuration
./create-env.sh

# Create frontend environment configuration
./create-frontend-env.sh
```

You will be prompted to enter the following information:

**Backend Configuration:**
- Kaltura API Endpoint
- Kaltura Partner ID
- Kaltura Admin Secret
- KS Expiry Seconds
- Default Entry ID
- Privacy Context
- App ID
- Virtual Event ID
- Server Port
- CORS Allowed Origins

**Frontend Configuration:**
- API Base URL
- API KS Endpoint
- Kaltura Partner ID
- Kaltura UI Config ID
- Default Entry ID
- Privacy Context
- App ID
- Virtual Event ID

### 4. Start the development environment

```bash
./start-dev.sh
```

This will start both the backend and frontend services in development mode.

## API Documentation

### Backend API

#### `POST /api/ks`

Generates a Kaltura Session token with required privileges.

**Request Body:**
```json
{
  "entryId": "1_abc123" // Optional, defaults to configured value
}
```

**Response:**
```json
{
  "ks": "djJ8MTIzfGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6..."
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Kaltura](https://www.kaltura.com/) for their video platform and API
- [React](https://reactjs.org/) for the frontend framework
- [Express](https://expressjs.com/) for the backend framework