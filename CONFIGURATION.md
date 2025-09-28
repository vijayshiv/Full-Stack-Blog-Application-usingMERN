# 🎯 Centralized Configuration System

This project now uses **centralized configuration** - change the host IP in **ONE PLACE** to update all services!

## 🚀 Quick Configuration Switch

### Option 1: Using the Script (Recommended)

```bash
# Switch to localhost (local development)
./switch-config.sh localhost

# Switch to network IP (for other devices on WiFi)
./switch-config.sh 192.168.1.48

# Switch to production domain
./switch-config.sh yourdomain.com
```

### Option 2: Manual Configuration

Edit these variables in the `.env.example` files, then copy to `.env`:

**Server (.env):**

```env
HOST_IP=localhost  # Change this value
```

**Client (.env):**

```env
VITE_HOST_IP=localhost  # Change this value
```

**Nova Mind (.env):**

```env
HOST_IP=localhost  # Change this value
```

## 📁 Configuration Files

| Service        | Environment File                            | Config File                   |
| -------------- | ------------------------------------------- | ----------------------------- |
| **Backend**    | `server/.env.example` → `server/.env`       | `server/src/config/index.ts`  |
| **Frontend**   | `client/.env.example` → `client/.env`       | `client/src/config/apiURL.js` |
| **AI Service** | `nova-mind/.env.example` → `nova-mind/.env` | `nova-mind/app/config.py`     |

## ⚡ Setup Process

1. **Configure Host IP:**

   ```bash
   ./switch-config.sh localhost  # or your preferred host
   ```

2. **Copy Environment Files:**

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   cp nova-mind/.env.example nova-mind/.env
   ```

3. **Add Your API Keys** to the `.env` files:

   - Add Groq API key to `nova-mind/.env`
   - Add Gmail credentials to `server/.env`

4. **Start All Services:**

   ```bash
   # Terminal 1: Backend
   cd server && npm run dev

   # Terminal 2: Frontend
   cd client && npm run dev

   # Terminal 3: AI Service
   cd nova-mind && uvicorn app.main:app --reload
   ```

## 🔄 Switching Between Environments

### Local Development

```bash
./switch-config.sh localhost
```

- Access: http://localhost:5173

### Network Access (Other Devices)

```bash
./switch-config.sh 192.168.1.48  # Your actual IP
```

- Access from any device: http://192.168.1.48:5173

### Production

```bash
./switch-config.sh yourdomain.com
```

- Access: https://yourdomain.com

## 🎯 What Gets Updated

When you change the host IP, these URLs are automatically updated:

- **Backend API**: `http://HOST_IP:4000`
- **Frontend**: `http://HOST_IP:5173`
- **AI Service**: `http://HOST_IP:8000`
- **Redis**: `redis://HOST_IP:6379`
- **MySQL**: `HOST_IP`
- **Meeting URLs**: `http://HOST_IP:5173/meeting/*`
- **WebRTC Configuration**: Uses updated frontend URL
- **Socket.io**: Uses updated backend URL

## 🛠️ How It Works

1. **Environment Variables**: Each service reads `HOST_IP` from its `.env` file
2. **Fallback Values**: If `.env` is missing, defaults to `localhost`
3. **Cross-Service URLs**: All services reference each other using the same `HOST_IP`
4. **Configuration Files**: Updated to use environment variables instead of hardcoded URLs

No more hunting through multiple files to change IPs! 🎉
