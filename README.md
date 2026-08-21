# ☁️ CloudVault — Enterprise File & Storage Management System

An enterprise-grade, high-performance file management system featuring Multi-Tier Role-Based Access Control (RBAC), Live Telemetry Analytics, Nested Directory Hierarchies, Automated Audit Logging, Real Gmail OTP Verification, and Prisma ORM PostgreSQL Integration.

---

## 📌 1. Project Overview

**CloudVault** is a full-stack, production-ready cloud storage and digital asset management platform designed to deliver secure, performant, and intuitive workspace management for individuals and teams.

### 🌟 Key Capabilities
- **🔐 Multi-Role Access Control (RBAC)**: Distinct permissions for `USER` (file creation, folder organization, uploads, recovery bin) and `ADMIN` (user status elevation, quota control, tenant audits, system telemetry).
- **📧 2FA / Real OTP Delivery**: Instant 6-digit confirmation codes delivered via Google SMTP (Nodemailer) for registration and passwordless verification.
- **📁 Dynamic Directory Hierarchies**: Nested folder trees with breadcrumb path navigation, search by MIME type, extensions, or tags.
- **📊 Real-time Visual Telemetry**: Live storage quota gauges, interactive file type distribution charts (Recharts), and 7-day storage ingestion velocity.
- **🛡️ Comprehensive Audit Trail**: Logs security operations, file mutations, and privilege escalation with IP and User-Agent capture.
- **⚡ Two-Stage Deletion Lifecycle**: Soft-delete quarantine with 1-click restore or hard purge.

---

## 🛠️ 2. Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Icons** | Tailwind CSS, Lucide React, Framer Motion |
| **Data Visualizations** | Recharts (Responsive Pie & Bar Telemetry) |
| **Backend Framework** | Node.js, Express.js (RESTful API) |
| **Authentication & Security** | JWT (JSON Web Tokens), Bcrypt password hashing |
| **Email Service (OTP)** | Nodemailer (Google Gmail SMTP Integration) |
| **Database & ORM** | Neon Serverless PostgreSQL, Prisma ORM |
| **Hosting & Infrastructure** | Vercel (Frontend SPA), Railway (Backend API), Neon (Cloud Database) |

---

## 📂 3. Folder Structure

```
├── 📁 server/                     # ⚡ Backend (Express.js REST API)
│   ├── 📁 controllers/            # Request handlers & logic (Auth, Files, Folders, Admin)
│   ├── 📁 middleware/             # Auth middleware, JWT verification, role validation
│   ├── 📁 routes/                 # REST API endpoints (/auth, /files, /folders, /users, /stats)
│   ├── 📁 services/               # Core business logic (Email/OTP, Storage Quota calculation)
│   ├── 📁 utils/                  # Helper utilities and token generators
│   └── 📁 db/                     # Database client & in-memory caching
│
├── 📁 src/                        # 🎨 Frontend (React 18 + TypeScript)
│   ├── 📁 components/             # Reusable UI components
│   │   ├── 📁 analytics/          # Storage gauges, telemetry graphs, activity logs
│   │   ├── 📁 auth/               # Login, Register, OTP verification modals
│   │   ├── 📁 dashboard/          # Navigation, header, breadcrumbs, search bar
│   │   ├── 📁 files/              # File grid, table list, file previewer, uploader
│   │   ├── 📁 folders/            # Folder tree explorer, folder creation modal
│   │   └── 📁 admin/              # User management, role elevation, audit view
│   ├── 📁 services/               # Frontend API client & Axios/Fetch wrappers
│   ├── 📁 types/                  # TypeScript shared interfaces, models, enums
│   ├── App.tsx                    # Main application orchestration & state
│   ├── main.tsx                   # React root entry point
│   └── index.css                  # Global Tailwind CSS configuration
│
├── 📁 prisma/                     # 🗄️ Database Schemas & Migrations
│   └── schema.prisma              # Relational Prisma models (User, File, Folder, AuditLog)
│
├── 📄 vercel.json                 # Vercel SPA routing & rewrites configuration
├── 📄 netlify.toml                # Netlify SPA deployment configuration
├── 📄 package.json                # Project dependencies & automation scripts
├── 📄 tsconfig.json                # TypeScript compiler configuration
└── 📄 vite.config.ts              # Vite bundler configuration
```

---

## 🔑 4. Environment Variables Configuration

Create a `.env` file in the root directory (or configure them in your deployment hosting dashboards):

```env
# -------------------------------------------------------------
# 🌐 Server & Runtime Configuration
# -------------------------------------------------------------
PORT=3000
NODE_ENV=development

# -------------------------------------------------------------
# 🗄️ Database Connection (Neon PostgreSQL)
# -------------------------------------------------------------
DATABASE_URL="postgresql://<username>:<password>@<neon-host>/neondb?sslmode=require"

# -------------------------------------------------------------
# 🔐 Authentication Secret (JWT)
# -------------------------------------------------------------
JWT_SECRET="tFSMhr4lH10AJfnEDb313oAjXNlEkZBo3wta7DZgoxo"

# -------------------------------------------------------------
# 📧 Gmail SMTP for OTP Verification
# -------------------------------------------------------------
GMAIL_USER="solimanadel304@gmail.com"
GMAIL_PASS="djof exjg wtla hkbh"

# -------------------------------------------------------------
# 🎨 Frontend API Target (Vite / Next.js compatible)
# -------------------------------------------------------------
VITE_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# -------------------------------------------------------------
# 👑 Default Admin Account (Optional Auto-Seed)
# -------------------------------------------------------------
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="AdminPassword123!"
```

---

## 💻 5. Local Development Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/adel/Managing-Your-Files.git
cd Managing-Your-Files
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Database & Prisma
Make sure your `DATABASE_URL` is set in `.env`, then generate and push the database schema:
```bash
npx prisma generate
npx prisma db push
```

### Step 4: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🚀 6. Deployment Guide

### A. Deploy Backend to Railway ⚡

1. Go to [Railway.app](https://railway.app) and sign in with your GitHub account.
2. Click **New Project** ➔ **Deploy from GitHub repo**.
3. Select your repository `Managing-Your-Files`.
4. In the **Variables** tab, add the following environment variables:
   - `DATABASE_URL`: *(Your Neon PostgreSQL connection string)*
   - `JWT_SECRET`: `tFSMhr4lH10AJfnEDb313oAjXNlEkZBo3wta7DZgoxo`
   - `GMAIL_USER`: `solimanadel304@gmail.com`
   - `GMAIL_PASS`: `djof exjg wtla hkbh`
   - `PORT`: `3000`
5. Go to **Settings** ➔ **Networking** ➔ Click **Generate Domain**.
6. Copy your public backend URL (e.g., `https://managing-your-files-production.up.railway.app`).

---

### B. Deploy Frontend to Vercel 🚀

1. Go to [Vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** ➔ **Project**.
3. Import your `Managing-Your-Files` repository.
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://managing-your-files-production.up.railway.app/api`
   - `NEXT_PUBLIC_API_URL`: `https://managing-your-files-production.up.railway.app/api`
5. Click **Deploy**.
6. Your production web application will be live at `https://managing-your-files.vercel.app`!

---

## 🛡️ 7. REST API Endpoints Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user & dispatch OTP email |
| `POST` | `/api/auth/verify-otp` | Public | Verify 6-digit OTP code and issue JWT |
| `POST` | `/api/auth/login` | Public | Authenticate user with credentials |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `GET` | `/api/files` | Authenticated | Fetch files with search, tag, & folder filters |
| `POST` | `/api/files/upload` | Authenticated | Multi-format file ingestion |
| `PATCH` | `/api/files/:id` | Authenticated | Update tags, favorite status, or rename file |
| `DELETE` | `/api/files/:id` | Authenticated | Move file to trash or permanently remove |
| `GET` | `/api/folders` | Authenticated | Retrieve hierarchical folder tree |
| `POST` | `/api/folders` | Authenticated | Create a new nested directory |
| `DELETE` | `/api/folders/:id` | Authenticated | Delete directory and cascade files |
| `GET` | `/api/stats` | Authenticated | Storage quota usage & MIME distribution |
| `GET` | `/api/users` | Admin Only | Administrative user management & status |
| `PATCH` | `/api/users/:id/role` | Admin Only | Promote or demote user roles (`USER`/`ADMIN`) |
| `GET` | `/api/audit-logs` | Admin Only | Full system security audit logs |

---

## 👨‍💻 Author

- **Developer**: Adel Soliman
- **Email**: [adel.s.atwan@gmail.com](mailto:adel.s.atwan@gmail.com)
- **Repository**: [https://github.com/adel/Managing-Your-Files](https://github.com/adel/Managing-Your-Files)

---
<div align="center">
  <sub>Built with ❤️ using React 18, Node.js, Express, Prisma ORM, and Neon PostgreSQL.</sub>
</div>
