/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileCheck, 
  Database, 
  Calendar, 
  FileText, 
  Archive, 
  Settings, 
  LogOut, 
  Bell, 
  UserCircle,
  Search,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  Download,
  HelpCircle,
  Star,
  ChevronLeft,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  GraduationCap,
  Globe,
  Mail,
  Eye,
  EyeOff,
  Menu,
  X,
  XCircle,
  RefreshCcw,
  Check,
  PieChart as PieChartIcon,
  BarChart2 as BarChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from './lib/utils';
import { submitToGoogleSheets, verifyLogin } from './services/googleSheetService';

// --- Types ---

type ViewState = 'landing' | 'login' | 'student-dashboard' | 'admin-dashboard' | 'form-apl01' | 'validation' | 'schemes' | 'apl02' | 'public-schemes';

// --- Mock Data ---

const RECENT_APPLICATIONS = [
  { id: '01', name: 'Ahmad Fauzi', scheme: 'Junior Operator Desain Grafis', date: '12 Mei 2024', status: 'Valid' },
  { id: '02', name: 'Siti Aminah', scheme: 'Junior Operator Desain Grafis', date: '14 Mei 2024', status: 'Pending' },
  { id: '03', name: 'Budi Hartono', scheme: 'Junior Operator Desain Grafis', date: '15 Mei 2024', status: 'Valid' },
  { id: '04', name: 'Rina Sari', scheme: 'Junior Operator Desain Grafis', date: '15 Mei 2024', status: 'Pending' },
];

const CHART_DATA = [
  { name: 'JAN', value: 12 },
  { name: 'FEB', value: 18 },
  { name: 'MAR', value: 25 },
  { name: 'APR', value: 21 },
  { name: 'MEI', value: 30 },
];

const PIE_DATA = [
  { name: 'Desain Grafis', value: 100, color: '#10b981' }, // emerald-500
];

// --- Components ---

const Sidebar = ({ activeView, onViewChange, role }: { activeView: ViewState, onViewChange: (view: ViewState) => void, role: 'admin' | 'student' }) => {
  type SidebarLink = {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
  };

  const adminLinks: SidebarLink[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'validation', label: 'Document Validation', icon: FileCheck },
    { id: 'schemes', label: 'Schemes & Units', icon: Database },
    { id: 'schedule', label: 'Schedule & TUK', icon: Calendar },
    { id: 'letters', label: 'Letter Generator', icon: FileText },
    { id: 'archive', label: 'Archive', icon: Archive },
  ];

  const studentLinks: SidebarLink[] = [
    { id: 'student-dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'schemes', label: 'Skema & Unit', icon: Database },
    { id: 'form-apl01', label: 'Form APL-01', icon: FileText },
    { id: 'apl02', label: 'Form APL-02', icon: FileCheck },
    { id: 'status', label: 'Status Uji', icon: BarChartIcon },
    { id: 'portofolio', label: 'Portofolio', icon: Archive },
    { id: 'notifications', label: 'Notifikasi', icon: Bell, badge: 3 },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="w-[280px] h-screen bg-surface-container border-r border-outline-variant flex flex-col py-8 fixed left-0 top-0 z-50 overflow-y-auto">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
          <ShieldCheck className="text-on-primary w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight text-on-surface">LSP Admin</h2>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Professional Certification</p>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onViewChange(link.id as any)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all group",
              activeView === link.id 
                ? "bg-primary/10 text-primary" 
                : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
            )}
          >
            <div className="flex items-center gap-3">
              <link.icon className={cn("w-5 h-5", activeView === link.id ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface")} />
              <span className="text-sm font-medium">{link.label}</span>
            </div>
            {link.badge && (
              <span className="bg-error text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{link.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-4 mt-auto pt-4 border-t border-outline-variant space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all">
          <Settings className="w-5 h-5" />
          <span className="text-sm">Settings</span>
        </button>
        <button 
          onClick={() => onViewChange('landing')}
          className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

const Header = ({ title, user }: { title: string, user: { name: string, role: string } }) => {
  return (
    <header className="h-16 flex justify-between items-center px-8 bg-surface/50 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-outline-variant">
      <div className="flex items-center gap-8">
        <h2 className="text-lg font-bold text-primary uppercase">{title}</h2>
        <div className="hidden lg:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-1.5 bg-surface-container-high border border-outline-variant rounded-full text-sm focus:ring-2 focus:ring-primary/20 w-64 outline-none" 
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors relative">
          <Bell className="w-5 h-5 text-on-surface-variant" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <div className="h-8 w-px bg-outline-variant hidden sm:block"></div>
        <div className="flex items-center gap-3 p-1 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer capitalize">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-surface leading-none">{user.name}</p>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-outline-variant bg-surface-container-high flex items-center justify-center">
            <UserCircle className="text-primary w-8 h-8" />
          </div>
        </div>
      </div>
    </header>
  );
};

// --- Views ---

const LandingView = ({ onStart }: { onStart: (role: 'student' | 'admin') => void }) => {
  return (
    <div className="min-h-screen bg-surface">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-on-surface">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary w-6 h-6" />
            <span className="text-xl font-bold text-on-surface font-display tracking-tight">LSP SMK Tanjung Priok 1</span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#" className="font-bold border-b-2 border-primary text-primary transition-all">Home</a>
            <a href="#" className="text-on-surface-variant hover:text-on-surface transition-all">Skema</a>
            <a href="#" className="text-on-surface-variant hover:text-on-surface transition-all">Informasi</a>
            <a href="#" className="text-on-surface-variant hover:text-on-surface transition-all">Kontak</a>
            <button 
              onClick={() => onStart('student')}
              className="bg-primary text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all"
            >
              Portal Sertifikasi
            </button>
          </div>
        </div>
      </nav>

      <section className="mesh-gradient pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Badan Nasional Sertifikasi Profesi
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-on-surface tracking-tight leading-tight">
              Sistem Sertifikasi <br />
              <span className="text-primary">Profesi Digital</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
              LSP SMK Tanjung Priok 1 berkomitmen mencetak tenaga kerja kompeten dan profesional melalui standar sertifikasi nasional yang terintegrasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onStart('student')}
                className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 group"
              >
                Portal Siswa
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('change-view', { detail: 'public-schemes' }))}
                className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/20 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
              >
                Pendaftaran & Skema
                <Database className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onStart('admin')}
                className="bg-surface-container border border-outline-variant text-on-surface px-8 py-4 rounded-2xl font-bold text-lg hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
              >
                Portal Admin
                <Lock className="w-5 h-5 text-primary" />
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden lg:block relative"
          >
            <div className="glass-card p-4 rounded-[2.5rem] relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop" 
                alt="Students" 
                className="rounded-[2rem] w-full h-[450px] object-cover" 
              />
            </div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl opacity-50" />
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Siswa Tersertifikasi', value: '1,240+', icon: GraduationCap, color: 'bg-primary-container/10 text-primary' },
            { label: 'Skema Aktif', value: '12', icon: Database, color: 'bg-secondary-container/10 text-secondary' },
            { label: 'TUK Tersedia', value: '5', icon: Globe, color: 'bg-tertiary-container/10 text-tertiary' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="glass-card p-8 rounded-2xl flex flex-col items-center text-center group"
            >
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", stat.color)}>
                <stat.icon className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black">{stat.value}</h3>
              <p className="text-on-surface-variant font-medium mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="bg-surface-container-low border-t border-outline-variant/30 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="text-lg font-bold">LSP SMK Tanjung Priok 1</span>
            <p className="text-sm text-on-surface-variant mt-1">© 2024 LSP SMK Tanjung Priok 1. All Rights Reserved.</p>
          </div>
          <div className="flex gap-8 text-xs font-bold text-on-surface-variant px-4">
            <a href="#" className="hover:text-primary transition-all">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-all">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-all">Help Desk</a>
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cursor-pointer">
              <Globe className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cursor-pointer">
              <Mail className="w-5 h-5" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const LoginView = ({ onLogin }: { onLogin: (role: 'student' | 'admin') => void }) => {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyLogin(id, password, role);
      if (result.success) {
        onLogin(result.user.role);
      }
    } catch (err: any) {
      setError(err.message || "Gagal masuk. Silakan hubungi admin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] glass-card rounded-3xl p-10 flex flex-col items-center"
      >
        <div className="mb-10 text-center">
          <div className="w-20 h-20 mb-6 mx-auto flex items-center justify-center bg-surface-container-high rounded-full shadow-lg border border-outline-variant">
            <ShieldCheck className="text-primary w-12 h-12" />
          </div>
          <h1 className="text-2xl font-black text-on-surface mb-1">LSP SMK Tanjung Priok 1</h1>
          <p className="text-sm text-on-surface-variant font-medium">Sistem Informasi Sertifikasi Profesi</p>
        </div>

        <div className="w-full bg-surface-container-high p-1 rounded-xl flex mb-8">
          <button 
            onClick={() => { setRole('student'); setError(null); }}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-xs font-bold transition-all",
              role === 'student' ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            Siswa
          </button>
          <button 
            onClick={() => { setRole('admin'); setError(null); }}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-xs font-bold transition-all",
              role === 'admin' ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            Admin / Asesor
          </button>
        </div>

        <form className="w-full space-y-6" onSubmit={handleLogin}>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-start gap-3"
            >
              <AlertTriangle className="text-error w-5 h-5 shrink-0" />
              <p className="text-xs font-bold text-error">{error}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">NISN / Email</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors w-4 h-4" />
                <input 
                  type="text" 
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder={role === 'student' ? 'Masukkan NISN Anda' : 'Email Admin'} 
                  className="w-full pl-12 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Kata Sandi</label>
                <a href="#" className="text-[10px] font-bold text-primary hover:underline">Lupa Sandi?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors w-4 h-4" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-12 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                  required
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary" />
            <label htmlFor="remember" className="text-xs font-medium text-on-surface-variant select-none">Ingat saya di perangkat ini</label>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-4 bg-primary hover:bg-primary-container text-white rounded-2xl text-base font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 group",
              isLoading && "animate-pulse opacity-70"
            )}
          >
            {isLoading ? "Sedang Memverifikasi..." : "Masuk ke Dashboard"}
            {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-outline-variant/30 w-full text-center text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-widest">
          SISTEM KEAMANAN TERENKRIPSI
        </div>
      </motion.div>
    </div>
  );
};

const AdminDashboardView = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="relative overflow-hidden rounded-3xl bg-primary text-white p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black mb-3">Selamat Datang, Admin</h2>
          <p className="text-lg opacity-90 mb-6">Kelola sertifikasi profesi siswa dengan presisi. Pastikan semua dokumen divalidasi tepat waktu untuk menjaga integritas kompetensi.</p>
          <div className="inline-flex items-center gap-3 bg-red-500/20 text-white px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 animate-pulse font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-red-200" />
            <span>5 permohonan baru dari siswa DKV</span>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 hidden lg:block">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2669&auto=format&fit=crop" className="h-full w-full object-cover" alt="Background" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Asesi Aktif', value: '42', subtitle: 'TOTAL', icon: Users, color: 'text-primary bg-primary/10' },
          { label: 'Menunggu Validasi', value: '12', subtitle: 'URGENT', icon: Clock, color: 'text-emerald-400 bg-emerald-400/10', alert: true },
          { label: 'Divalidasi Bulan Ini', value: '30', subtitle: 'BULAN INI', icon: CheckCircle2, color: 'text-secondary bg-secondary/10' },
        ].map((item, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className={cn(
              "bg-surface-container-high p-8 rounded-2xl shadow-sm border border-outline-variant transition-all relative",
              item.alert && "border-emerald-500/20 shadow-emerald-500/5 shadow-lg"
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-3 rounded-xl", item.color)}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded">{item.subtitle}</span>
            </div>
            <h3 className={cn("text-4xl font-black text-on-surface")}>{item.value}</h3>
            <p className={cn("text-sm font-medium mt-1 uppercase tracking-wider opacity-70 text-on-surface-variant")}>{item.label}</p>
            {item.alert && <span className="absolute top-4 right-4 flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>}
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-high p-8 rounded-2xl shadow-sm border border-outline-variant">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-lg font-bold">DISTRIBUSI SKEMA</h4>
            <PieChartIcon className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="h-64 flex items-center justify-around">
            <div className="w-1/2 h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PIE_DATA}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 text-center pointer-events-none hidden md:block">
                <p className="text-2xl font-black">100%</p>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">TOTAL</p>
              </div>
            </div>
            <div className="space-y-4">
              {PIE_DATA.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium">{item.value}% (24 Siswa)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-high p-8 rounded-2xl shadow-sm border border-outline-variant">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-lg font-bold">TREND PERMOHONAN</h4>
            <BarChartIcon className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section className="bg-surface-container-high rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="p-8 flex justify-between items-center bg-surface-container/50">
          <h4 className="text-lg font-bold text-on-surface">PERMOHONAN TERBARU</h4>
          <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container/30 border-y border-outline-variant">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">No</th>
                <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Nama</th>
                <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Skema</th>
                <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Tanggal</th>
                <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {RECENT_APPLICATIONS.map((app, i) => (
                <tr key={i} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-8 py-4 text-sm font-medium text-on-surface-variant">{app.id}</td>
                  <td className="px-8 py-4 text-sm font-bold text-on-surface">{app.name}</td>
                  <td className="px-8 py-4 text-sm font-medium text-on-surface-variant">{app.scheme}</td>
                  <td className="px-8 py-4 text-sm font-medium text-on-surface-variant">{app.date}</td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-2 w-fit uppercase tracking-wider",
                      app.status === 'Valid' ? "bg-emerald-400/10 text-emerald-400" : "bg-primary/10 text-primary"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", app.status === 'Valid' ? "bg-emerald-400" : "bg-primary")} />
                      {app.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <Archive className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const FileUploader = ({ 
  label, 
  accept, 
  maxSizeMB = 5, 
  onUpload 
}: { 
  label: string, 
  accept: string[], 
  maxSizeMB?: number,
  onUpload: (file: File | null) => void 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const simulateUpload = (selectedFile: File) => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    // Simulate progress increments
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          onUpload(selectedFile);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    
    const extension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!accept.includes(extension)) {
      setError(`Format file tidak didukung. Harap gunakan: ${accept.join(', ')}`);
      setUploadStatus('error');
      return;
    }

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`Ukuran file terlalu besar. Maksimal: ${maxSizeMB}MB`);
      setUploadStatus('error');
      return;
    }

    setFile(selectedFile);
    simulateUpload(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    onUpload(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">{label}</label>
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-3 overflow-hidden",
          isDragging ? "border-primary bg-primary/5" : "border-outline-variant bg-surface-container/30 hover:border-primary/50",
          error ? "border-error/50 bg-error/5" : "",
          uploadStatus === 'success' ? "border-emerald-500/50 bg-emerald-500/5" : ""
        )}
      >
        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
          accept={accept.join(',')}
          onChange={handleFileChange}
          disabled={uploadStatus === 'uploading'}
        />
        
        {file ? (
          <div className="w-full flex flex-col items-center text-center">
            <div className="flex items-center gap-4 w-full">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
                uploadStatus === 'uploading' ? "bg-primary/10 text-primary animate-pulse" : 
                uploadStatus === 'success' ? "bg-emerald-500/10 text-emerald-500" : 
                "bg-error/10 text-error"
              )}>
                {uploadStatus === 'uploading' ? <Archive className="w-6 h-6" /> : 
                 uploadStatus === 'success' ? <CheckCircle2 className="w-6 h-6" /> : 
                 <AlertTriangle className="w-6 h-6" />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-bold truncate text-on-surface">{file.name}</p>
                <p className="text-[10px] text-on-surface-variant">{(file.size / 1024 / 1024).toFixed(2)} MB • {uploadStatus === 'uploading' ? 'Mengunggah...' : uploadStatus === 'success' ? 'Berhasil' : 'Gagal'}</p>
              </div>
              <button 
                type="button"
                onClick={removeFile}
                className="text-on-surface-variant hover:text-error transition-colors p-2 hover:bg-surface-container rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadStatus === 'uploading' && (
              <div className="w-full mt-4 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-primary px-0.5">
                  <span>PROSES UNGGAH</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
              <Archive className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-on-surface">Tekan untuk unggah atau seret file</p>
              <p className="text-[10px] text-on-surface-variant mt-1 font-medium italic">Maksimal {maxSizeMB}MB • {accept.join(', ')}</p>
            </div>
          </>
        )}
      </div>
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-error/10 rounded-lg text-error"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <p className="text-[10px] font-bold">{error}</p>
        </motion.div>
      )}
    </div>
  );
};

const ValidationView = () => {
  const [applications, setApplications] = useState(RECENT_APPLICATIONS);

  const handleAction = (id: string, newStatus: string) => {
    // In a real app, this would be an API call to update the status in GSheets
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-on-surface">Validasi Dokumen</h2>
          <p className="text-on-surface-variant font-medium mt-1">Kelola dan verifikasi berkas pendaftaran sertifikasi asesi.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-high px-4 py-2 rounded-2xl border border-outline-variant shadow-sm">
          <Clock className="w-5 h-5 text-primary" />
          <div className="text-left">
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none">Menunggu</p>
            <p className="text-lg font-black text-on-surface leading-none mt-1">12 Berkas</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-high rounded-[2rem] shadow-sm border border-outline-variant overflow-hidden">
        <div className="p-8 flex justify-between items-center bg-surface-container/50 border-b border-outline-variant">
          <h4 className="text-lg font-bold text-on-surface tracking-tight uppercase">Daftar Antrean APL-01</h4>
          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari asesi..." 
              className="pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container/30 border-b border-outline-variant">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Asesi</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Skema Sertifikasi</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Tgl Kirim</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-center">Tindakan Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-surface-container/30 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/20">
                        {app.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-on-surface">{app.name}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant opacity-60">ID: APL-{app.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">{app.scheme}</p>
                      <button className="text-[10px] font-black text-primary hover:underline flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Lihat Berkas
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-on-surface-variant">{app.date}</td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-4 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2 w-fit uppercase tracking-wider border",
                      app.status === 'Valid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                      app.status === 'Revisi' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                      app.status === 'Ditolak' ? "bg-error/10 text-error border-error/20" :
                      "bg-primary/10 text-primary border-primary/20"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", 
                        app.status === 'Valid' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                        app.status === 'Revisi' ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" :
                        app.status === 'Ditolak' ? "bg-error shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                        "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                      )} />
                      {app.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleAction(app.id, 'Valid')}
                        disabled={app.status === 'Valid'}
                        className="p-2.5 bg-emerald-500/5 hover:bg-emerald-500 text-on-surface-variant hover:text-white rounded-xl border border-emerald-500/10 hover:border-emerald-500 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                        title="Setujui Dokumen"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleAction(app.id, 'Revisi')}
                        disabled={app.status === 'Revisi'}
                        className="p-2.5 bg-orange-500/5 hover:bg-orange-500 text-on-surface-variant hover:text-white rounded-xl border border-orange-500/10 hover:border-orange-500 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                        title="Minta Revisi"
                      >
                        <RefreshCcw className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleAction(app.id, 'Ditolak')}
                        disabled={app.status === 'Ditolak'}
                        className="p-2.5 bg-error/5 hover:bg-error text-on-surface-variant hover:text-white rounded-xl border border-error/10 hover:border-error transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                        title="Tolak Pendaftaran"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="flex items-center gap-5 p-6 bg-surface-container/50 rounded-3xl border border-outline-variant group hover:bg-emerald-500/5 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h5 className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-1">Standar Keamanan</h5>
            <p className="text-xs font-medium text-on-surface-variant leading-relaxed">Seluruh proses validasi direkam pada log sistem untuk audit integritas pendaftaran BNSP.</p>
          </div>
        </div>
        <div className="flex items-center gap-5 p-6 bg-surface-container/50 rounded-3xl border border-outline-variant group hover:bg-primary/5 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h5 className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-1">Sync Real-time</h5>
            <p className="text-xs font-medium text-on-surface-variant leading-relaxed">Status perubahan akan langsung tersinkronisasi ke Google Sheet Database dan dashboard asesi.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SchemesView = () => {
  const schemes = [
    { 
      id: 'dg', 
      title: 'Junior Operator Desain Grafis', 
      code: 'M.74100.001.02', 
      status: 'Aktif', 
      units: 9, 
      color: 'bg-emerald-500',
      active: true 
    },
    { 
      id: 'cc', 
      title: 'Junior Content Creator', 
      code: 'M.74100.005.02', 
      status: 'Non-Aktif', 
      units: 7, 
      color: 'bg-slate-400',
      active: false 
    },
    { 
      id: 'tkro', 
      title: 'Junior Mekanik TKRO', 
      code: 'G.45600.001.01', 
      status: 'Non-Aktif', 
      units: 12, 
      color: 'bg-slate-400',
      active: false 
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-on-surface">Skema & Unit Kompetensi</h2>
          <p className="text-on-surface-variant font-medium mt-1">Daftar skema sertifikasi yang tersedia dan unit kompetensi terkait.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemes.map((s) => (
          <div key={s.id} className={cn(
            "bg-surface-container-high rounded-3xl p-8 border border-outline-variant transition-all hover:translate-y-[-4px] group",
            !s.active && "opacity-60 grayscale"
          )}>
            <div className="flex justify-between items-start mb-6">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black", s.color)}>
                {s.title.charAt(0)}
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                s.active ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"
              )}>
                {s.status}
              </span>
            </div>
            <h4 className="text-xl font-black text-on-surface mb-2 group-hover:text-primary transition-colors">{s.title}</h4>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-6">{s.code}</p>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-on-surface-variant">Jumlah Unit</span>
                <span className="text-on-surface">{s.units} Unit</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-on-surface-variant">Metode Uji</span>
                <span className="text-on-surface">Observasi & Tertulis</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button 
                disabled={!s.active}
                onClick={() => s.active && window.open('https://forms.gle/5mkYQJNV1kgNRSAFA', '_blank')}
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2",
                  s.active ? "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02]" : "bg-surface-container text-on-surface-variant cursor-not-allowed"
                )}
              >
                {s.active ? "Daftar APL-01" : "Belum Tersedia"}
                {s.active && <FileText className="w-4 h-4" />}
              </button>
              <button 
                disabled={!s.active}
                onClick={() => s.active && window.open('https://forms.gle/2MpGEwA7pQVrJk5S8', '_blank')}
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2",
                  s.active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02]" : "bg-surface-container text-on-surface-variant cursor-not-allowed"
                )}
              >
                {s.active ? "Isi APL-02" : "Belum Tersedia"}
                {s.active && <FileCheck className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PublicSchemesView = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-surface flex flex-col pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto w-full">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Beranda
        </button>
        <SchemesView />
      </div>
    </div>
  );
};

const FormAPL01 = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    namaLengkap: 'BUDI SANTOSO',
    nisn: '0054321098',
    kelasJurusan: 'XII TKJ 1',
    tempatLahir: '',
    tanggalLahir: '',
    alamat: '',
    noHp: '',
    email: '',
    fileKartuPelajar: null as File | null,
    fileSertifikatMagang: null as File | null,
    fileRapot: null as File | null,
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, you would upload files to storage first and get URLs
      // Here we simulate the payloads
      await submitToGoogleSheets({
        ...formData,
        urlKartuPelajar: formData.fileKartuPelajar ? `https://storage.lsp.sch.id/${formData.fileKartuPelajar.name}` : '',
        urlSertifikatMagang: formData.fileSertifikatMagang ? `https://storage.lsp.sch.id/${formData.fileSertifikatMagang.name}` : '',
        urlRapot: formData.fileRapot ? `https://storage.lsp.sch.id/${formData.fileRapot.name}` : '',
      });
      nextStep();
    } catch (error) {
      alert("Gagal mengirim data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    if (step === 2) {
      return formData.tempatLahir && formData.tanggalLahir && formData.alamat && formData.noHp && formData.email;
    }
    if (step === 3) {
      return formData.fileKartuPelajar && formData.fileSertifikatMagang && formData.fileRapot;
    }
    return true;
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-on-surface">Form APL-01: Permohonan Sertifikasi Kompetensi</h2>
        <p className="text-base text-on-surface-variant font-medium">Lengkapi data diri Anda sesuai dengan dokumen resmi untuk keperluan validasi sertifikasi profesional.</p>
      </div>

      <div className="relative flex justify-between items-center px-2">
        <div className="absolute top-[18px] left-0 w-full h-[2px] bg-surface-container-high -z-10">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(step - 1) * 33.33}%` }} />
        </div>
        {[
          { n: 1, label: 'RINCIAN DATA' },
          { n: 2, label: 'DATA DIRI' },
          { n: 3, label: 'DOKUMEN' },
          { n: 4, label: 'KONFIRMASI' },
        ].map((s) => (
          <div key={s.n} className="flex flex-col items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300",
              step > s.n ? "bg-primary text-white" : step === s.n ? "bg-primary text-white ring-4 ring-primary/20" : "bg-surface-container-high text-on-surface-variant"
            )}>
              {step > s.n ? <CheckCircle2 className="w-5 h-5 text-white" /> : s.n}
            </div>
            <span className={cn(
              "text-[10px] font-black tracking-widest transition-all",
              step >= s.n ? "text-primary" : "text-on-surface-variant opacity-60"
            )}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-3xl overflow-hidden min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="bg-surface-container/50 px-8 py-5 border-b border-outline-variant flex items-center gap-3">
                <Database className="text-primary w-6 h-6" />
                <h3 className="text-lg font-bold text-on-surface uppercase tracking-tight">Rincian Skema Sertifikasi</h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Skema Terpilih</p>
                  <h4 className="text-2xl font-black text-on-surface leading-tight">Teknik Kendaraan Ringan Otomotif (TKRO)</h4>
                  <p className="text-sm text-on-surface-variant mt-2 font-medium">Berdasarkan data penjurusan Anda di SMK Tanjung Priok 1.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Pemeliharaan Mesin Kendaraan Ringan",
                    "Pemeliharaan Sasis dan Pemindah Tenaga",
                    "Pemeliharaan Kelistrikan Kendaraan Ringan",
                    "Pengelolaan Bengkel Kendaraan Ringan",
                  ].map((unit, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-surface-container/50 rounded-xl border border-outline-variant">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant">{unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="bg-surface-container/50 px-8 py-5 border-b border-outline-variant flex items-center gap-3">
                <UserCircle className="text-primary w-6 h-6" />
                <h3 className="text-lg font-bold text-on-surface">Data Pribadi Asesi</h3>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">Nama Lengkap</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.namaLengkap} 
                        disabled 
                        className="w-full bg-surface-container/50 border-outline-variant text-on-surface-variant rounded-xl px-4 py-3 cursor-not-allowed font-bold" 
                      />
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">NISN</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.nisn} 
                        disabled 
                        className="w-full bg-surface-container/50 border-outline-variant text-on-surface-variant rounded-xl px-4 py-3 cursor-not-allowed font-bold" 
                      />
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">Kelas & Jurusan</label>
                    <select 
                      value={formData.kelasJurusan}
                      onChange={(e) => setFormData({...formData, kelasJurusan: e.target.value})}
                      className="w-full border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 transition-all bg-surface-container font-medium outline-none"
                    >
                      <option>XII TKJ 1</option><option>XII TKJ 2</option><option>XII MM 1</option><option>XII RPL 1</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">Tempat / Tanggal Lahir</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Jakarta" 
                        value={formData.tempatLahir}
                        onChange={(e) => setFormData({...formData, tempatLahir: e.target.value})}
                        className="w-2/3 border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 transition-all bg-surface-container font-medium outline-none" 
                      />
                      <input 
                        type="date" 
                        value={formData.tanggalLahir}
                        onChange={(e) => setFormData({...formData, tanggalLahir: e.target.value})}
                        className="w-1/3 border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 transition-all bg-surface-container font-medium outline-none" 
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">Alamat Lengkap (Sesuai KTP/KK)</label>
                    <textarea 
                      rows={2} 
                      value={formData.alamat}
                      onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                      className="w-full border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 transition-all bg-surface-container font-medium outline-none resize-none" 
                      placeholder="Jl. Jampea No. 1, Jakarta Utara..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">No. Handphone (WhatsApp)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">+62</span>
                      <input 
                        type="tel" 
                        value={formData.noHp}
                        onChange={(e) => setFormData({...formData, noHp: e.target.value})}
                        className="w-full pl-14 pr-4 py-3 border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all bg-surface-container font-medium outline-none" 
                        placeholder="8123456789" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 transition-all bg-surface-container font-medium outline-none" 
                      placeholder="budi.santoso@gmail.com" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="bg-surface-container/50 px-8 py-5 border-b border-outline-variant flex items-center gap-3">
                <FileText className="text-primary w-6 h-6" />
                <h3 className="text-lg font-bold text-on-surface uppercase tracking-tight">Dokumen Portofolio</h3>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FileUploader 
                    label="Kartu Pelajar" 
                    accept={['.jpg', '.png', '.pdf']} 
                    onUpload={(file) => setFormData({...formData, fileKartuPelajar: file})} 
                  />
                  <FileUploader 
                    label="Sertifikat Magang / PKL" 
                    accept={['.jpg', '.png', '.pdf']} 
                    onUpload={(file) => setFormData({...formData, fileSertifikatMagang: file})} 
                  />
                  <div className="md:col-span-2">
                    <FileUploader 
                      label="Rapot Semester 1 - 5 (Dijadikan 1 File PDF)" 
                      accept={['.pdf']} 
                      onUpload={(file) => setFormData({...formData, fileRapot: file})} 
                    />
                  </div>
                </div>
                <div className="bg-secondary/5 border-l-4 border-secondary p-5 rounded-r-2xl flex items-start gap-4">
                  <Star className="text-secondary w-6 h-6 mt-1 shrink-0" />
                  <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                    Dokumen yang diunggah harus jelas terbaca. Format yang diizinkan adalah PDF atau Gambar (JPG/PNG) dengan ukuran maksimal 5MB per dokumen.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8">
                <CheckCircle2 className="text-emerald-500 w-12 h-12" />
              </div>
              <h3 className="text-3xl font-black text-on-surface mb-4">Pengajuan Terkirim!</h3>
              <p className="text-lg text-on-surface-variant max-w-md font-medium mb-10 leading-relaxed">
                Data Anda telah berhasil direkam ke sistem LSP dan telah dikoneksikan ke database Google Sheets (simulasi). Mohon tunggu proses validasi oleh admin.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-surface-container-high border border-outline-variant text-on-surface px-10 py-3 rounded-2xl font-bold hover:bg-surface-container transition-all"
              >
                Kembali ke Beranda
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 4 && (
          <div className="bg-surface-container/30 px-8 py-6 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
            <button 
              onClick={prevStep}
              disabled={step === 1}
              className={cn(
                "flex items-center gap-2 text-on-surface-variant font-bold hover:text-primary px-4 py-2 rounded-xl transition-all",
                step === 1 && "opacity-0 pointer-events-none"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
            <div className="flex items-center gap-6 w-full md:w-auto justify-end">
              <span className="text-xs font-bold text-on-surface-variant opacity-50 hidden sm:block">Langkah {step} dari 3</span>
              <button 
                onClick={step === 3 ? handleSubmit : nextStep}
                disabled={!isStepValid() || isSubmitting}
                className={cn(
                  "bg-primary text-white px-10 py-3 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-container transition-all flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed",
                  isSubmitting && "animate-pulse"
                )}
              >
                {isSubmitting ? "Mengirim..." : step === 3 ? "Kirim Pengajuan" : "Lanjut"}
                {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Siswa Tersertifikasi', value: '1,240+', icon: GraduationCap, color: 'text-primary bg-primary/10' },
          { label: 'Skema Keahlian', value: '24', icon: Database, color: 'text-secondary bg-secondary/10' },
          { label: 'Akreditasi LSP', value: 'A', icon: Star, color: 'text-orange-500 bg-orange-500/10' },
        ].map((item, i) => (
          <div key={i} className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-xl text-on-surface">{item.value}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StudentDashboardView = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-on-surface">Selamat Datang, Ahmad Rizki! 👋</h2>
          <div className="flex flex-wrap gap-4 mt-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">
              <CheckCircle2 className="w-4 h-4" />
              NISN: 0054321987
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs font-bold border border-secondary/20">
              <GraduationCap className="w-4 h-4" />
              XII Teknik Kendaraan Ringan Otomotif 1
            </span>
          </div>
        </div>
        <div className="hidden lg:block text-right">
          <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mb-1">Sesi Berakhir Dalam</p>
          <p className="text-3xl font-black text-primary font-display">24:12:05</p>
        </div>
      </section>

      <div className="bg-surface-container-high p-10 rounded-3xl shadow-sm border border-outline-variant">
        <h3 className="text-[10px] font-black text-on-surface-variant mb-10 uppercase tracking-[0.2em]">Progress Sertifikasi</h3>
        <div className="relative flex items-center justify-between px-10">
          <div className="absolute top-[18px] left-[10%] right-[10%] h-[2px] bg-outline-variant">
            <div className="h-full bg-primary w-1/2" />
          </div>
          {[
            { label: 'Skema', active: true, done: true },
            { label: 'APL-01', active: true, done: true },
            { label: 'APL-02', active: true, done: false },
            { label: 'Validasi', active: false, done: false },
            { label: 'Assessment', active: false, done: false },
          ].map((s, i) => (
            <div key={i} className="relative flex flex-col items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center z-10 font-bold text-sm",
                s.done ? "bg-primary text-white" : s.active ? "bg-surface-container border-2 border-primary text-primary" : "bg-surface-container-high text-on-surface-variant border border-outline-variant"
              )}>
                {s.done ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
              <span className={cn(
                "text-[10px] font-black tracking-widest",
                s.active ? "text-primary" : "text-on-surface-variant opacity-60"
              )}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-12 lg:col-span-7 bg-surface-container-high p-8 rounded-3xl shadow-sm border border-outline-variant flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-on-surface">Status Terkini</h3>
            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black flex items-center gap-2 border border-primary/20">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              In Progress
            </span>
          </div>
          <div className="space-y-8 flex-1">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Skema Sertifikasi</p>
                <p className="text-base font-black">Junior Operator Desain Grafis</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Tahapan Saat Ini</p>
                <p className="text-base font-black text-primary">Melengkapi Dokumen</p>
              </div>
            </div>
            <div className="p-6 bg-surface-container-low rounded-2xl border-l-4 border-primary">
              <p className="text-sm font-medium text-on-surface-variant italic leading-relaxed">
                "Silahkan isi formulir pendaftaran (APL-01) dan mandiri (APL-02) melalui link resmi Google Form di bawah ini."
              </p>
            </div>
            <p className="text-[10px] font-bold text-on-surface-variant">Update Terakhir: <span className="font-black">Mei 2024, 10:30</span></p>
          </div>
          <button 
            onClick={() => window.open('https://forms.gle/5mkYQJNV1kgNRSAFA', '_blank')}
            className="mt-8 w-full bg-primary hover:bg-primary-container text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all"
          >
            Buka Form APL-01 (Pendaftaran)
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="md:col-span-12 lg:col-span-5 bg-surface-container-high p-8 rounded-3xl shadow-sm border border-outline-variant">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-on-surface">Notifikasi</h3>
            <button className="text-xs font-bold text-primary hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-4">
            {[
              { title: 'APL-01 divalidasi', desc: 'Dokumen pendaftaran telah disetujui.', icon: FileCheck, time: '2 Jam', color: 'bg-primary/10 text-primary' },
              { title: 'Jadwal Tersedia', desc: 'Cek tab Jadwal pengarahan.', icon: Calendar, time: 'Kemarin', color: 'bg-secondary/10 text-secondary' },
              { title: 'Profil Portofolio', desc: 'Unggah sertifikat PKL terbaru.', icon: FileText, time: '23 Okt', color: 'bg-orange-500/10 text-orange-500' },
            ].map((n, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-surface-container transition-colors group cursor-pointer border border-transparent hover:border-outline-variant/10">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", n.color)}>
                  <n.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-on-surface leading-tight">{n.title}</p>
                  <p className="text-xs font-medium text-on-surface-variant">{n.desc}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant/50">{n.time} yang lalu</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <a href="#" className="bg-surface-container-high p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform border border-outline-variant">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shadow-sm border border-outline-variant">
            <Download className="text-primary w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Download</p>
            <p className="text-sm font-black text-on-surface">Buku Panduan</p>
          </div>
        </a>
        <a href="#" className="bg-surface-container-high p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform border border-outline-variant">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shadow-sm border border-outline-variant">
            <HelpCircle className="text-primary w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Bantuan</p>
            <p className="text-sm font-black text-on-surface">FAQ Sertifikasi</p>
          </div>
        </a>
        <div className="sm:col-span-2 relative overflow-hidden rounded-3xl bg-primary text-white p-6 flex items-center justify-between group">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase opacity-80 mb-1 tracking-widest">Info Sertifikasi</p>
            <h4 className="text-lg font-black">Uji Kompetensi Gelombang 2</h4>
            <p className="text-xs opacity-90 font-medium">Mulai 15 November 2024</p>
          </div>
          <Star className="w-20 h-20 absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<{ name: string, role: 'admin' | 'student' } | null>(null);

  const handleStart = (role: 'student' | 'admin') => setView('login');

  React.useEffect(() => {
    const handleViewChangeEv = (e: any) => setView(e.detail);
    window.addEventListener('change-view', handleViewChangeEv);
    return () => window.removeEventListener('change-view', handleViewChangeEv);
  }, []);
  
  const handleLogin = (role: 'student' | 'admin') => {
    const userRole = role === 'admin' ? 'admin' : 'student';
    setCurrentUser({ 
      name: userRole === 'admin' ? 'Admin Utama' : 'Ahmad Rizki', 
      role: userRole 
    });
    setView(userRole === 'admin' ? 'admin-dashboard' : 'student-dashboard');
  };

  const handleViewChange = (newView: ViewState) => {
    if (newView === 'form-apl01') {
      window.open('https://forms.gle/5mkYQJNV1kgNRSAFA', '_blank');
    } else if (newView === 'apl02') {
      window.open('https://forms.gle/2MpGEwA7pQVrJk5S8', '_blank');
    } else {
      setView(newView);
    }
  };

  return (
    <div className="min-h-screen text-on-surface font-sans">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" exit={{ opacity: 0 }}>
            <LandingView onStart={handleStart} />
          </motion.div>
        )}

        {view === 'public-schemes' && (
          <motion.div key="public-schemes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PublicSchemesView onBack={() => setView('landing')} />
          </motion.div>
        )}

        {view === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginView onLogin={handleLogin} />
          </motion.div>
        )}

        {currentUser && (view === 'admin-dashboard' || view === 'student-dashboard' || view === 'form-apl01' || view === 'validation' || view === 'schemes') && (
          <div key="dashboard-layout" className="flex">
            <Sidebar activeView={view} onViewChange={handleViewChange} role={currentUser.role} />
            <main className="flex-1 ml-[280px] min-h-screen flex flex-col bg-surface">
              <Header 
                title={
                  view === 'admin-dashboard' ? 'Overview Admin' : 
                  view === 'student-dashboard' ? 'Dashboard Siswa' :
                  view === 'form-apl01' ? 'Form APL-01' : 
                  view === 'validation' ? 'Validasi Dokumen' : 
                  view === 'schemes' ? 'Skema & Unit' :
                  view === 'status' ? 'Status Sertifikasi' :
                  view === 'portofolio' ? 'Arsip Portofolio' :
                  view === 'notifications' ? 'Pusat Notifikasi' :
                  'LSP SMK Tanjung Priok 1'
                } 
                user={{ name: currentUser.name, role: currentUser.role === 'admin' ? 'Administrator' : 'Siswa • Junior Operator DG' }} 
              />
              <div className="p-8 pb-12 flex-1">
                {view === 'admin-dashboard' && <AdminDashboardView />}
                {view === 'student-dashboard' && <StudentDashboardView />}
                {view === 'form-apl01' && <FormAPL01 />}
                {view === 'validation' && <ValidationView />}
                {view === 'schemes' && <SchemesView />}
                {(view === 'status' || view === 'portofolio' || view === 'notifications' || view === 'schedule' || view === 'letters' || view === 'archive') && (
                  <div className="flex flex-col items-center justify-center h-[50vh] text-on-surface-variant gap-4 bg-surface-container/20 rounded-[2rem] border border-dashed border-outline-variant">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-xl font-black text-on-surface">Halaman Sedang Disiapkan</h4>
                      <p className="text-xs font-medium mt-1">Modul {view.toUpperCase().replace('-', ' ')} sedang dalam proses sinkronisasi database LSP.</p>
                    </div>
                  </div>
                )}
              </div>
              <footer className="px-8 py-6 border-t border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container/30">
                <div>
                  <p className="text-sm font-bold text-on-surface">LSP SMK Tanjung Priok 1</p>
                  <p className="text-[10px] text-on-surface-variant font-medium">© 2024 All Rights Reserved.</p>
                </div>
                <div className="flex gap-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-primary transition-colors">Help Desk</a>
                </div>
              </footer>
            </main>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
