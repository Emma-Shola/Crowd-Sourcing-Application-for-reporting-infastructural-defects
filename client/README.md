# 🏗️ InfraWatch - Infrastructure Monitoring Platform

A full-stack web application for reporting and tracking infrastructure issues in communities.

![InfraWatch Screenshot](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-teal)

## 🌟 Features

### 🚨 User Features
- **Report Issues**: Submit infrastructure problems with images and precise locations
- **Real-time Dashboard**: Track your reports with filtering and search
- **Notifications**: Get updates when admins respond to your reports
- **Status Tracking**: Monitor progress from "pending" to "resolved"

### 👨‍💼 Admin Features
- **Dashboard Management**: View and manage all user reports
- **Comment System**: Respond to user reports with detailed feedback
- **Status Updates**: Change report status and notify users

### 🎨 UI/UX
- **Modern Design**: Glass morphism with gradient aesthetics
- **Responsive**: Works on desktop and mobile
- **Virtual Scrolling**: Smooth performance with large datasets
- **Image Carousels**: Multiple image support for reports

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- MongoDB database (local or Atlas)
- Git

### Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret_key
# PORT=5000
npm start