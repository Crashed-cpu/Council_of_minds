#!/bin/bash
# Council of Minds — Quick Start
# Run this from the project root in your Codespace terminal

echo ""
echo "⚖  Council of Minds — Starting up"
echo "=================================="
echo ""

# Check GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN is not set."
  echo "   In Codespaces this is set automatically."
  echo "   If running locally: export GITHUB_TOKEN=your_token"
  exit 1
else
  echo "✅ GITHUB_TOKEN found"
fi

# Backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt -q
echo "✅ Backend dependencies installed"

# Start backend in background
echo "🚀 Starting Flask backend on port 5000..."
python app.py &
BACKEND_PID=$!
echo "✅ Backend running (PID $BACKEND_PID)"

# Wait for backend to be ready
sleep 2

# Test backend health
HEALTH=$(curl -s http://localhost:5000/api/health)
echo "✅ Backend health: $HEALTH"

# Frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install --silent
echo "✅ Frontend dependencies installed"

echo ""
echo "🚀 Starting React frontend on port 3000..."
echo ""
echo "=================================="
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo "  (In Codespaces, use the Ports tab)"
echo "=================================="
echo ""

npm start
