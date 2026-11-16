import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Database,
  DollarSign,
  Download,
  Edit3,
  FileText,
  FolderTree,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import {
  LegalPageData,
  MediaAssetRecord,
  SiteSettingsData,
  useAppContext,
} from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { ScholarshipCategory, University } from '../types/scholarship';
import {
  AdminScholarshipItem,
  ScholarshipEditorModal,
} from '../components/admin/ScholarshipEditorModal';
import { REVIEW_STATUS_LABELS, ReviewStatus } from '../types/scholarship';
import { AdminGuideItem, GuideEditorModal } from '../components/admin/GuideEditorModal';

type AdminTab =
  | 'overview'
  | 'scholarships'
  | 'guides'
  | 'categories'
  | 'media'
  | 'homepage'
  | 'monetization'
  | 'legal'
  | 'seo'
  | 'inbox'
  | 'users'
  | 'backups';

interface ContactMsg {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: 'new' | 'reviewed' | 'archived';
  created_at: string;
}

interface SubscriberItem {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface ReminderItem {
  id: string;
  email: string;
  scholarship_slug: string;
  scholarship_title: string;
  created_at: string;
}

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  active: number;
  created_at: string;
}

interface BackupLogItem {
  id: string;
  created_by: string;
  summary_json: string;
  created_at: string;
}

export function AdminDashboardPage() {
  const { authUser, authLoading, csrfToken, logout, refreshSiteData, settings: liveSettings } =
    useAppContext();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin datasets from /api/admin/overview
  const [scholarships, setScholarships] = useState<AdminScholarshipItem[]>([]);
  const [guides, setGuides] = useState<AdminGuideItem[]>([]);
  const [categories, setCategories] = useState<ScholarshipCategory[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetRecord[]>([]);
  const [legalPages, setLegalPages] = useState<LegalPageData[]>([]);
  const [settingsForm, setSettingsForm] = useState<SiteSettingsData>(liveSettings);
  const [contactMessages, setContactMessages] = useState<ContactMsg[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [backups, setBackups] = useState<BackupLogItem[]>([]);
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);

  // Search / Modals
  const [schQuery, setSchQuery] = useState('');
  const [editingScholarship, setEditingScholarship] = useState<AdminScholarshipItem | null | 'new'>(
    null
  );
  const [editingGuide, setEditingGuide] = useState<AdminGuideItem | null | 'new'>(null);

  // Category editor
  const [newCatName, setNewCatName] = useState('');
  const [newCatShort, setNewCatShort] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCat, setEditingCat] = useState<ScholarshipCategory | null>(null);

  // Media upload
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaAlt, setMediaAlt] = useState('');
  const [mediaCategory, setMediaCategory] = useState('Editorial');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaFileDataUrl, setMediaFileDataUrl] = useState('');

  // Legal editor
  const [selectedLegalSlug, setSelectedLegalSlug] = useState('privacy-policy');
  const [legalDraft, setLegalDraft] = useState<LegalPageData | null>(null);

  // User creator
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'editor' | 'admin'>('editor');

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers || {});
      if (options.method && options.method !== 'GET' && csrfToken) {
        headers.set('X-CSRF-Token', csrfToken);
      }
      if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      return fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin',
      });
    },
    [csrfToken]
  );

  const loadOverview = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setScholarships(data.scholarships || []);
        setGuides(data.guides || []);
        setCategories(data.categories || []);
        setUniversities(data.universities || []);
        setMediaAssets(data.mediaAssets || []);
        setLegalPages(data.legalPages || []);
        if (data.settings) setSettingsForm(data.settings);
        setContactMessages(data.contactMessages || []);
        setSubscribers(data.subscribers || []);
        setReminders(data.reminders || []);
        setBackups(data.backups || []);
      }
      if (authUser.role === 'admin') {
        const uRes = await apiFetch('/api/admin/users');
        if (uRes.ok) {
          const uData = await uRes.json();
          setUsersList(uData.users || []);
        }
      }
    } catch {
      showNotice('error', 'Failed to load CMS data.');
    } finally {
      setLoading(false);
    }
  }, [authUser, apiFetch]);

  useEffect(() => {
    if (authUser) {
      loadOverview();
    }
  }, [authUser, loadOverview]);

  useEffect(() => {
    const found = legalPages.find((lp) => lp.slug === selectedLegalSlug);
    if (found) {
      setLegalDraft(structuredClone(found));
    }
  }, [selectedLegalSlug, legalPages]);

  const filteredScholarships = useMemo(() => {
    const q = schQuery.trim().toLowerCase();
    if (!q) return scholarships;
    return scholarships.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.universityName.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [scholarships, schQuery]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-sm text-slate-600 dark:text-slate-400">
        Verifying session...
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // --- Handlers ---
  const handleSaveScholarship = async (payload: AdminScholarshipItem) => {
    const isEdit = Boolean(payload.id);
    const url = isEdit ? `/api/admin/scholarships/${payload.id}` : '/api/admin/scholarships';
    const res = await apiFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || 'Error saving scholarship.' };
    }
    setEditingScholarship(null);
    await loadOverview();
    await refreshSiteData();
    showNotice('success', isEdit ? 'Scholarship updated.' : 'New scholarship published.');
    return { ok: true };
  };

  const handleDeleteScholarship = async (id: string, title: string) => {
    const res = await apiFetch(`/api/admin/scholarships/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadOverview();
      await refreshSiteData();
      showNotice('success', `Deleted "${title}".`);
    } else {
      const data = await res.json();
      showNotice('error', data.error || 'Failed to delete scholarship.');
    }
  };

  const handleSaveGuide = async (payload: AdminGuideItem, isEdit: boolean) => {
    const url = isEdit ? `/api/admin/guides/${payload.slug}` : '/api/admin/guides';
    const res = await apiFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || 'Failed to save guide.' };
    }
    setEditingGuide(null);
    await loadOverview();
    await refreshSiteData();
    showNotice('success', isEdit ? 'Guide updated.' : 'Editorial guide published.');
    return { ok: true };
  };

  const handleDeleteGuide = async (slug: string, title: string) => {
    const res = await apiFetch(`/api/admin/guides/${slug}`, { method: 'DELETE' });
    if (res.ok) {
      await loadOverview();
      await refreshSiteData();
      showNotice('success', `Deleted guide "${title}".`);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({
        name: newCatName,
        shortName: newCatShort || newCatName,
        description: newCatDesc,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setNewCatName('');
      setNewCatShort('');
      setNewCatDesc('');
      await loadOverview();
      await refreshSiteData();
      showNotice('success', 'Category created.');
    } else {
      showNotice('error', data.error || 'Could not create category.');
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    const res = await apiFetch(`/api/admin/categories/${editingCat.slug}`, {
      method: 'PUT',
      body: JSON.stringify(editingCat),
    });
    if (res.ok) {
      setEditingCat(null);
      await loadOverview();
      await refreshSiteData();
      showNotice('success', 'Category updated.');
    }
  };

  const handleDeleteCategory = async (slug: string) => {
    const res = await apiFetch(`/api/admin/categories/${slug}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      await loadOverview();
      await refreshSiteData();
      showNotice('success', 'Category deleted.');
    } else {
      showNotice('error', data.error || 'Cannot delete category.');
    }
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaFileDataUrl(reader.result);
        if (!mediaTitle) setMediaTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = mediaFileDataUrl || mediaUrlInput.trim();
    const res = await apiFetch('/api/admin/media', {
      method: 'POST',
      body: JSON.stringify({
        title: mediaTitle,
        altText: mediaAlt || mediaTitle,
        category: mediaCategory,
        url,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMediaTitle('');
      setMediaAlt('');
      setMediaUrlInput('');
      setMediaFileDataUrl('');
      await loadOverview();
      await refreshSiteData();
      showNotice('success', 'Media asset uploaded to library.');
    } else {
      showNotice('error', data.error || 'Upload failed.');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    const res = await apiFetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadOverview();
      await refreshSiteData();
      showNotice('success', 'Media asset removed.');
    }
  };

  const handleSaveSettingsGroup = async (
    key: 'general' | 'homepage' | 'menus' | 'monetization',
    label: string
  ) => {
    const res = await apiFetch(`/api/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify(settingsForm[key]),
    });
    const data = await res.json();
    if (res.ok) {
      await refreshSiteData();
      showNotice('success', `${label} saved to SQLite database.`);
    } else {
      showNotice('error', data.error || 'Failed to save settings.');
    }
  };

  const handleSaveLegalPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalDraft) return;
    const res = await apiFetch(`/api/admin/legal/${legalDraft.slug}`, {
      method: 'PUT',
      body: JSON.stringify(legalDraft),
    });
    if (res.ok) {
      await loadOverview();
      await refreshSiteData();
      showNotice('success', `${legalDraft.title} updated.`);
    } else {
      const d = await res.json();
      showNotice('error', d.error || 'Failed to update legal page.');
    }
  };

  const handleUpdateInboxStatus = async (id: string, status: ContactMsg['status']) => {
    const res = await apiFetch(`/api/admin/inbox/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await loadOverview();
      showNotice('success', `Message marked as ${status}.`);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      await loadOverview();
      showNotice('success', `Created ${data.user.role} account for ${data.user.email}.`);
    } else {
      showNotice('error', data.error || 'Failed to create user.');
    }
  };

  const handleToggleUserActive = async (u: AdminUserItem) => {
    const res = await apiFetch(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: u.active ? false : true }),
    });
    const data = await res.json();
    if (res.ok) {
      await loadOverview();
      showNotice('success', 'User status updated.');
    } else {
      showNotice('error', data.error || 'Update failed.');
    }
  };

  const handleToggleUserRole = async (u: AdminUserItem) => {
    const nextRole = u.role === 'admin' ? 'editor' : 'admin';
    const res = await apiFetch(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role: nextRole }),
    });
    if (res.ok) {
      await loadOverview();
      showNotice('success', `Updated role to ${nextRole}.`);
    }
  };

  const handleDownloadBackup = async () => {
    const res = await apiFetch('/api/admin/backup');
    if (!res.ok) {
      showNotice('error', 'Backup export failed.');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scholarpath-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    await loadOverview();
    showNotice('success', 'Full JSON database backup downloaded.');
  };

  const navTabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode; adminOnly?: boolean }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'scholarships', label: 'Scholarships', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'guides', label: 'Guides & Blog', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'media', label: 'Media Library', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'homepage', label: 'Homepage & Menus', icon: <Globe className="w-4 h-4" /> },
    { id: 'monetization', label: 'Monetization & Ads', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'legal', label: 'Legal Pages', icon: <FileText className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO & Site Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'inbox', label: 'Inbox & Subscribers', icon: <Inbox className="w-4 h-4" /> },
    { id: 'users', label: 'Users & Roles', icon: <Users className="w-4 h-4" />, adminOnly: true },
    { id: 'backups', label: 'Backups', icon: <Database className="w-4 h-4" />, adminOnly: true },
  ];

  const publishedCount = scholarships.filter((s) => s.status === 'published').length;
  const draftCount = scholarships.filter((s) => s.status === 'draft').length;
  const newInboxCount = contactMessages.filter((m) => m.status === 'new').length;

  return (
    <>
      <SeoHead
        title={`Admin CMS | ${liveSettings.general.brandName}`}
        description="Content Management System for ScholarPath USA."
        canonicalPath="/admin"
        noIndex
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-800 dark:text-gold-400">
              Editorial &amp; Monetization Control Center
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white mt-0.5">
              {liveSettings.general.brandName} CMS
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium">
              {authUser.name} · <strong className="uppercase">{authUser.role}</strong>
            </span>
            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              View Live Site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {notice && (
          <div
            role="status"
            className={`mt-5 px-4 py-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              notice.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}
          >
            <span className="inline-flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {notice.text}
            </span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <nav
              aria-label="Admin sections"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex lg:flex-col gap-1 overflow-x-auto"
            >
              {navTabs
                .filter((t) => !t.adminOnly || authUser.role === 'admin')
                .map((item) => {
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        active
                          ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.id === 'inbox' && newInboxCount > 0 && (
                        <span className="ml-auto px-1.5 py-0.5 rounded bg-gold-500 text-slate-950 text-[10px] font-bold tabular-nums">
                          {newInboxCount}
                        </span>
                      )}
                    </button>
                  );
                })}
            </nav>
          </aside>

          {/* Main Workspace */}
          <div className="lg:col-span-9 space-y-6">
            {loading && tab === 'overview' ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                Loading database metrics...
              </div>
            ) : null}

            {/* 1. OVERVIEW */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 tabular-nums">
                  <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Published Scholarships</p>
                    <p className="text-2xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                      {publishedCount}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">{draftCount} drafts</p>
                  </div>
                  <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Editorial Guides</p>
                    <p className="text-2xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                      {guides.length}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">{categories.length} categories</p>
                  </div>
                  <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Subscribers &amp; Alerts</p>
                    <p className="text-2xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                      {subscribers.length + reminders.length}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {subscribers.length} newsletter · {reminders.length} reminders
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Inbox Inquiries</p>
                    <p className="text-2xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                      {contactMessages.length}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">{newInboxCount} unread</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                    Platform Readiness Summary
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        Ad Monetization Status
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Active Network: <strong className="uppercase">{settingsForm.monetization.primaryNetwork}</strong> ·{' '}
                        {settingsForm.monetization.enabled
                          ? 'Live Ads Enabled'
                          : settingsForm.monetization.showPreApprovalSlots
                          ? 'Pre-Approval Layout Slots Visible'
                          : 'Clean Pre-Approval Editorial Mode'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        Technical SEO &amp; Policy Routes
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Dynamic <code>/sitemap.xml</code>, <code>/robots.txt</code>, <code>/ads.txt</code>, plus {legalPages.length} editable compliance pages active.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SCHOLARSHIPS */}
            {tab === 'scholarships' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                    Scholarships Directory ({filteredScholarships.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditingScholarship('new')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Scholarship
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={schQuery}
                    onChange={(e) => setSchQuery(e.target.value)}
                    placeholder="Filter scholarships by title, university, or category..."
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse tabular-nums">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <th className="py-2.5 pr-3">Title &amp; University</th>
                        <th className="py-2.5 pr-3">Category</th>
                        <th className="py-2.5 pr-3">Amount</th>
                        <th className="py-2.5 pr-3">Deadline</th>
                        <th className="py-2.5 pr-3">Status</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredScholarships.map((s) => (
                        <tr key={s.id}>
                          <td className="py-3 pr-3">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {s.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {s.universityName} ({s.stateCode})
                            </p>
                          </td>
                          <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                            {s.category}
                          </td>
                          <td className="py-3 pr-3 font-medium">{s.amountDisplay}</td>
                          <td className="py-3 pr-3">{s.deadlineISO}</td>
                          <td className="py-3 pr-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                s.status === 'published'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              }`}
                            >
                              {s.status}
                            </span>
                            <span className="block text-[10px] mt-1 text-slate-500 dark:text-slate-400">
                              {s.isSampleData ? 'Sample · ' : ''}
                              {REVIEW_STATUS_LABELS[(s.reviewStatus || 'pending_review') as ReviewStatus]}
                            </span>
                          </td>
                          <td className="py-3 text-right whitespace-nowrap space-x-2">
                            <button
                              type="button"
                              onClick={() => setEditingScholarship(s)}
                              aria-label={`Edit ${s.title}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => s.id && handleDeleteScholarship(s.id, s.title)}
                              aria-label={`Delete ${s.title}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. GUIDES & BLOG */}
            {tab === 'guides' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                    Editorial Guides &amp; Blog ({guides.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditingGuide('new')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> New Guide
                  </button>
                </div>

                <div className="space-y-3">
                  {guides.map((g) => (
                    <div
                      key={g.slug}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-navy-800 dark:text-gold-400">
                            {g.categoryLabel}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              g.status === 'published'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {g.status}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {REVIEW_STATUS_LABELS[(g.reviewStatus || 'pending_review') as ReviewStatus]}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-slate-900 dark:text-white">
                          {g.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          By {g.authorName} · {g.readMinutes} min read · /guides/{g.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingGuide(g)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => g.slug && handleDeleteGuide(g.slug, g.title)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. CATEGORIES */}
            {tab === 'categories' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleCreateCategory}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4"
                >
                  <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                    Create New Scholarship Category
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <input
                      type="text"
                      required
                      placeholder="Category Name (e.g. Community Service)"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                    <input
                      type="text"
                      placeholder="Short Label"
                      value={newCatShort}
                      onChange={(e) => setNewCatShort(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                    <input
                      type="text"
                      placeholder="SEO Description"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
                  >
                    Add Category
                  </button>
                </form>

                {editingCat && (
                  <form
                    onSubmit={handleUpdateCategory}
                    className="bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl p-6 space-y-4"
                  >
                    <h3 className="text-base font-serif font-bold">
                      Edit Category: {editingCat.slug}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <input
                        type="text"
                        value={editingCat.name}
                        onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        value={editingCat.shortName}
                        onChange={(e) => setEditingCat({ ...editingCat, shortName: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        value={editingCat.seoTitle}
                        onChange={(e) => setEditingCat({ ...editingCat, seoTitle: e.target.value })}
                        placeholder="SEO Title"
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        value={editingCat.seoDescription}
                        onChange={(e) =>
                          setEditingCat({ ...editingCat, seoDescription: e.target.value })
                        }
                        placeholder="SEO Description"
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
                      >
                        Save Category
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCat(null)}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                  <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                    Existing Categories ({categories.length})
                  </h2>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {categories.map((c) => (
                      <div key={c.slug} className="py-3 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {c.name} <span className="text-slate-400">(/scholarships/{c.slug})</span>
                          </p>
                          <p className="text-slate-500 mt-0.5">{c.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingCat(c)}
                            className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                          >
                            Edit
                          </button>
                          {authUser.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(c.slug)}
                              className="px-2.5 py-1 rounded border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. MEDIA LIBRARY */}
            {tab === 'media' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleUploadMedia}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4"
                >
                  <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                    Upload Image or Register Media Asset
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Image Title *"
                      value={mediaTitle}
                      onChange={(e) => setMediaTitle(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                    <input
                      type="text"
                      placeholder="Descriptive Alt Text (SEO)"
                      value={mediaAlt}
                      onChange={(e) => setMediaAlt(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                    <input
                      type="text"
                      placeholder="Category (e.g. Campus, STEM)"
                      value={mediaCategory}
                      onChange={(e) => setMediaCategory(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs items-center">
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 cursor-pointer">
                      <Upload className="w-4 h-4 text-navy-800 dark:text-gold-400" />
                      <span>
                        {mediaFileDataUrl ? 'Image file loaded (ready)' : 'Upload PNG/JPG/WebP file'}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleMediaFileChange}
                        className="sr-only"
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="Or paste HTTPS image URL..."
                      value={mediaUrlInput}
                      onChange={(e) => setMediaUrlInput(e.target.value)}
                      className="px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
                  >
                    Save to Media Library
                  </button>
                </form>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                    Media Library ({mediaAssets.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mediaAssets.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col"
                      >
                        <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <img
                            src={m.url}
                            alt={m.alt_text}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 space-y-1 text-xs flex-1 flex flex-col justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{m.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-2">{m.alt_text}</p>
                          </div>
                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">{m.category}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteMedia(m.id)}
                              className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. HOMEPAGE & MENUS */}
            {tab === 'homepage' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                    Homepage Hero &amp; Sections
                  </h2>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-medium mb-1">Hero Eyebrow Label</label>
                      <input
                        type="text"
                        value={settingsForm.homepage.heroEyebrow}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            homepage: { ...settingsForm.homepage, heroEyebrow: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Hero Main Headline (H1)</label>
                      <input
                        type="text"
                        value={settingsForm.homepage.heroTitle}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            homepage: { ...settingsForm.homepage, heroTitle: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Hero Subtitle</label>
                      <textarea
                        rows={2}
                        value={settingsForm.homepage.heroSubtitle}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            homepage: { ...settingsForm.homepage, heroSubtitle: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                    <div className="flex flex-wrap gap-4 pt-2">
                      {(
                        [
                          ['showHowItWorks', 'Show "How It Works"'],
                          ['showTopUniversities', 'Show Top Universities'],
                          ['showLatestGuides', 'Show Latest Guides'],
                          ['showNewsletter', 'Show Newsletter Signup'],
                          ['showFaq', 'Show Homepage FAQ'],
                        ] as const
                      ).map(([field, label]) => (
                        <label key={field} className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsForm.homepage[field]}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                homepage: {
                                  ...settingsForm.homepage,
                                  [field]: e.target.checked,
                                },
                              })
                            }
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveSettingsGroup('homepage', 'Homepage settings')}
                    className="px-5 py-2 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
                  >
                    Save Homepage Configuration
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                    Header Navigation Menus (Max 5 Links)
                  </h2>
                  <div className="space-y-2.5 text-xs">
                    {settingsForm.menus.primaryNav.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const updated = [...settingsForm.menus.primaryNav];
                            updated[idx] = { ...item, label: e.target.value };
                            setSettingsForm({
                              ...settingsForm,
                              menus: { ...settingsForm.menus, primaryNav: updated },
                            });
                          }}
                          className="sm:col-span-5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                        />
                        <input
                          type="text"
                          value={item.to}
                          onChange={(e) => {
                            const updated = [...settingsForm.menus.primaryNav];
                            updated[idx] = { ...item, to: e.target.value };
                            setSettingsForm({
                              ...settingsForm,
                              menus: { ...settingsForm.menus, primaryNav: updated },
                            });
                          }}
                          className="sm:col-span-5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = settingsForm.menus.primaryNav.filter((_, i) => i !== idx);
                            setSettingsForm({
                              ...settingsForm,
                              menus: { ...settingsForm.menus, primaryNav: updated },
                            });
                          }}
                          className="sm:col-span-2 text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {settingsForm.menus.primaryNav.length < 5 && (
                      <button
                        type="button"
                        onClick={() =>
                          setSettingsForm({
                            ...settingsForm,
                            menus: {
                              ...settingsForm.menus,
                              primaryNav: [
                                ...settingsForm.menus.primaryNav,
                                { label: 'New Link', to: '/scholarships' },
                              ],
                            },
                          })
                        }
                        className="text-navy-800 dark:text-gold-400 font-semibold hover:underline cursor-pointer"
                      >
                        + Add Header Link
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div>
                        <label className="block font-medium mb-1">Header CTA Button Label</label>
                        <input
                          type="text"
                          value={settingsForm.menus.primaryCtaLabel}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              menus: { ...settingsForm.menus, primaryCtaLabel: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Header CTA Destination</label>
                        <input
                          type="text"
                          value={settingsForm.menus.primaryCtaTo}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              menus: { ...settingsForm.menus, primaryCtaTo: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveSettingsGroup('menus', 'Navigation menus')}
                    className="px-5 py-2 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
                  >
                    Save Menu Configuration
                  </button>
                </div>
              </div>
            )}

            {/* 7. MONETIZATION & ADS */}
            {tab === 'monetization' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                    AdSense &amp; Media.net Monetization Controls
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Configure publisher verification IDs, per-slot CLS-safe ad units, and dynamic <code>/ads.txt</code>.
                  </p>
                </div>

                <div className="flex flex-wrap gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                  <label className="inline-flex items-center gap-2 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.monetization.enabled}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          monetization: {
                            ...settingsForm.monetization,
                            enabled: e.target.checked,
                          },
                        })
                      }
                    />
                    <span>Enable Live Advertising Units</span>
                  </label>

                  <label className="inline-flex items-center gap-2 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.monetization.showPreApprovalSlots}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          monetization: {
                            ...settingsForm.monetization,
                            showPreApprovalSlots: e.target.checked,
                          },
                        })
                      }
                    />
                    <span>Preview Reserved Ad Slots (Pre-Approval QA)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium mb-1">Primary Ad Network</label>
                    <select
                      value={settingsForm.monetization.primaryNetwork}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          monetization: {
                            ...settingsForm.monetization,
                            primaryNetwork: e.target.value as 'adsense' | 'medianet',
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    >
                      <option value="adsense">Google AdSense</option>
                      <option value="medianet">Media.net</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Google AdSense Publisher ID</label>
                    <input
                      type="text"
                      value={settingsForm.monetization.adsensePublisherId}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          monetization: {
                            ...settingsForm.monetization,
                            adsensePublisherId: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Media.net Customer ID</label>
                    <input
                      type="text"
                      value={settingsForm.monetization.medianetCustomerId}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          monetization: {
                            ...settingsForm.monetization,
                            medianetCustomerId: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Individual Placement Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {(['header', 'inContent', 'sidebar', 'footer'] as const).map((pos) => {
                      const slot = settingsForm.monetization.slots[pos];
                      return (
                        <div
                          key={pos}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold uppercase tracking-wide">{pos} Slot</span>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={slot.enabled}
                                onChange={(e) =>
                                  setSettingsForm({
                                    ...settingsForm,
                                    monetization: {
                                      ...settingsForm.monetization,
                                      slots: {
                                        ...settingsForm.monetization.slots,
                                        [pos]: { ...slot, enabled: e.target.checked },
                                      },
                                    },
                                  })
                                }
                              />
                              <span>Active</span>
                            </label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={slot.network}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  monetization: {
                                    ...settingsForm.monetization,
                                    slots: {
                                      ...settingsForm.monetization.slots,
                                      [pos]: {
                                        ...slot,
                                        network: e.target.value as 'adsense' | 'medianet',
                                      },
                                    },
                                  },
                                })
                              }
                              className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                            >
                              <option value="adsense">AdSense</option>
                              <option value="medianet">Media.net</option>
                            </select>
                            <input
                              type="text"
                              value={slot.slotCode}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  monetization: {
                                    ...settingsForm.monetization,
                                    slots: {
                                      ...settingsForm.monetization.slots,
                                      [pos]: { ...slot, slotCode: e.target.value },
                                    },
                                  },
                                })
                              }
                              placeholder="Slot ID"
                              className="px-2.5 py-1.5 font-mono rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="block font-medium">
                    Dynamic <code>/ads.txt</code> File Contents
                  </label>
                  <textarea
                    rows={5}
                    value={settingsForm.monetization.adsTxtContent}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        monetization: {
                          ...settingsForm.monetization,
                          adsTxtContent: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveSettingsGroup('monetization', 'Monetization & ad slot settings')}
                  className="px-5 py-2.5 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
                >
                  Save Monetization &amp; ads.txt
                </button>
              </div>
            )}

            {/* 8. LEGAL PAGES */}
            {tab === 'legal' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                    Compliance &amp; Legal Pages Editor
                  </h2>
                  <select
                    value={selectedLegalSlug}
                    onChange={(e) => setSelectedLegalSlug(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  >
                    {legalPages.map((lp) => (
                      <option key={lp.slug} value={lp.slug}>
                        {lp.title} (/{lp.slug})
                      </option>
                    ))}
                  </select>
                </div>

                {legalDraft && (
                  <form onSubmit={handleSaveLegalPage} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium mb-1">Page Title</label>
                        <input
                          type="text"
                          value={legalDraft.title}
                          onChange={(e) => setLegalDraft({ ...legalDraft, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">SEO Title</label>
                        <input
                          type="text"
                          value={legalDraft.seoTitle}
                          onChange={(e) =>
                            setLegalDraft({ ...legalDraft, seoTitle: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium mb-1">SEO Meta Description</label>
                      <input
                        type="text"
                        value={legalDraft.seoDescription}
                        onChange={(e) =>
                          setLegalDraft({ ...legalDraft, seoDescription: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                      />
                    </div>

                    <div className="space-y-3">
                      {legalDraft.sections.map((sec, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
                        >
                          <input
                            type="text"
                            value={sec.heading}
                            onChange={(e) => {
                              const next = [...legalDraft.sections];
                              next[idx] = { ...sec, heading: e.target.value };
                              setLegalDraft({ ...legalDraft, sections: next });
                            }}
                            className="w-full px-3 py-1.5 font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          />
                          <textarea
                            rows={3}
                            value={sec.body}
                            onChange={(e) => {
                              const next = [...legalDraft.sections];
                              next[idx] = { ...sec, body: e.target.value };
                              setLegalDraft({ ...legalDraft, sections: next });
                            }}
                            className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
                    >
                      Publish Legal Page Changes
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 9. SEO & GENERAL SETTINGS */}
            {tab === 'seo' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                  Brand Identity, SEO &amp; Analytics Settings
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium mb-1">Website Brand Name</label>
                    <input
                      type="text"
                      value={settingsForm.general.brandName}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          general: { ...settingsForm.general, brandName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Short Name</label>
                    <input
                      type="text"
                      value={settingsForm.general.shortName}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          general: { ...settingsForm.general, shortName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-medium mb-1">Site Tagline</label>
                    <input
                      type="text"
                      value={settingsForm.general.tagline}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          general: { ...settingsForm.general, tagline: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Editorial Contact Email</label>
                    <input
                      type="email"
                      value={settingsForm.general.contactEmail}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          general: { ...settingsForm.general, contactEmail: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Advertising / Partner Email</label>
                    <input
                      type="email"
                      value={settingsForm.general.advertisingEmail}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          general: { ...settingsForm.general, advertisingEmail: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">GA4 Measurement ID</label>
                    <input
                      type="text"
                      value={settingsForm.general.ga4MeasurementId}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          general: { ...settingsForm.general, ga4MeasurementId: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Google Search Console Verification Token
                    </label>
                    <input
                      type="text"
                      value={settingsForm.general.googleSiteVerification}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          general: {
                            ...settingsForm.general,
                            googleSiteVerification: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                </div>
                <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 mb-4">
                  <input
                    type="checkbox"
                    checked={Boolean((settingsForm.general as any).showSampleData)}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        general: { ...settingsForm.general, showSampleData: e.target.checked } as any,
                      })
                    }
                  />
                  <span>
                    Show sample / unverified scholarships and universities to the public (off = hidden until you replace them with verified records)
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => handleSaveSettingsGroup('general', 'General & SEO settings')}
                  className="px-5 py-2.5 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
                >
                  Save SEO &amp; General Settings
                </button>
              </div>
            )}

            {/* 10. INBOX & SUBSCRIBERS */}
            {tab === 'inbox' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                    Contact Form Messages ({contactMessages.length})
                  </h2>
                  {contactMessages.length === 0 ? (
                    <p className="text-xs text-slate-500">No messages submitted yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {contactMessages.map((m) => (
                        <div
                          key={m.id}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {m.name} ({m.email}) — {m.topic}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {(['new', 'reviewed', 'archived'] as const).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleUpdateInboxStatus(m.id, st)}
                                  className={`px-2 py-0.5 rounded capitalize cursor-pointer ${
                                    m.status === st
                                      ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 font-semibold'
                                      : 'border border-slate-300 dark:border-slate-700'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {m.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                    <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white">
                      Newsletter Subscribers ({subscribers.length})
                    </h3>
                    {subscribers.length === 0 ? (
                      <p className="text-xs text-slate-500">No subscribers yet.</p>
                    ) : (
                      <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {subscribers.map((s) => (
                          <li key={s.id} className="py-2 flex justify-between gap-2">
                            <span className="font-medium">{s.email}</span>
                            <span className="text-slate-400">{s.role}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                    <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white">
                      Deadline Reminders ({reminders.length})
                    </h3>
                    {reminders.length === 0 ? (
                      <p className="text-xs text-slate-500">No deadline alerts scheduled yet.</p>
                    ) : (
                      <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {reminders.map((r) => (
                          <li key={r.id} className="py-2">
                            <p className="font-medium">{r.email}</p>
                            <p className="text-[11px] text-slate-500">{r.scholarship_title}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 11. USERS & ROLES */}
            {tab === 'users' && authUser.role === 'admin' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleCreateUser}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4"
                >
                  <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                    Invite Admin or Editor Account
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="Password (8+ chars)"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    />
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as 'editor' | 'admin')}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    >
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
                  >
                    Create User
                  </button>
                </form>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                  <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-navy-800 dark:text-gold-400" />
                    Registered CMS Users ({usersList.length})
                  </h2>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {usersList.map((u) => (
                      <div key={u.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {u.name}{' '}
                            <span className="uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                              {u.role}
                            </span>
                          </p>
                          <p className="text-slate-500">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleUserRole(u)}
                            className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                          >
                            Switch to {u.role === 'admin' ? 'Editor' : 'Admin'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleUserActive(u)}
                            className={`px-2.5 py-1 rounded border cursor-pointer ${
                              u.active
                                ? 'border-emerald-300 text-emerald-700 dark:text-emerald-300'
                                : 'border-rose-300 text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {u.active ? 'Active' : 'Suspended'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 12. DATABASE BACKUPS */}
            {tab === 'backups' && authUser.role === 'admin' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                      SQLite Database Backups &amp; Export
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Export all scholarships, categories, universities, guides, legal pages, media assets, and settings as a portable JSON snapshot.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-navy-900 text-white dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" /> Download JSON Backup
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Recent Export Audit Log
                  </h3>
                  {backups.length === 0 ? (
                    <p className="text-slate-500">No backups exported yet.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {backups.map((b) => (
                        <li key={b.id} className="py-2.5 flex justify-between gap-3">
                          <span>
                            Exported by <strong>{b.created_by}</strong> ·{' '}
                            <span className="text-slate-500">{b.summary_json}</span>
                          </span>
                          <span className="text-slate-400 tabular-nums">
                            {new Date(b.created_at).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {editingScholarship && (
        <ScholarshipEditorModal
          initial={editingScholarship === 'new' ? null : editingScholarship}
          categories={categories}
          universities={universities}
          onClose={() => setEditingScholarship(null)}
          onSave={handleSaveScholarship}
        />
      )}

      {editingGuide && (
        <GuideEditorModal
          initial={editingGuide === 'new' ? null : editingGuide}
          mediaAssets={mediaAssets}
          onClose={() => setEditingGuide(null)}
          onSave={handleSaveGuide}
        />
      )}
    </>
  );
}
