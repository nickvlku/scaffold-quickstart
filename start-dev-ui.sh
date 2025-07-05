#!/bin/bash

# Scaffold Quickstart - Start Development with Multi-Pane UI
# This script starts both servers and creates a tmux session with a nice multi-pane view

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    print_error "tmux is not installed. Install with: brew install tmux (macOS) or apt install tmux (Linux)"
    echo ""
    echo "Falling back to regular start-dev.sh..."
    ./start-dev.sh
    exit 0
fi

# Check if we're in the right directory
if [ ! -f "CLAUDE.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "This script must be run from the scaffold-quickstart root directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    print_error "Backend virtual environment not found. Please run ./setup.sh first"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    print_error "Frontend node_modules not found. Please run ./setup.sh first"
    exit 1
fi

print_header "Starting Development Environment with Multi-Pane UI"

# Session name
SESSION_NAME="scaffold-dev"

# Kill existing session if it exists
tmux kill-session -t $SESSION_NAME 2>/dev/null || true

# Create new tmux session (detached)
tmux new-session -d -s $SESSION_NAME

# Set up the layout: 2x2 grid
# Pane 0: Backend server
# Pane 1: Frontend server  
# Pane 2: Backend logs
# Pane 3: Frontend logs

# Split into 4 panes
tmux split-window -h -t $SESSION_NAME:0.0  # Split vertically (pane 1)
#tmux split-window -v -t $SESSION_NAME:0.0  # Split pane 0 horizontally (pane 2) 
#tmux split-window -v -t $SESSION_NAME:0.1  # Split pane 1 horizontally (pane 3)

# Set pane titles and colors
tmux send-keys -t $SESSION_NAME:0.0 'echo -e "\033[0;34m=== BACKEND SERVER ===\033[0m"' Enter
tmux send-keys -t $SESSION_NAME:0.1 'echo -e "\033[0;32m=== FRONTEND SERVER ===\033[0m"' Enter  
#tmux send-keys -t $SESSION_NAME:0.2 'echo -e "\033[0;33m=== BACKEND LOGS ===\033[0m"' Enter
#tmux send-keys -t $SESSION_NAME:0.3 'echo -e "\033[0;35m=== FRONTEND LOGS ===\033[0m"' Enter

# Start backend server in pane 0
tmux send-keys -t $SESSION_NAME:0.0 'cd backend && source venv/bin/activate' Enter
tmux send-keys -t $SESSION_NAME:0.0 'echo "🚀 Starting Django backend server on http://localhost:8000"' Enter
tmux send-keys -t $SESSION_NAME:0.0 'echo "📋 Django Admin: http://localhost:8000/admin"' Enter
tmux send-keys -t $SESSION_NAME:0.0 'echo ""' Enter
tmux send-keys -t $SESSION_NAME:0.0 'python manage.py runserver --noreload' Enter

# Start frontend server in pane 1  
tmux send-keys -t $SESSION_NAME:0.1 'cd frontend' Enter
tmux send-keys -t $SESSION_NAME:0.1 'echo "🚀 Starting Next.js frontend server on http://localhost:3000"' Enter
tmux send-keys -t $SESSION_NAME:0.1 'echo ""' Enter
tmux send-keys -t $SESSION_NAME:0.1 'npm run dev' Enter

# Wait a moment for servers to start and generate logs
sleep 3

# Start log monitoring in panes 2 and 3
#tmux send-keys -t $SESSION_NAME:0.2 'echo "Waiting for backend logs..."' Enter
#tmux send-keys -t $SESSION_NAME:0.2 'sleep 2 && tail -f backend.log || echo "Backend log not found yet..."' Enter

#tmux send-keys -t $SESSION_NAME:0.3 'echo "Waiting for frontend logs..."' Enter  
#tmux send-keys -t $SESSION_NAME:0.3 'sleep 2 && tail -f frontend.log || echo "Frontend log not found yet..."' Enter

# Set up status bar with helpful info
tmux set-option -t $SESSION_NAME status-left "#[fg=blue,bold]Scaffold Dev #[fg=yellow]│ "
tmux set-option -t $SESSION_NAME status-right "#[fg=green]Frontend: :3000 #[fg=blue]│ Backend: :8000 #[fg=yellow]│ #[fg=white]%H:%M"
tmux set-option -t $SESSION_NAME status-left-length 20
tmux set-option -t $SESSION_NAME status-right-length 50

# Set window title
tmux rename-window -t $SESSION_NAME:0 "DevServers"

print_success "tmux session created successfully!"
echo ""
echo -e "${GREEN}🚀 Frontend:      http://localhost:3000${NC}"
echo -e "${GREEN}🔗 Backend API:   http://localhost:8000${NC}"  
echo -e "${GREEN}📋 Django Admin:  http://localhost:8000/admin${NC}"
echo ""
echo -e "${BLUE}tmux Controls:${NC}"
echo "  • Switch panes:  Ctrl+b + arrow keys"
echo "  • Scroll in pane: Ctrl+b + [ (then use arrow keys, 'q' to exit)"
echo "  • Detach session: Ctrl+b + d"
echo "  • Kill session:   Ctrl+b + & (or just close terminal)"
echo ""
echo -e "${YELLOW}Starting tmux session...${NC}"
sleep 1

# Attach to the session (this will take over the terminal)
tmux attach-session -t $SESSION_NAME