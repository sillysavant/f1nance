#!/bin/sh

# Substitute environment variables in the client app
# This runs at container startup to make environment values dynamic

# Create config file that the app will use
cat > /usr/share/nginx/html/config.js << 'EOF'
window.__ENV__ = {
  API_BASE_URL: "${VITE_API_BASE_URL}" || "http://localhost:8000/api/v1"
};
EOF

# Start nginx
exec nginx -g 'daemon off;'
