🚖 CoverFly — Next Generation Ride Booking Platform
<p align="center"> <img src="https://img.shields.io/badge/Build-Full%20Stack-blue?style=for-the-badge"> <img src="https://img.shields.io/badge/Architecture-Microservices-orange?style=for-the-badge"> <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Tailwind-61DAFB?style=for-the-badge"> <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green?style=for-the-badge"> <img src="https://img.shields.io/badge/DevOps-Docker%20%7C%20Kubernetes-blueviolet?style=for-the-badge"> <img src="https://img.shields.io/badge/Monitoring-Prometheus%20%7C%20Grafana-red?style=for-the-badge"> </p> <p align="center"> <b>Modern, scalable and production-style ride booking ecosystem inspired by Uber & Ola.</b> </p>
✨ Overview

CoverFly is a complete ride booking platform built using modern technologies and scalable architecture. It includes separate interfaces for Riders, Drivers, and Admins with real-time ride updates, secure backend APIs, DevOps deployment pipelines, and monitoring dashboards.

This project demonstrates:

✅ Full Stack Development
✅ Microservices Architecture
✅ Real-Time Communication
✅ Dockerized Infrastructure
✅ Kubernetes Deployment
✅ Monitoring & Observability
✅ CI/CD Ready Workflow

🏗️ Project Structure
CoverFly/
│── apps/
│   ├── web/              # Rider Web Application
│   ├── driver/           # Driver Application
│   └── admin/            # Admin Dashboard
│
│── services/
│   ├── auth-service
│   ├── booking-service
│   ├── payment-service
│   ├── realtime-service
│   ├── notification-service
│   └── api-gateway
│
│── packages/
│   ├── shared-types
│   ├── shared-ui
│   └── configs
│
│── infra/
│   ├── docker
│   ├── kubernetes
│   ├── prometheus
│   ├── grafana
│   └── github-actions
🚀 Main Features
👤 Rider Application
User Registration & Login
Book Instant Ride
Pickup & Destination Selection
Ride Fare Calculation
Payment Checkout
Ride History
Live Driver Tracking
Smooth Responsive UI
🚗 Driver Application
Driver Login
Accept / Reject Ride Requests
Online / Offline Availability
Live Ride Notifications
Earnings Tracking
Ride Completion Status
🛡️ Admin Dashboard
Manage Riders
Manage Drivers
View Ride Analytics
Revenue Reports
Platform Monitoring
User Controls
⚙️ Microservices Used
Service Name	Responsibility
Auth Service	Authentication & JWT
Booking Service	Ride Booking Logic
Payment Service	Transactions
Realtime Service	Socket.io Tracking
Notification Service	Alerts
API Gateway	Single Entry Point
🛠️ Tech Stack
Frontend
React.js
TypeScript
Tailwind CSS
Framer Motion
Axios
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
Socket.io
DevOps & Deployment
Docker
Docker Compose
Kubernetes
Minikube
Prometheus
Grafana
GitHub Actions
🐳 Quick Start (Docker)
1️⃣ Clone Repository
git clone https://github.com/yourusername/CoverFly.git
cd CoverFly
2️⃣ Setup Environment Variables
copy .env.example .env

Edit .env file.

3️⃣ Install Dependencies
npm install
4️⃣ Run Full Stack
npm run docker:up
🌐 Local URLs
Platform	URL
Rider App	http://localhost:3000

Driver App	http://localhost:3001

Admin Panel	http://localhost:3002

API Gateway	http://localhost:4000/healthz

Prometheus	http://localhost:9090

Grafana	http://localhost:3003
Grafana Login
Username: admin
Password: admin
💻 Development Mode

Run without Docker:

npm install
npm run dev

MongoDB must be running locally.

Example:

MONGODB_URI=mongodb://localhost:27017/coverfly
☸️ Kubernetes Deployment
Start Minikube
minikube start
Deploy Resources
kubectl apply -f infra/kubernetes/
Check Pods
kubectl get pods
Check Services
kubectl get svc
📊 Monitoring Dashboard
Prometheus

Tracks service metrics.

http://localhost:9090
Grafana

Visual dashboards for:

CPU Usage
Memory Usage
API Requests
Pod Monitoring
Service Health
http://localhost:3003
🔐 Environment Variables
PORT=
MONGODB_URI=
JWT_SECRET=
REDIS_URL=
SOCKET_PORT=
PAYMENT_KEY=
📸 Recommended Screenshots

Add these in GitHub README later:

Rider Home Page
Booking Page
Driver Dashboard
Admin Panel
Docker Containers
Kubernetes Pods
Grafana Dashboard
🧪 Useful Commands
npm run dev
npm run build
npm run test
npm run lint
npm run docker:up
npm run docker:down
📈 Future Enhancements
Mobile App (React Native)
AI Ride Prediction
Razorpay / Stripe Integration
Google Maps Live Navigation
Push Notifications
Driver Ratings
Multi-language Support
👨‍💻 Developer
Ajoy Debnath

B.Tech CSE Student
Full Stack Developer
DevOps & Cloud Enthusiast

GitHub: https://github.com/yourusername

LinkedIn: https://linkedin.com/in/yourprofile

⭐ Support This Project

If you found this project helpful:

⭐ Star this repository
🍴 Fork it
🛠️ Contribute improvements
