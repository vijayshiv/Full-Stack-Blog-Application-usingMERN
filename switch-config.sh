#!/bin/bash

# 🎯 CENTRALIZED CONFIGURATION SWITCHER
# Run: ./switch-config.sh localhost    (for local development)
# Run: ./switch-config.sh 192.168.1.48 (for network access)
# Run: ./switch-config.sh yourdomain.com (for production)

HOST_IP=$1

if [ -z "$HOST_IP" ]; then
    echo "Usage: ./switch-config.sh <host_ip>"
    echo "Examples:"
    echo "  ./switch-config.sh localhost"
    echo "  ./switch-config.sh 192.168.1.48"
    echo "  ./switch-config.sh yourdomain.com"
    exit 1
fi

echo "🔧 Updating configurations to use HOST_IP: $HOST_IP"

# Update server .env.example
sed -i.bak "s/HOST_IP=.*/HOST_IP=$HOST_IP/" server/.env.example
sed -i.bak "s|DB_HOST=.*|DB_HOST=$HOST_IP|" server/.env.example
sed -i.bak "s|REDIS_URL=.*|REDIS_URL=redis://$HOST_IP:6379|" server/.env.example
sed -i.bak "s|REDIS_HOST=.*|REDIS_HOST=$HOST_IP|" server/.env.example
sed -i.bak "s|CLIENT_URL=.*|CLIENT_URL=http://$HOST_IP:5173|" server/.env.example
sed -i.bak "s|AI_SERVICE_URL=.*|AI_SERVICE_URL=http://$HOST_IP:8000|" server/.env.example
sed -i.bak "s|FRONTEND_URL=.*|FRONTEND_URL=http://$HOST_IP:5173|" server/.env.example
echo "✅ Updated server/.env.example"

# Update client .env.example
sed -i.bak "s/VITE_HOST_IP=.*/VITE_HOST_IP=$HOST_IP/" client/.env.example
sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=http://$HOST_IP:4000|" client/.env.example
sed -i.bak "s|VITE_AI_SERVICE_URL=.*|VITE_AI_SERVICE_URL=http://$HOST_IP:8000|" client/.env.example
echo "✅ Updated client/.env.example"

# Update nova-mind .env.example
sed -i.bak "s/HOST_IP=.*/HOST_IP=$HOST_IP/" nova-mind/.env.example
sed -i.bak "s|REDIS_URL=.*|REDIS_URL=redis://$HOST_IP:6379/0|" nova-mind/.env.example
sed -i.bak "s|BACKEND_URL=.*|BACKEND_URL=http://$HOST_IP:4000|" nova-mind/.env.example
echo "✅ Updated nova-mind/.env.example"

# Update client apiURL.js fallback
sed -i.bak "s|http://[^:]*:4000|http://$HOST_IP:4000|" client/src/config/apiURL.js
echo "✅ Updated client/src/config/apiURL.js"

echo ""
echo "🎉 Configuration updated successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Copy .env.example files to .env in each service:"
echo "   cp server/.env.example server/.env"
echo "   cp client/.env.example client/.env" 
echo "   cp nova-mind/.env.example nova-mind/.env"
echo ""
echo "2. Add your API keys to the .env files"
echo ""
echo "3. Restart all services:"
echo "   # Terminal 1: cd server && npm run dev"
echo "   # Terminal 2: cd client && npm run dev"
echo "   # Terminal 3: cd nova-mind && uvicorn app.main:app --reload"

# Clean up backup files
rm -f server/.env.example.bak client/.env.example.bak nova-mind/.env.example.bak client/src/config/apiURL.js.bak 2>/dev/null