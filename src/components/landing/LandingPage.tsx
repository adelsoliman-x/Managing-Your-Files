import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FolderLock,
  ShieldCheck,
  Zap,
  HardDrive,
  Eye,
  FileCode,
  Layers,
  ArrowRight,
  CheckCircle2,
  Server,
  Lock,
  BarChart3,
  FileText,
  Trash2,
  FolderTree,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Database,
  Sparkles,
  Search,
  Check,
  Copy,
  Users,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from '../../types';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenAuth,
  setActiveTab,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { label: 'Upload Latency', value: '< 150ms', icon: Zap, color: 'text-amber-400' },
    { label: 'Encryption Standard', value: 'AES-256 / SHA', icon: Lock, color: 'text-cyan-400' },
    { label: 'Supported File Formats', value: '50+ Types', icon: FileCode, color: 'text-indigo-400' },
    { label: 'Uptime SLA', value: '99.99%', icon: ShieldCheck, color: 'text-emerald-400' },
  ];

  const features = [
    {
      icon: Eye,
      title: 'Real-Time Multi-Format Previews',
      description:
        'Instantly view images, stream audio & video, inspect syntax-highlighted code files, and preview document text directly in the browser without third-party plugins.',
      badge: 'Interactive Previews',
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise RBAC & Audit Trails',
      description:
        'Granular role-based access control (User vs. Admin), immutable activity audit logs, and account lifecycle management with instant account suspension.',
      badge: 'Security & Governance',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    },
    {
      icon: FolderTree,
      title: 'Hierarchical Folders & Trash Recovery',
      description:
        'Organize files into intuitive directory trees. Soft-deletion protection ensures files can be restored anytime from the trash bin or permanently purged.',
      badge: 'Smart Organization',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    },
    {
      icon: BarChart3,
      title: 'Dynamic Storage Quota Analytics',
      description:
        'Real-time visualization of disk consumption, file category breakdown (Images, Docs, Audio, Video, Code, Archives), and daily upload trend tracking.',
      badge: 'Deep Insights',
      color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400',
    },
    {
      icon: KeyRound,
      title: 'Stateless JWT & OTP Email Verification',
      description:
        'Robust authentication pipeline with bcrypt password hashing, bearer token authorization headers, and 6-digit OTP verification codes with expiry limits.',
      badge: 'Zero-Trust Auth',
      color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400',
    },
    {
      icon: Server,
      title: 'Clean Decoupled REST Architecture',
      description:
        'Separated Express.js TypeScript API backend with PostgreSQL and Prisma ORM, seamlessly interacting with a high-performance React & Vite frontend.',
      badge: 'Scalable Codebase',
      color: 'from-indigo-500/20 to-cyan-500/20 border-indigo-500/30 text-indigo-400',
    },
  ];

  const faqs = [
    {
      q: 'How does CloudVault handle file security and access isolation?',
      a: 'Each user is isolated within their own namespace. File upload, download, and modification endpoints verify token validity and ownership. Admins have access to system-wide logs and compliance overview.',
    },
    {
      q: 'Is the backend separated from the frontend?',
      a: 'Yes. The backend runs as a standalone Express.js TypeScript REST service under /server with clean modular routes (auth, files, folders, users, stats, audit). The frontend under /src is a decoupled single-page application communicating purely via RESTful JSON endpoints.',
    },
    {
      q: 'What is required to deploy this to production?',
      a: 'A PostgreSQL database instance, standard environment variables (DATABASE_URL, JWT_SECRET, PORT, CLIENT_URL), and optionally an SMTP service (SendGrid, Mailgun, or AWS SES) for sending real email OTP verification codes.',
    },
    {
      q: 'Can storage be connected to AWS S3 or Google Cloud Storage?',
      a: 'Absolutely. The current implementation uses an abstracted storage layer (Multer + disk). Swapping the local disk adapter with the AWS S3 SDK (@aws-sdk/client-s3) requires modifying only the upload middleware in /server/routes/files.ts.',
    },
  ];

  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            {/* Top Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md text-xs font-semibold text-indigo-300 shadow-inner"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Next-Generation Enterprise Cloud Storage & File Workspace</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]"
            >
              Secure, Ultra-Fast & <br />
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-300 bg-clip-text text-transparent">
                Frictionless File Storage
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto"
            >
              Store, organize, preview, and audit your files with confidence.
              Engineered with clean full-stack architecture, JWT authentication, granular RBAC,
              and live multi-format previews.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-2"
            >
              <button
                id="landing-enter-workspace-btn"
                onClick={onEnterApp}
                className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <HardDrive className="w-4 h-4" />
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                id="landing-view-code-btn"
                onClick={() => setActiveTab('deliverables')}
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-sm rounded-xl flex items-center gap-2 backdrop-blur-md transition-all hover:border-white/20 cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span>Architecture & Source Code</span>
              </button>

              {!isAuthenticated && (
                <button
                  id="landing-signin-btn"
                  onClick={onOpenAuth}
                  className="px-5 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm rounded-xl transition-all cursor-pointer"
                >
                  Sign In / Register
                </button>
              )}
            </motion.div>
          </div>

          {/* Product Mockup Preview Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-14 relative rounded-3xl p-1 bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl"
          >
            <div className="rounded-[22px] bg-slate-900/90 border border-white/10 backdrop-blur-2xl overflow-hidden shadow-2xl">
              {/* Window Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">cloudvault.internal/workspace</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>REST API Connected</span>
                </div>
              </div>

              {/* Mockup Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Mock Sidebar */}
                <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5 hidden md:block">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation</div>
                  <div className="space-y-1 text-xs">
                    <div className="p-2 bg-indigo-600/30 text-indigo-300 rounded-lg font-medium flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5" /> All Files
                    </div>
                    <div className="p-2 text-slate-400 hover:text-slate-200 rounded-lg flex items-center gap-2">
                      <FolderTree className="w-3.5 h-3.5" /> Directories
                    </div>
                    <div className="p-2 text-slate-400 hover:text-slate-200 rounded-lg flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5" /> Analytics
                    </div>
                    <div className="p-2 text-slate-400 hover:text-slate-200 rounded-lg flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5" /> Trash Bin
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-300 flex justify-between">
                      <span>Quota Used</span>
                      <span>42%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[42%] h-full bg-indigo-500 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Mock Content Area */}
                <div className="md:col-span-3 space-y-4">
                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-white/5">
                      <Search className="w-3.5 h-3.5" />
                      <span>Search across files & tags...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-semibold">
                        + New Folder
                      </span>
                      <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold">
                        Upload Files
                      </span>
                    </div>
                  </div>

                  {/* Mock File Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 hover:border-indigo-500/40 transition-colors">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span className="truncate">Product_Roadmap_2026.pdf</span>
                      </div>
                      <p className="text-[11px] text-slate-400">PDF • 2.4 MB • 4 mins ago</p>
                    </div>

                    <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 hover:border-indigo-500/40 transition-colors">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1">
                        <FileCode className="w-4 h-4 text-indigo-400" />
                        <span className="truncate">schema.prisma</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Prisma • 4.2 KB • 12 mins ago</p>
                    </div>

                    <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 hover:border-indigo-500/40 transition-colors">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1">
                        <HardDrive className="w-4 h-4 text-emerald-400" />
                        <span className="truncate">database_backup.sql</span>
                      </div>
                      <p className="text-[11px] text-slate-400">SQL • 18.5 MB • 1 hour ago</p>
                    </div>
                  </div>

                  {/* Interactive Button to Jump in */}
                  <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-between">
                    <div className="text-xs text-slate-300">
                      <span className="font-bold text-white">Interactive Workspace Ready</span> — Click to test uploads, folders, previews, and statistics.
                    </div>
                    <button
                      onClick={onEnterApp}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      Open Live File Manager
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Counter Section */}
      <section className="py-8 border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={i} className="flex items-center gap-3.5 p-3">
                  <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${st.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-extrabold text-white">{st.value}</div>
                    <div className="text-xs text-slate-400 font-medium">{st.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Core Capabilities</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">
            Engineered for Security, Speed & Organization
          </p>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to handle high-volume file transfers, hierarchical cataloging, and administrative governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${f.color} border`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Architecture Separation Showcase */}
      <section className="py-16 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">System Architecture</h2>
            <p className="text-3xl font-extrabold text-white">
              Clean Separation: Frontend & Backend
            </p>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              Built following standard enterprise micro-patterns with fully decoupled frontend single-page application and backend REST API services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Frontend Card */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Frontend Workspace Layer</h3>
                    <p className="text-[11px] text-slate-400">Located in <code className="text-cyan-300">/src</code></p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 bg-cyan-500/10 text-cyan-300 rounded border border-cyan-500/20">Client App</span>
              </div>

              <ul className="text-xs text-slate-300 space-y-2.5 pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Modern Component Structure</strong>: Modular views for File Explorer, Analytics, Admin, Modals, and Auth.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>State & Auth Context</strong>: React Context API managing tokens, current user, permissions, and active filters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Tailwind CSS & Motion</strong>: High-contrast frosted glass styling, responsive grid/list switches, smooth transitions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Recharts Visualizer</strong>: Storage gauges, file category distribution charts, and upload frequency timelines.</span>
                </li>
              </ul>
            </div>

            {/* Backend Card */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Backend REST API Layer</h3>
                    <p className="text-[11px] text-slate-400">Located in <code className="text-indigo-300">/server</code></p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">Express REST</span>
              </div>

              <ul className="text-xs text-slate-300 space-y-2.5 pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Modular Route Endpoints</strong>: <code>/api/auth</code>, <code>/api/files</code>, <code>/api/folders</code>, <code>/api/users</code>, <code>/api/stats</code>, <code>/api/audit-logs</code>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Security Middleware</strong>: JWT Bearer extraction, token validation, and Admin role enforcement.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Prisma Schema & PostgreSQL</strong>: Relational database models for Users, Files, Folders, OTPs, and Audit Logs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Multer Storage & Metadata Extractor</strong>: Multi-file disk streaming, MIME validation, and text/code inspection.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Questions & Answers</h2>
          <p className="text-3xl font-extrabold text-white">Frequently Asked Questions</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 text-sm font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    activeFaq === idx ? 'rotate-90 text-indigo-400' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900/90 to-cyan-900/60 border border-white/15 backdrop-blur-2xl text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Explore the Platform?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Test the live file explorer, upload files, create directory trees, and review comprehensive analytics in real-time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onEnterApp}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <HardDrive className="w-4 h-4" />
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('deliverables')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Review Assessment Deliverables</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg">
              <FolderLock className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-200">CloudVault Enterprise Storage</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Production Ready</span>
            <span>•</span>
            <span>TypeScript & PostgreSQL</span>
            <span>•</span>
            <span>REST API v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
