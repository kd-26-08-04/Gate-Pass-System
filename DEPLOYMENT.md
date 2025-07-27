# Deployment Guide

This guide covers various deployment options for the Gate Pass Management System.

## 🚀 Quick Deployment Options

### Option 1: Local Development
```bash
# Clone the repository
git clone https://github.com/kd-26-08-04/Gate-Pass-System.git
cd Gate-Pass-System

# Run the setup script
./start-system.ps1
```

### Option 2: Docker Deployment (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Option 3: Cloud Deployment
- [Heroku](#heroku-deployment)
- [Vercel](#vercel-deployment)
- [AWS](#aws-deployment)
- [DigitalOcean](#digitalocean-deployment)

## 🐳 Docker Deployment

### Prerequisites
- Docker
- Docker Compose

### Setup
1. **Create Docker files** (if not already present):

**Dockerfile (Backend)**:
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY Backend/package*.json ./
RUN npm ci --only=production

COPY Backend/ .

EXPOSE 5000

CMD ["npm", "start"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:4.4
    container_name: gatepass_mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: gatepass

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: gatepass_backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/gatepass
      - JWT_SECRET=your_production_jwt_secret
      - PORT=5000

volumes:
  mongodb_data:
```

2. **Deploy**:
```bash
docker-compose up -d
```

## ☁️ Cloud Deployment

### Heroku Deployment

1. **Install Heroku CLI**
2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

4. **Add MongoDB Atlas**:
   ```bash
   heroku addons:create mongolab:sandbox
   ```

5. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_production_secret
   ```

6. **Create Procfile**:
   ```
   web: cd Backend && npm start
   ```

7. **Deploy**:
   ```bash
   git push heroku master
   ```

### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Create vercel.json**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "Backend/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "Backend/server.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### AWS Deployment

#### Using AWS Elastic Beanstalk

1. **Install EB CLI**
2. **Initialize**:
   ```bash
   eb init
   ```

3. **Create environment**:
   ```bash
   eb create production
   ```

4. **Deploy**:
   ```bash
   eb deploy
   ```

#### Using AWS EC2

1. **Launch EC2 instance**
2. **Install Node.js and MongoDB**
3. **Clone repository**
4. **Set up environment variables**
5. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start Backend/server.js --name "gatepass-backend"
   pm2 startup
   pm2 save
   ```

### DigitalOcean Deployment

#### Using App Platform

1. **Connect GitHub repository**
2. **Configure build settings**:
   - Build Command: `cd Backend && npm install`
   - Run Command: `cd Backend && npm start`

3. **Set environment variables**
4. **Deploy**

#### Using Droplet

1. **Create Ubuntu droplet**
2. **Install Node.js, MongoDB, and Nginx**
3. **Clone repository and setup**
4. **Configure Nginx as reverse proxy**
5. **Use PM2 for process management**

## 📱 Mobile App Deployment

### Expo Managed Workflow

1. **Build for production**:
   ```bash
   cd mobile-app
   expo build:android
   expo build:ios
   ```

2. **Publish to Expo**:
   ```bash
   expo publish
   ```

### React Native CLI

1. **Build Android APK**:
   ```bash
   cd mobile-app
   npx react-native build-android --mode=release
   ```

2. **Build iOS**:
   ```bash
   npx react-native build-ios --mode=Release
   ```

## 🔧 Environment Configuration

### Production Environment Variables

**Backend (.env)**:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-url
JWT_SECRET=your-very-secure-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure JWT secret
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up proper firewall rules
- [ ] Use secure headers middleware
- [ ] Implement rate limiting
- [ ] Set up monitoring and logging

## 🔍 Monitoring and Maintenance

### Health Checks
```bash
# Check backend health
curl https://your-api-domain.com/health

# Check database connection
curl https://your-api-domain.com/api/health/db
```

### Logging
- Use structured logging (Winston, Morgan)
- Set up log aggregation (ELK stack, Splunk)
- Monitor error rates and performance

### Backup Strategy
- Regular database backups
- Code repository backups
- Environment configuration backups

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Check MongoDB URI
   - Verify network connectivity
   - Check authentication credentials

2. **Environment Variables**:
   - Ensure all required variables are set
   - Check variable names and values

3. **Port Conflicts**:
   - Verify port availability
   - Check firewall settings

4. **Memory Issues**:
   - Monitor memory usage
   - Optimize database queries
   - Use connection pooling

### Performance Optimization

- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Optimize database queries
- Use connection pooling
- Enable HTTP/2

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review logs for error messages
3. Create an issue on GitHub
4. Contact the development team

---

**Note**: Replace placeholder values (URLs, secrets, etc.) with your actual production values before deploying.