# Learning Management System (LMS)
## 👨‍💻 Developed By
Dhruv Pandya  
Full Stack Developer  

- GitHub: https://github.com/Dhruv3595
- LinkedIn: https://linkedin.com/in/dhruv-pandya07

A robust and scalable full-stack Learning Management System (MERN Stack) designed to help educators create, manage, and deliver educational content while giving students a seamless learning experience.

## 🚀 Features

### For Students:
- **Authentication:** Secure Sign-up, Log-in, and Password-reset options using JWT.
- **Course Catalog:** Browse through different available courses with detailed curriculum.
- **Course Enrollment & Payments:** Secure payment checkout powered by **Razorpay**.
- **Interactive UI:** Smooth transitions, rich user interfaces, and mobile-responsive layout.

### For Administrators/Instructors:
- **Admin Dashboard:** Visualized data insights utilizing Chart.js & Recharts for user and revenue stats.
- **Course Management:** Create, Update, Delete, and Read (CRUD) course details and modules.
- **User Management:** Oversee platform users, roles, and course accesses.
- **Media Uploads:** Native support for uploading course thumbnails and large video files.

## 🛠️ Tech Stack

**Frontend (Client):**
- React 18
- Vite
- Redux Toolkit (State Management)
- Tailwind CSS & DaisyUI (Styling)
- React Router DOM
- Framer Motion (Animations)
- Axios

**Backend (Server):**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for Auth
- Razorpay for Payments
- Nodemailer for email communications
- Multer for File Uploads

## ⚙️ Local Development Setup

### 1. Clone the repository
```bash
git clone <your-repo-link>
cd Learning_Management_System_ELearning
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=<your-mongodb-uri>
CLIENT_URL=http://localhost:5173
JWT_SECRET=<your-jwt-secret>
RAZORPAY_KEY_ID=<your-razorpay-key>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
# add any other necessary mail/uploaders configurations
```
Run the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory with the following variables:
```env
VITE_API_URL=http://localhost:5000/api/v1
```
Run the frontend server:
```bash
npm run dev
```

## 📂 Project Structure

```
Learning_Management_System_ELearning/
├── backend/            # Express server, MongoDB models, Routes, Controllers
└── client/             # React frontend, Redux slices, Tailwind configs
```

## 📜 License
This project is licensed under the ISC License.
