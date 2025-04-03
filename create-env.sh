#!/bin/bash

# Script to create .env file for the Kaltura video backend

# Navigate to the backend directory
cd backend

# Function to prompt for a value with a default
prompt_with_default() {
  local prompt_text=$1
  local default_value=$2
  local var_name=$3
  
  read -p "${prompt_text} [${default_value}]: " input
  # Use default if no input provided
  local value=${input:-$default_value}
  eval "$var_name='$value'"
}

# Prompt for configuration values
echo "Please enter the Kaltura API configuration values:"
prompt_with_default "Kaltura API Endpoint" "https://www.kaltura.com/api_v3/service" KALTURA_API_ENDPOINT
prompt_with_default "Kaltura Partner ID" "" KALTURA_PARTNER_ID
prompt_with_default "Kaltura Admin Secret" "" KALTURA_ADMIN_SECRET
prompt_with_default "KS Expiry Seconds" "86400" KALTURA_KS_EXPIRY_SECONDS
prompt_with_default "Default Entry ID" "" KALTURA_DEFAULT_ENTRY_ID
prompt_with_default "Privacy Context" "" KALTURA_PRIVACY_CONTEXT
prompt_with_default "App ID" "" KALTURA_APP_ID
prompt_with_default "Virtual Event ID" "" KALTURA_VIRTUAL_EVENT_ID
prompt_with_default "Server Port" "3000" PORT
prompt_with_default "CORS Allowed Origins" "*" CORS_ALLOWED_ORIGINS

# Create .env file with provided values
cat > .env << EOL
KALTURA_API_ENDPOINT=${KALTURA_API_ENDPOINT}
KALTURA_PARTNER_ID=${KALTURA_PARTNER_ID}
KALTURA_ADMIN_SECRET=${KALTURA_ADMIN_SECRET}
KALTURA_KS_EXPIRY_SECONDS=${KALTURA_KS_EXPIRY_SECONDS}
KALTURA_DEFAULT_ENTRY_ID=${KALTURA_DEFAULT_ENTRY_ID}
KALTURA_PRIVACY_CONTEXT=${KALTURA_PRIVACY_CONTEXT}
KALTURA_APP_ID=${KALTURA_APP_ID}
KALTURA_VIRTUAL_EVENT_ID=${KALTURA_VIRTUAL_EVENT_ID}
PORT=${PORT}
CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
EOL

echo "Created .env file in backend directory with your configuration values"