# 🎓 Gate Pass Management System 
### *Because sneaking out of college shouldn't be harder than getting in!* 😄

<div align="center">

![Gate Pass](https://img.shields.io/badge/Gate%20Pass-Approved-brightgreen?style=for-the-badge&logo=checkmarx)
![Students](https://img.shields.io/badge/Students-Happy-yellow?style=for-the-badge&logo=smile)
![HODs](https://img.shields.io/badge/HODs-In%20Control-blue?style=for-the-badge&logo=crown)

*The only system where "Permission Denied" actually means something!* 🚪

</div>

---

**Ever wondered what happens when you combine:**
- 🎓 Students who want to escape... err, *leave* campus
- 👨‍🏫 HODs who love saying "NO" (but sometimes say yes)
- 💻 Developers who think everything can be solved with code
- 📱 A mobile app because walking to the office is *so* last century

**You get this beautiful chaos we call the Gate Pass Management System!**

A comprehensive full-stack application that digitizes the ancient art of "asking permission to leave." Now with 100% more JavaScript and 50% less paperwork! 🎉

## 🎪 Features (The Fun Stuff!)

### 🎓 For Students (The Escape Artists):
- **🔐 User Registration & Login**: *"Yes, we need to know who you are before you disappear!"*
- **📝 Create Gate Pass Requests**: Submit your "totally legitimate" reasons for leaving campus
  - *"Going to the dentist" (for the 5th time this month)*
  - *"Family emergency" (your dog misses you)*
  - *"Medical appointment" (with Dr. Pizza)*
- **📊 Track Request Status**: Watch your hopes and dreams get approved or crushed in real-time
- **🔔 Real-time Updates**: Get notifications faster than your HOD can say "REJECTED"

### 👨‍🏫 For HODs (The Gatekeepers):
- **🏰 Department Management**: Rule your digital kingdom with an iron fist (or gentle touch)
- **⚖️ Approve/Reject Requests**: Play god with student freedom
  - *Approve*: "You may pass, young padawan" ✅
  - *Reject*: "Not today, Satan" ❌
- **🕵️ Student Tracking**: Mark students as returned (if they ever come back)
- **📈 Dashboard Analytics**: See how many dreams you've crushed today (with pretty charts!)

### 🎭 System Features (The Magic Behind The Curtain):
- **🎯 Department-based Routing**: Requests magically find their way to the right HOD
- **🔍 USN-based Department Detection**: Our AI is so smart, it knows your department from your USN!
- **🔒 Secure Authentication**: JWT tokens - because we're fancy like that
- **📱 Responsive Design**: Works on everything from your Nokia 3310 to your MacBook Pro
- **🎉 Real-time Notifications**: Toast notifications that are more satisfying than actual toast

## 🛠️ Technology Stack (Our Weapons of Choice)

### 🖥️ Backend (The Brain):
- **Node.js** - *Because JavaScript everywhere is the way!* 🧠
- **Express.js** - *Fast, unopinionated, minimalist... unlike your HOD* ⚡
- **MongoDB** - *NoSQL database that stores more data than your browser history* 🗄️
- **Mongoose** - *Makes MongoDB behave like a good pet* 🐕
- **JWT** - *Tokens so secure, even your password can't crack them* 🔐
- **bcryptjs** - *Hashes passwords better than your cooking skills* 🍳

### 🌐 Web Frontend (The Pretty Face):
- **React.js** - *Because who doesn't love components?* ⚛️
- **React Router** - *Navigation smoother than your pickup lines* 🧭
- **Axios** - *HTTP requests that actually work (unlike your WiFi)* 📡
- **React Toastify** - *Pop-ups that people actually want to see* 🍞
- **React DatePicker** - *Date selection easier than choosing what to eat* 📅
- **Lucide React** - *Icons prettier than your profile picture* 🎨

### 📱 Mobile App (The Pocket Rocket):
- **React Native** - *Write once, debug everywhere!* 📲
- **Expo** - *Development platform smoother than butter* 🧈
- **React Navigation** - *Mobile navigation that won't get you lost* 🗺️
- **AsyncStorage** - *Local storage more reliable than your memory* 💾
- **Expo Vector Icons** - *Icons that spark joy (Marie Kondo approved)* ✨

## 🚀 Installation & Setup (The "Make It Work" Guide)

### 📋 Prerequisites (Stuff You Need First):
- **Node.js (v14 or higher)** - *If you don't have this, what are you even doing here?* 🤔
- **MongoDB** - *The database that will store all your secrets* 🗃️
- **npm or yarn** - *Package managers (choose your fighter)* ⚔️
- **Expo CLI** - *For mobile app wizardry* 🧙‍♂️
- **Coffee** - *Not technically required, but highly recommended* ☕
- **Patience** - *You'll need it when things inevitably break* 😅

### ⚡ Quick Start (For the Impatient):

1. **Clone this masterpiece**
   ```bash
   git clone https://github.com/kd-26-08-04/Gate-Pass-System.git
   cd Gate-Pass-System
   # Take a moment to appreciate what you've just downloaded 🎉
   ```

2. **Run the magic script**
   ```bash
   # This script does everything so you don't have to think
   ./start-system.ps1
   # Sit back, relax, and pray to the coding gods 🙏
   ```

> **Pro Tip**: If the script fails, don't panic! It's not you, it's probably your computer. Or the internet. Or Mercury being in retrograde. 🪐

### 🔧 Manual Setup (For Control Freaks):

#### 🖥️ Backend Setup (The Server Side of Life):

1. **Navigate to the Backend lair**
   ```bash
   cd Backend
   # You're now in the backend. It's dark here, but don't be scared 🕳️
   ```

2. **Install all the things**
   ```bash
   npm install
   # Watch as thousands of dependencies flood your node_modules 📦
   # Yes, it's supposed to take this long. No, your computer isn't broken.
   ```

3. **Create your secret configuration**
   Create a `.env` file (the file that holds all your secrets):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/gatepass
   JWT_SECRET=your_jwt_secret_key_here_make_it_strong
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   # Pro tip: Make JWT_SECRET actually strong, not "password123" 🤦‍♂️
   ```

4. **Wake up MongoDB**
   ```bash
   # Make sure MongoDB is running (it's probably sleeping)
   # If it's not installed, Google is your friend 🔍
   ```

5. **Start the backend magic**
   ```bash
   npm run dev
   # If you see "Server running on port 5000", you're winning! 🎉
   ```

#### 📱 Mobile App Setup (The Pocket-Sized Wonder):

1. **Enter the mobile realm**
   ```bash
   cd mobile-app
   # Welcome to React Native land, where everything is a component 📱
   ```

2. **Install mobile dependencies**
   ```bash
   npm install
   # More packages! Your SSD is crying, but it's worth it 💾
   ```

3. **Start the Expo magic**
   ```bash
   npx expo start
   # A QR code will appear. It's not a secret message, just scan it! 📱
   ```

4. **Run on your device (The moment of truth)**
   - **📱 On your phone**: Download Expo Go app and scan the QR code
   - **🤖 Android emulator**: Press 'a' (for Android, obviously)
   - **🍎 iOS simulator**: Press 'i' (for iPhone, not "I give up")

### 🎯 Where to Find Your Creation:
- **Backend API**: http://gate-pass-system-9vid.onrender.com *(The brain of the operation)*
- **Mobile App**: Wherever Expo takes you *(Usually your phone)*

> **Warning**: If nothing works, try turning it off and on again. If that doesn't work, blame it on the WiFi. If that doesn't work, it's definitely a Monday. 📅

## 📖 Usage Guide (How to Actually Use This Thing)

### 🎓 Student Registration (Join the Club):
1. **Navigate to the registration page** *(It's not hidden, promise)*
2. **Select "Student"** *(Unless you're secretly an HOD in disguise)*
3. **Fill in your details** including USN *(Format: 1XX21CS001 - Yes, it matters!)*
4. **Select your department** *(CS, IT, EC, ME, etc. - Pick your poison)*
5. **Let the magic happen** *(Our system is psychic and detects your department from USN)*

> **Fun Fact**: If you mess up your USN format, our system will judge you silently. 👀

### 👨‍🏫 HOD Registration (Become the Boss):
1. **Go to registration** *(Same page, different destiny)*
2. **Select "Head of Department (HOD)"** *(With great power comes great responsibility)*
3. **Fill in your details** *(Make sure you spell your name right)*
4. **Choose your department kingdom** *(You can only rule one!)*
5. **Note**: Only one HOD per department *(Highlander rules apply)*

### 📝 Creating Gate Pass (The Art of Asking Permission):

**For Students (The Hopeful):**
1. **Login** *(Use the credentials you hopefully remember)*
2. **Click "Create Gate Pass"** *(The button of dreams)*
3. **Fill in the sacred form**:
   - **Reason for exit** *(Be creative, but not TOO creative)*
   - **Destination** *(Where you're "actually" going)*
   - **Exit date and time** *(When you plan to escape)*
   - **Expected return** *(When you promise to come back)*
   - **Emergency contact** *(Someone who cares about you)*
   - **Parent/Guardian contact** *(Someone who REALLY cares about you)*
4. **Submit and pray** *(To the HOD gods)*

> **Pro Tips for Students**:
> - "Going to library" works 60% of the time, every time
> - "Medical emergency" is overused (be original!)
> - "Family function" is a classic for a reason
> - Don't write "Going to party" (unless your HOD is really cool)

### ⚖️ Managing Requests (The Power Trip):

**For HODs (The Decision Makers):**
1. **Login to your throne** *(HOD dashboard)*
2. **View pending requests** *(Your subjects await judgment)*
3. **Review student details** *(Stalk them legally)*
4. **Make your decision**:
   - **✅ Approve**: "You may pass, young grasshopper"
   - **❌ Reject**: "Not today, my friend"
5. **Mark students as returned** *(If they ever come back)*

> **HOD Power Moves**:
> - Approve requests on Fridays (be the cool HOD)
> - Reject suspicious requests (trust your gut)
> - Use the analytics to see patterns (become a data detective)
> - Remember: With great power comes great responsibility (and student complaints)

## 🔌 API Endpoints (The Secret Menu)

*For the developers who like to peek under the hood* 🔍

### 🔐 Authentication (The Bouncer):
- `POST /api/auth/register` - *Join the party (User registration)*
- `POST /api/auth/login` - *Show your ID (User login)*
- `GET /api/auth/me` - *Who am I again? (Get current user)*
- `GET /api/auth/departments` - *What departments exist? (Get departments list)*

### 🎫 Gate Pass Management (The Main Event):
- `POST /api/gatepass/create` - *"Please sir, may I leave?" (Create gate pass)*
- `GET /api/gatepass/my-passes` - *"What's my track record?" (Get student's gate passes)*
- `GET /api/gatepass/pending` - *"Who wants to escape today?" (Get pending requests - HOD only)*
- `GET /api/gatepass/all` - *"Show me everything!" (Get all requests - HOD only)*
- `PUT /api/gatepass/approve/:id` - *"You may pass!" (Approve gate pass)*
- `PUT /api/gatepass/reject/:id` - *"Not today, Satan!" (Reject gate pass)*
- `PUT /api/gatepass/return/:id` - *"Welcome back!" (Mark as returned)*

> **Developer Note**: All endpoints return JSON because we're not savages. Also, don't forget your JWT tokens - the API has trust issues. 🤖

## 🗄️ Database Schema (The Data Vault)

*Where all the digital secrets are stored* 🔐

### 👤 User Model (The People):
```javascript
{
  name: "John Doe", // What your parents call you
  email: "john@college.edu", // Your digital identity
  password: "***", // Hashed better than your breakfast
  userType: "student/hod", // Are you the ruler or the ruled?
  department: "CS", // Your academic tribe
  usn: "1XX21CS001", // Your college DNA (students only)
  phone: "9876543210", // For emergency pizza orders
  isActive: true // Are you still alive?
}
```

### 🎫 GatePass Model (The Golden Ticket):
```javascript
{
  student: ObjectId, // Who wants to escape?
  studentName: "John Doe", // In case we forget
  studentUSN: "1XX21CS001", // The unique identifier
  department: "CS", // Which kingdom they belong to
  reason: "Going to library", // The "official" reason
  destination: "City Library", // Where they claim to go
  exitTime: Date, // When they want to vanish
  expectedReturnTime: Date, // When they promise to return
  actualReturnTime: Date, // When they actually return (if ever)
  status: "pending/approved/rejected/expired", // The verdict
  approvedBy: ObjectId, // The merciful HOD
  approvalDate: Date, // When mercy was granted
  rejectionReason: "Suspicious activity", // Why dreams were crushed
  emergencyContact: "9876543210", // Who to call when things go wrong
  parentContact: "9876543211", // Who to call when things go REALLY wrong
  isReturned: false // Did they come back? (Spoiler: Maybe)
}
```

## 🏫 Department Codes (The Academic Tribes):
- **CS** - Computer Science *(The keyboard warriors)*
- **IT** - Information Technology *(The network ninjas)*
- **EC** - Electronics *(The circuit whisperers)*
- **ME** - Mechanical *(The gear heads)*
- **CV** - Civil *(The bridge builders)*
- **EE** - Electrical *(The power rangers)*
- **CH** - Chemical *(The lab coat legends)*
- **BT** - Biotechnology *(The DNA detectives)*

> **Fun Fact**: Each department has its own personality. CS students request passes to "debug their life," while ME students want to "fix their problems mechanically." 🤓

## 🔒 Security Features (Fort Knox Level):
- **Password hashing with bcrypt** - *Your passwords are safer than your diary* 🔐
- **JWT token-based authentication** - *Tokens that expire faster than your motivation* ⏰
- **Input validation and sanitization** - *We don't trust anyone, not even you* 🧹
- **Department-based access control** - *Stay in your lane, people* 🚧
- **Secure API endpoints** - *Locked tighter than your college WiFi* 🔒

> **Security Motto**: "Trust no one, validate everything, and always assume someone is trying to hack you." - *Paranoid Developer, 2024* 🕵️‍♂️

## 🤝 Contributing (Join the Chaos):
1. **Fork the repository** *(Make it your own)*
2. **Create a feature branch** *(Name it something cool)*
3. **Make your changes** *(Break things, then fix them)*
4. **Test thoroughly** *(Or at least pretend to)*
5. **Submit a pull request** *(And pray we accept it)*

> **Contributor's Creed**: "I solemnly swear to write code that doesn't break production... much." 🤞

## 📄 License (The Legal Stuff):
This project is licensed under the MIT License - which basically means "do whatever you want, but don't blame us if it breaks." 🤷‍♂️

## 🆘 Support (When Things Go Wrong):
- **Create an issue** on GitHub *(We love bug reports)*
- **Contact the development team** *(We're probably debugging something)*
- **Stack Overflow** *(The developer's best friend)*
- **Google** *(When all else fails)*
- **Coffee** *(The ultimate debugging tool)* ☕

---

<div align="center">

### 🎉 **Made with ❤️ and lots of ☕ by developers who understand the struggle** 

*"In a world full of permissions, be someone's approval."* 

**⭐ Star this repo if it made you smile!** ⭐

</div>

---

> **Final Note**: If this system helps you get out of college even once, we've done our job. If it helps you get back in, that's on you! 😄

**Happy Gate Passing!** 🚪✨