import { Router, Request, Response } from 'express';

const router = Router();

// Endpoint providing all structured deliverables files
router.get('/files', (req: Request, res: Response): void => {
  const deliverables = {
    prismaSchema: `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
}

enum VerificationType {
  EMAIL_VERIFICATION
  PASSWORD_RESET
}

enum FileCategory {
  IMAGE
  DOCUMENT
  AUDIO
  VIDEO
  ARCHIVE
  CODE
  OTHER
}

model User {
  id                String             @id @default(uuid())
  email             String             @unique
  name              String
  passwordHash      String
  role              Role               @default(USER)
  isVerified        Boolean            @default(false)
  status            UserStatus         @default(ACTIVE)
  avatarUrl         String?
  storageQuotaBytes BigInt             @default(524288000) // 500 MB
  usedStorageBytes  BigInt             @default(0)
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  files             File[]
  folders           Folder[]
  verificationCodes VerificationCode[]
  auditLogs         AuditLog[]

  @@map("users")
}

model VerificationCode {
  id        String           @id @default(uuid())
  email     String
  code      String           // 6-digit OTP
  type      VerificationType @default(EMAIL_VERIFICATION)
  expiresAt DateTime
  createdAt DateTime         @default(now())

  user      User?            @relation(fields: [email], references: [email], onDelete: Cascade)

  @@index([email, type])
  @@map("verification_codes")
}

model Folder {
  id        String   @id @default(uuid())
  userId    String
  name      String
  parentId  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent    Folder?  @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children  Folder[] @relation("FolderHierarchy")
  files     File[]

  @@map("folders")
}

model File {
  id               String       @id @default(uuid())
  userId           String
  folderId         String?
  name             String
  originalName     String
  mimeType         String
  sizeBytes        BigInt
  extension        String
  category         FileCategory @default(OTHER)
  storagePath      String
  extractedContent String?      @db.Text
  isTrashed        Boolean      @default(false)
  trashedAt        DateTime?
  downloadsCount   Int          @default(0)
  tags             String[]     @default([])
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  user             User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  folder           Folder?      @relation(fields: [folderId], references: [id], onDelete: SetNull)

  @@index([userId, isTrashed])
  @@index([category])
  @@map("files")
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  userEmail String?
  action    String
  details   String
  ipAddress String?
  timestamp DateTime @default(now())

  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}`,

    backendServerTs: `// server/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import fileRoutes from './routes/files';
import userRoutes from './routes/users';
import folderRoutes from './routes/folders';
import statsRoutes from './routes/stats';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads static directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/files', fileRoutes);
app.use('/users', userRoutes);
app.use('/folders', folderRoutes);
app.use('/stats', statsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`Backend REST API server running on port \${PORT}\`);
});`,

    backendPackageJson: `{
  "name": "managing-your-files-server",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "nodemon --watch src --exec tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "seed": "tsx src/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.10.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.11"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.11.24",
    "@types/nodemailer": "^6.4.14",
    "nodemon": "^3.1.0",
    "prisma": "^5.10.0",
    "tsx": "^4.7.1",
    "typescript": "^5.3.3"
  }
}`,

    frontendPackageJson: `{
  "name": "managing-your-files-client",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.28.4",
    "axios": "^1.6.7",
    "clsx": "^2.1.0",
    "framer-motion": "^11.0.8",
    "lucide-react": "^0.358.0",
    "next": "^14.1.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-dropzone": "^14.2.3",
    "react-hot-toast": "^2.4.1",
    "recharts": "^2.12.2",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.24",
    "@types/react": "^18.2.61",
    "@types/react-dom": "^18.2.19",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}`,

    dockerCompose: `version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: files_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: managing_files_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: files_backend
    environment:
      PORT: 8080
      DATABASE_URL: postgresql://postgres:postgrespassword@postgres:5432/managing_files_db?schema=public
      JWT_SECRET: your_super_secure_jwt_secret_key_2026
      ADMIN_EMAIL: admin@example.com
      ADMIN_PASSWORD: Admin123
      CLIENT_URL: http://localhost:3000
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    volumes:
      - ./server/uploads:/app/uploads
    restart: always

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: files_frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:`,

    readme: `# CloudVault - Enterprise Cloud Storage & File Workspace Platform

A complete, production-ready Full Stack File Management & Workspace System built with **Next.js / React 19**, **Express.js (TypeScript)**, **Prisma ORM**, **PostgreSQL**, and **JWT Authentication**.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **User Registration & Login** with secure \`bcrypt\` password hashing.
- **JWT Authentication** with Bearer token authentication header.
- **Email Verification via 6-Digit OTP** with expiration and resend cooldown.
- **Role-Based Access Control (RBAC)**: Distinct \`USER\` and \`ADMIN\` permissions.
- **User Profile Management**: Update avatar, name, and change password.

### 📁 User File Management
- **Multi-File Drag & Drop Upload** powered by Multer with real-time progress indicators.
- **File Validation**: Enforces MIME types and storage quota limits per user.
- **Rich File Details & Content Extraction**: Auto-detects file categories (Documents, Code, Images, Audio, Video, Archives) and extracts preview snippets.
- **Search, Filter & Sort**: Instant multi-condition search, category chips, and sort by date, size, name, type.
- **Folder Management**: Organize files into hierarchical folders.
- **Soft Delete & Trash Bin**: Recover accidentally deleted files or permanently purge them.
- **Binary Download Stream**: Direct file download support.
- **User Analytics Dashboard**: Storage quota gauge, file category distribution pie chart, and upload history timeline.

### 🛡️ Administrator Features
- **Admin Dashboard**: System-wide statistics (Total users, total storage, total files, top uploaded extensions, recent uploads).
- **User Management**: View all users, search by name/email, change roles (\`USER\` / \`ADMIN\`), suspend/activate accounts, and delete users.
- **Global File Management**: View, download, or delete any file in the system.
- **Audit Logs**: Immutable log of security events (logins, uploads, deletions, role updates).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 / React 19, TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Axios, Lucide Icons, Recharts.
- **Backend**: Express.js, TypeScript, Prisma ORM, PostgreSQL, JWT, Multer, Bcrypt.js.
- **DevOps**: Docker, Docker Compose.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.x
- PostgreSQL database (or use the included Docker Compose)

### 2. Environment Setup

#### Backend \`.env\` (\`server/.env\`):
\`\`\`env
PORT=8080
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/managing_files_db?schema=public"
JWT_SECRET="super_secret_jwt_key_managing_your_files_2026"
ADMIN_EMAIL="admin@example.com"
ADMIN_NAME="Admin"
ADMIN_PASSWORD="Admin123"
CLIENT_URL="http://localhost:3000"
\`\`\`

#### Frontend \`.env.local\` (\`client/.env.local\`):
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8080
\`\`\`

### 3. Database Migration & Seeding
\`\`\`bash
cd server
npm install
npx prisma migrate dev --name init
npm run seed
\`\`\`

### 4. Running the Project Locally
\`\`\`bash
# Run backend
cd server
npm run dev

# Run frontend (in another terminal)
cd client
npm run dev
\`\`\`
Visit \`http://localhost:3000\` in your browser.

---

## 🔑 Default Accounts

- **Admin Account**: \`admin@example.com\` / \`Admin123\`
- **Sample User**: \`adel.s.atwan@gmail.com\` / \`Password123!\`
`
  };

  res.json({ success: true, deliverables });
});

export default router;
