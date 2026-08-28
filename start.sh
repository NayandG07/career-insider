#!/bin/bash

# Start the Python AI service in the background on port 8000
echo "Starting Python AI Service..."
cd /app/ai_service
# Run uvicorn on 0.0.0.0:8000
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &

# Wait a couple of seconds for the AI service to boot up
sleep 3

# Start the Node.js backend in the foreground on the port provided by Render (or 5000)
echo "Starting Node.js Backend..."
cd /app/backend
export PORT=${PORT:-5000}
export AI_SERVICE_URL=http://127.0.0.1:8000

# Start node server
npm start
