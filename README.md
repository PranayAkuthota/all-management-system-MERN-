# 🎓 LearnHub LMS — MERN Stack
### Ecera System — Software Engineer Assessment Project

A full-featured Learning Management System built with MongoDB, Express.js, React.js, and Node.js.

---

## 📦 Project Structure

```
lms-mern/
├── backend/          # Node.js + Express API
│   ├── models/       # MongoDB Schemas (User, Course, Payment, Coupon)
│   ├── routes/       # REST API Routes
│   ├── middleware/   # JWT Auth Middleware
│   ├── server.js     # Express App Entry
│   └── .env          # Environment Variables
└── frontend/         # React.js App
    └── src/
        ├── pages/    # All Pages
        ├── components/ # Shared Components
        └── context/  # Auth Context
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Edit `.env`:
```
MONGO_URI=mongodb://localhost:27017/lms_ecera
JWT_SECRET=ecera_lms_jwt_secret_2026
PORT=5000
```

Start backend:
```bash
npm run dev     # development (nodemon)
npm start       # production
```

Server runs at: **http://localhost:5000**

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

App runs at: **http://localhost:3000**

> The `"proxy": "http://localhost:5000"` in `frontend/package.json` auto-proxies API calls.

---

## 🔐 Authentication & Roles

| Role        | Access                                |
|-------------|---------------------------------------|
| `student`   | Browse/enroll courses, view dashboard |
| `instructor`| All above + create/manage own courses |
| `admin`     | Full access to all modules            |

**To create an admin:**
1. Register a new account
2. Open MongoDB Compass / Atlas
3. Find the user document
4. Change `role` from `"student"` to `"admin"`

---

## 📋 Modules

### 1. 👥 Users Management (`/admin/users`)
- View all registered users
- Change user roles (student / instructor / admin)
- Delete users

### 2. 📚 Course Management (`/admin/courses`)
- Create / Edit / Delete courses
- Set category, price, publish status
- Add lessons with title, content, duration

### 3. 💳 Payment Management (`/admin/payments`)
- View all transactions
- Revenue stats
- Filter by status (completed / pending / failed)
- Coupon discount tracking

### 4. 🎟️ Coupon Management (`/admin/coupons`)
- Create coupons with percentage or fixed discount
- Set expiry date, usage limits, min purchase
- Activate / deactivate coupons
- Real-time validation at checkout

---

## 🌐 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users` | Get all users (admin) |
| GET | `/api/users/profile` | Get my profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/:id/role` | Change role (admin) |
| DELETE | `/api/users/:id` | Delete user (admin) |

### Courses
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/courses` | Get published courses |
| GET | `/api/courses/all` | Get all courses (admin) |
| GET | `/api/courses/:id` | Get single course |
| POST | `/api/courses` | Create course |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |
| POST | `/api/courses/:id/enroll` | Enroll student |
| POST | `/api/courses/:id/lessons` | Add lesson |

### Payments
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/payments/checkout` | Process payment |
| GET | `/api/payments` | All payments (admin) |
| GET | `/api/payments/my` | My payments |
| GET | `/api/payments/stats` | Revenue stats |

### Coupons
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/coupons` | Create coupon (admin) |
| GET | `/api/coupons` | Get all coupons (admin) |
| POST | `/api/coupons/validate` | Validate coupon |
| PUT | `/api/coupons/:id` | Update coupon |
| DELETE | `/api/coupons/:id` | Delete coupon |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js 18, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT (JSON Web Tokens) |
| Styling | Custom CSS with CSS Variables |
| Notifications | React Toastify |

---

## 📬 Submitted for
**Ecera System LLC / PVT. LTD.**  
HR: Apoorv Johari  
Email: us.hr@ecerasystem.com
