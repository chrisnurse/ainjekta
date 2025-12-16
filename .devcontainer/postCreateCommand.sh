# This command runs when the container is built
echo "Updating npm..."
npm install -g npm@latest --silent

echo "Running post-create commands..."
echo

echo "Installing backend dependencies..."
cd /workspaces/ainjekta/backend && npm install --silent && npm update --silent
echo
echo "Installing frontend dependencies..."
cd /workspaces/ainjekta/frontend && npm install --silent && npm update --silent