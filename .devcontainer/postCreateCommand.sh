# This command runs when the container is built
echo "Running post-create commands..."
echo

echo "Install package manager and task runner..."
npm install -g npm@latest concurrently@latest --silent

echo "Installing backend dependencies..."
cd /workspaces/ainjekta/backend && npm install --silent && npm update --silent
echo
echo "Installing frontend dependencies..."
cd /workspaces/ainjekta/frontend && npm install --silent && npm update --silent