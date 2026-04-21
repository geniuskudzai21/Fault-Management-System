# ZESA Power Management System - Comprehensive Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Frontend Components](#frontend-components)
4. [Backend API](#backend-api)
5. [Data Models](#data-models)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Key Features](#key-features)
8. [Technical Specifications](#technical-specifications)
9. [Deployment & Configuration](#deployment--configuration)

---

## System Overview

The ZESA Power Management System is a comprehensive web-based application designed to manage electrical fault reporting, technician assignments, load shedding schedules, and customer service operations for Zimbabwe's electricity distribution network. The system provides role-based access for administrators, technicians, and customers, with real-time monitoring and reporting capabilities.

### Core Objectives
- Efficient fault reporting and resolution tracking
- Technician workload management and assignment
- Load shedding schedule management
- Customer service and communication
- Real-time system monitoring and analytics
- Comprehensive reporting and audit trails

---

## Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Tailwind CSS, Recharts for data visualization
- **Backend**: Node.js with Express.js, TypeScript
- **Database**: SQLite with custom ORM
- **Authentication**: JWT-based authentication system
- **API**: RESTful API with comprehensive error handling

### System Architecture Diagram
```
Frontend (React) <---> API Gateway <---> Backend Services <---> Database
       |                     |                |                |
    User Interface      Authentication   Controllers      SQLite DB
    Dashboards           Authorization    Business Logic    Data Storage
    Forms                Middleware        Validation        Relationships
    Charts               Error Handling    API Routes        Indexes
```

---

## Frontend Components

### 1. Authentication System
**Location**: `components/auth/LoginScreen.tsx`
- User login and registration
- Role-based access control
- JWT token management
- Session persistence

### 2. Dashboard Systems

#### Admin Dashboard
**Location**: `components/admin/AdminDashboard.tsx`
- **Real-time Statistics**: Total users, faults, pending issues, today's activity
- **Performance Metrics**: Resolution rates, active issues, system status
- **Quick Actions**: Assign technicians, generate reports, add users
- **Charts**: Fault trends with smooth animations, performance pie charts
- **Recent Activities**: Live activity feed with real-time updates
- **Notifications**: System notifications with unread indicators
- **Search**: Global dashboard search functionality
- **Auto-refresh**: 30-second data refresh intervals

#### Technician Dashboard
**Location**: `components/technician/TechnicianDashboard.tsx`
- **Assigned Faults Management**: View and manage assigned faults
- **Work Notes**: Add and update progress notes for faults
- **Resolution Reports**: Complete fault resolution with detailed reports
- **Performance Tracking**: Average resolution time, completion rates
- **Filtering System**: Status and priority-based filtering
- **Fault Details**: Comprehensive fault information display

#### Customer Dashboard
**Location**: `components/customer/CustomerDashboard.tsx`
- **Fault Reporting**: Submit new fault reports with photo uploads
- **Fault Tracking**: Monitor status of reported faults
- **History**: View past fault reports and resolutions
- **Notifications**: Receive updates on fault progress

### 3. Management Modules

#### User Management
**Location**: `components/admin/UserManagement.tsx`
- User CRUD operations
- Role assignment and permissions
- User status management (Active/Inactive/Pending)
- Bulk operations and filtering

#### Fault Management
**Location**: `components/admin/FaultManagement.tsx`
- Comprehensive fault oversight
- Technician assignment
- Priority management
- Status tracking and updates

#### Load Shedding Management
**Location**: `components/admin/LoadSheddingManagement.tsx`
- Schedule creation and management
- Area-based load shedding
- Impact assessment
- Customer notifications

#### Reporting System
**Location**: `components/admin/GenerateReports.tsx`
- Custom report generation
- Data export capabilities
- Performance analytics
- Historical trend analysis

### 4. Chart Components
**Location**: `components/charts/`

#### FaultTrendChart
- Multi-line fault trend visualization
- Smooth animations and transitions
- Interactive tooltips
- Responsive design
- Custom gradient fills

#### PerformancePieChart
- Fault status distribution
- Animated pie charts
- Interactive legends
- Percentage labels
- Hover effects

### 5. Common Components
**Location**: `components/common/`
- **Button**: Reusable button component with variants
- **Input**: Form input with validation
- **Card**: Flexible card layout component
- **Badge**: Status and priority indicators
- **LoadingSpinner**: Loading state indicators
- **Toast**: Notification system

---

## Backend API

### API Structure
**Base URL**: `http://localhost:3002/api`

### Authentication Endpoints
```
POST /auth/login
POST /auth/register
POST /auth/logout
GET  /auth/profile
```

### User Management
```
GET    /users
GET    /users/:id
POST   /users
PUT    /users/:id
DELETE /users/:id
GET    /users/stats
```

### Fault Management
```
GET    /faults
GET    /faults/:id
POST   /faults
PUT    /faults/:id
DELETE /faults/:id
GET    /faults/stats
GET    /faults/assigned/:technicianId
```

### Load Shedding
```
GET    /schedules
GET    /schedules/:id
POST   /schedules
PUT    /schedules/:id
DELETE /schedules/:id
GET    /schedules/stats
```

### Reports
```
GET    /reports/faults
GET    /reports/performance
GET    /reports/users
POST   /reports/generate
```

### API Features
- **Error Handling**: Comprehensive error responses with proper HTTP status codes
- **Validation**: Input validation using TypeScript interfaces
- **Authentication**: JWT middleware for protected routes
- **Rate Limiting**: API rate limiting for security
- **CORS**: Cross-origin resource sharing configuration
- **Logging**: Request/response logging for debugging

---

## Data Models

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  area: Area;
  role: UserRole;
  isApproved?: boolean;
  registrationDate?: string;
  status?: 'Active' | 'Inactive' | 'Pending';
  isExternal?: boolean;
  lastLogin?: string;
  phone?: string;
  address?: string;
  employeeId?: string;
}
```

### Fault Model
```typescript
interface Fault {
  id: string;
  customerId: string;
  area: Area;
  address: string;
  technician: string;
  technicianId?: string;
  category: FaultCategory;
  priority: Priority;
  status: FaultStatus;
  description: string;
  reportedDate: string;
  assignedDate?: string;
  resolvedDate?: string;
  faultNumber?: string;
  gpsLocation?: { lat: number; lon: number };
  photos: string[];
  signature?: { name: string; timestamp: string };
  resolutionData?: FaultResolutionData;
  customerFeedback?: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
}
```

### LoadSheddingSchedule Model
```typescript
interface LoadSheddingSchedule {
  id: string;
  area: Area;
  startTime: string;
  endTime: string;
  date: string;
  status: LoadSheddingStatus;
  reason: string;
  affectedCustomers: number;
  alternativeSupply: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
```

### Enums and Constants

#### UserRole
```typescript
enum UserRole {
  Admin = 'Admin',
  Technician = 'Technician',
  Customer = 'Customer',
}
```

#### FaultStatus
```typescript
enum FaultStatus {
  Reported = 'Reported',
  Assigned = 'Assigned',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
  Closed = 'Closed',
  Rejected = 'Rejected',
}
```

#### Priority
```typescript
enum Priority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}
```

#### Area (Service Areas)
```typescript
enum Area {
  Avenues = 'Avenues',
  Greenside = 'Greenside',
  Sakubva = 'Sakubva',
  Dangamvura = 'Dangamvura',
  Chikanga = 'Chikanga',
  Hobhouse = 'Hobhouse',
  Murambi = 'Murambi',
  Yeovil = 'Yeovil',
}
```

---

## User Roles & Permissions

### Administrator
- **Dashboard Access**: Full system overview with real-time metrics
- **User Management**: Create, edit, delete users; assign roles
- **Fault Management**: View all faults, assign technicians, override statuses
- **Load Shedding**: Create and manage schedules
- **Reports**: Generate comprehensive reports
- **System Settings**: Configure system parameters
- **Audit Logs**: View system activity logs

### Technician
- **Dashboard Access**: Personal workload and performance metrics
- **Fault Management**: View assigned faults, update statuses, add work notes
- **Resolution Reports**: Complete detailed fault resolution reports
- **Customer Communication**: View customer information and contact details
- **Performance Tracking**: View personal performance statistics

### Customer
- **Dashboard Access**: Personal fault history and status
- **Fault Reporting**: Submit new fault reports with photos
- **Status Tracking**: Monitor fault resolution progress
- **Notifications**: Receive updates on fault status changes
- **Feedback**: Provide feedback on completed work

---

## Key Features

### 1. Real-Time Monitoring
- **Live Statistics**: Real-time updates of system metrics
- **Activity Feed**: Live recent activities across the system
- **Status Indicators**: Visual indicators for system health
- **Auto-refresh**: Automatic data updates every 30 seconds

### 2. Advanced Analytics
- **Fault Trends**: Historical fault pattern analysis
- **Performance Metrics**: Resolution time and completion rates
- **Regional Analysis**: Area-based performance comparison
- **Predictive Analytics**: Trend forecasting for resource planning

### 3. Communication System
- **Notifications**: In-app notification system
- **Email Alerts**: Automated email notifications
- **Status Updates**: Real-time status change notifications
- **Customer Feedback**: Post-resolution feedback collection

### 4. Mobile Responsiveness
- **Responsive Design**: Fully responsive across all devices
- **Touch Interface**: Optimized for mobile interactions
- **Progressive Web App**: PWA capabilities for mobile deployment
- **Offline Support**: Limited offline functionality for critical features

### 5. Security Features
- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control
- **Data Encryption**: Sensitive data encryption
- **Audit Trails**: Comprehensive activity logging
- **Session Management**: Secure session handling

---

## Technical Specifications

### Frontend Requirements
- **React**: 18.2.0+
- **TypeScript**: 4.9+
- **Tailwind CSS**: 3.3+
- **Recharts**: 2.8+ (for data visualization)
- **Node.js**: 16.0+ (for development)

### Backend Requirements
- **Node.js**: 18.0+
- **Express.js**: 4.18+
- **TypeScript**: 4.9+
- **SQLite**: 3.40+
- **JWT**: jsonwebtoken 9.0+

### Database Schema
- **Users Table**: User authentication and profile data
- **Faults Table**: Fault reports and resolution data
- **Schedules Table**: Load shedding schedules
- **Notifications Table**: System notifications
- **AuditLogs Table**: System activity logs

### Performance Optimizations
- **Code Splitting**: Lazy loading for better performance
- **Caching**: API response caching
- **Database Indexing**: Optimized database queries
- **Image Compression**: Optimized photo uploads
- **Bundle Optimization**: Minimized production builds

---

## Deployment & Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=./database.sqlite

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Server
PORT=3002
NODE_ENV=production

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Development Setup
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

### Production Deployment
```bash
# Frontend Build
cd frontend
npm run build

# Backend Start
cd backend
npm start
```

### Docker Configuration
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "start"]

# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["node", "dist/index.js"]
```

---

## Maintenance & Support

### Regular Maintenance Tasks
- **Database Backups**: Daily automated backups
- **Log Rotation**: Weekly log file management
- **Security Updates**: Monthly dependency updates
- **Performance Monitoring**: Continuous performance tracking
- **User Data Cleanup**: Quarterly data archiving

### Monitoring & Alerting
- **System Health**: API endpoint monitoring
- **Database Performance**: Query performance tracking
- **Error Tracking**: Automated error reporting
- **Resource Usage**: CPU and memory monitoring

### Support Channels
- **Technical Support**: Dedicated support team
- **User Documentation**: Comprehensive user guides
- **API Documentation**: Detailed API reference
- **Training Materials**: User training resources

---

## Future Enhancements

### Planned Features
- **Mobile Application**: Native iOS and Android apps
- **AI Integration**: Predictive fault detection
- **IoT Integration**: Smart grid sensor integration
- **Advanced Analytics**: Machine learning insights
- **Multi-tenant Support**: Multiple utility companies

### Scalability Considerations
- **Microservices Architecture**: Service decomposition
- **Cloud Migration**: Cloud hosting options
- **Load Balancing**: High availability setup
- **Database Scaling**: Horizontal scaling options

---

## Conclusion

The ZESA Power Management System represents a comprehensive solution for modern electricity distribution management. With its robust architecture, intuitive user interfaces, and powerful analytics capabilities, the system provides utilities with the tools needed to efficiently manage operations, improve customer service, and optimize resource allocation.

The system's modular design allows for easy expansion and customization, while its security features ensure data protection and regulatory compliance. The real-time monitoring and reporting capabilities enable data-driven decision-making and proactive problem resolution.

This documentation serves as a comprehensive guide for developers, administrators, and stakeholders involved in the deployment, maintenance, and evolution of the ZESA Power Management System.
