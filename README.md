# Gate Pass Management System

A comprehensive full-stack application for managing gate pass requests in educational institutions. The system includes both web and mobile applications, allowing students to request gate passes and HODs (Head of Department) to approve or reject these requests.

## Features

### For Students:
- **User Registration & Login**: Students can register with their USN and department details
- **Create Gate Pass Requests**: Submit detailed gate pass requests with reason, destination, and timing
- **Track Request Status**: View all submitted requests and their current status
- **Real-time Updates**: Get instant notifications about request approvals/rejections

### For HODs:
- **Department Management**: HODs can manage gate pass requests for their specific department
- **Approve/Reject Requests**: Review and take action on pending gate pass requests
- **Student Tracking**: Mark students as returned when they come back
- **Dashboard Analytics**: View statistics and manage all requests efficiently

### System Features:
- **Department-based Routing**: Requests automatically go to the respective department HOD
- **USN-based Department Detection**: Student department is automatically detected from USN format
- **Secure Authentication**: JWT-based authentication system
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Notifications**: Toast notifications for all actions

## Technology Stack

### Backend:
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Web Frontend:
- **React.js** - Frontend framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **React DatePicker** - Date/time selection
- **Lucide React** - Icons

### Mobile App:
- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Mobile navigation
- **AsyncStorage** - Local storage
- **Expo Vector Icons** - Icons

## Installation & Setup

### Prerequisites:
- Node.js (v14 or higher)
- MongoDB (local installation)
- npm or yarn
- Expo CLI (for mobile app development)

### Quick Start:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gate-pass-system.git
   cd gate-pass-system
   ```

2. **Setup and start the system**
   ```bash
   # Run the automated setup script
   ./start-system.ps1
   ```

### Manual Setup:

#### Backend Setup:

1. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the Backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/gatepass
   JWT_SECRET=your_jwt_secret_key_here_make_it_strong
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your local machine.

5. **Start the backend server**
   ```bash
   npm run dev
   ```

#### Mobile App Setup:

1. **Navigate to mobile-app directory**
   ```bash
   cd mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the Expo development server**
   ```bash
   npx expo start
   ```

4. **Run on device/emulator**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press 'a' for Android emulator
   - Press 'i' for iOS simulator

The application will be available at:
- Backend API: http://localhost:5000
- Mobile App: Expo development server

## Usage Guide

### Student Registration:
1. Go to the registration page
2. Select "Student" as user type
3. Fill in personal details including USN (format: 1XX21CS001)
4. Select your department
5. The system will automatically detect your department from USN

### HOD Registration:
1. Go to the registration page
2. Select "Head of Department (HOD)" as user type
3. Fill in personal details
4. Select your department
5. Note: Only one HOD per department is allowed

### Creating Gate Pass (Students):
1. Login to your student account
2. Click "Create Gate Pass" from dashboard
3. Fill in all required details:
   - Reason for exit
   - Destination
   - Exit date and time
   - Expected return date and time
   - Emergency contact
   - Parent/Guardian contact
4. Submit the request

### Managing Requests (HODs):
1. Login to your HOD account
2. View pending requests from your department
3. Review student details and request information
4. Approve or reject requests with appropriate reasons
5. Mark students as returned when they come back

## API Endpoints

### Authentication:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/departments` - Get departments list

### Gate Pass Management:
- `POST /api/gatepass/create` - Create gate pass (Student)
- `GET /api/gatepass/my-passes` - Get student's gate passes
- `GET /api/gatepass/pending` - Get pending requests (HOD)
- `GET /api/gatepass/all` - Get all requests (HOD)
- `PUT /api/gatepass/approve/:id` - Approve gate pass (HOD)
- `PUT /api/gatepass/reject/:id` - Reject gate pass (HOD)
- `PUT /api/gatepass/return/:id` - Mark as returned

## Database Schema

### User Model:
- name, email, password
- userType (student/hod)
- department
- usn (for students only)
- phone, isActive

### GatePass Model:
- student (reference to User)
- studentName, studentUSN, department
- reason, destination
- exitTime, expectedReturnTime, actualReturnTime
- status (pending/approved/rejected/expired)
- approvedBy, approvalDate, rejectionReason
- emergencyContact, parentContact
- isReturned

## Department Codes (USN Format):
- CS - Computer Science
- IT - Information Technology
- EC - Electronics
- ME - Mechanical
- CV - Civil
- EE - Electrical
- CH - Chemical
- BT - Biotechnology

## Security Features:
- Password hashing with bcrypt
- JWT token-based authentication
- Input validation and sanitization
- Department-based access control
- Secure API endpoints

## Contributing:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License:
This project is licensed under the MIT License.

## Support:
For any issues or questions, please create an issue in the repository or contact the development team.