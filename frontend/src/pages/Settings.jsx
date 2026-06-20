import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Palette,
  Database,
  Bell,
  Shield,
  Info,
  Moon,
  Sun,
  Download,
  Upload,
  ChevronRight,
} from 'lucide-react'
import Layout from '../components/Layout'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import BrandLogo, { APP_NAME } from '../components/BrandLogo'
import {
  toggleDarkMode,
  setFontFamily,
  setFontSize,
  setNotificationsEnabled,
  restoreSettings,
  FONT_FAMILIES,
  FONT_SIZES,
} from '../store/slices/settingsSlice'

const APP_VERSION = '1.0.0'

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <section className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-theme flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon size={18} className="text-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-theme">{title}</h2>
          {description && <p className="text-xs text-theme-muted">{description}</p>}
        </div>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </section>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-theme last:border-0">
      <div>
        <p className="text-sm font-medium text-theme">{label}</p>
        {description && <p className="text-xs text-theme-muted mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function Settings() {
  const dispatch = useDispatch()
  const settings = useSelector((state) => state.settings ?? {})
  const auth = useSelector((state) => state.auth)
  const tasks = useSelector((state) => state.tasks.items)
  const fileInputRef = useRef(null)

  const [message, setMessage] = useState({ text: '', type: 'success' })
  const [passwordModal, setPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  })
  const [passwordError, setPasswordError] = useState('')

  const handleBackup = () => {
    const backup = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      settings,
      user: auth.user ? { name: auth.user.name, email: auth.user.email, role: auth.user.role } : null,
      tasks,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `taskpulse-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ text: 'Backup downloaded successfully.', type: 'success' })
  }

  const handleRestore = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (data.settings) {
          dispatch(restoreSettings(data.settings))
        }
        setMessage({ text: 'Settings restored from backup.', type: 'success' })
      } catch {
        setMessage({ text: 'Invalid backup file.', type: 'error' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    setPasswordError('')
    if (!passwordForm.current || !passwordForm.newPassword) {
      setPasswordError('All fields are required.')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setPasswordError('Passwords do not match.')
      return
    }
    setPasswordError('Change password API is not available on the server yet. UI is ready for future integration.')
  }

  return (
    <Layout>
      <div className="page-container max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-theme">Settings</h1>
          <p className="text-theme-muted mt-1">Customize your {APP_NAME} experience</p>
        </div>

        {message.text && (
          <div className="mb-6">
            <Alert
              message={message.text}
              type={message.type}
              onClose={() => setMessage({ text: '', type: 'success' })}
            />
          </div>
        )}

        <div className="space-y-6">
          <SettingsSection
            icon={Palette}
            title="Appearance"
            description="Purple Premium theme — light & dark modes"
          >
            <SettingRow
              label="Dark Mode"
              description={settings.darkMode ? 'Dark theme active' : 'Light theme active'}
            >
              <div className="flex items-center gap-2">
                <Sun size={16} className="text-theme-muted" />
                <Toggle
                  checked={settings.darkMode}
                  onChange={() => dispatch(toggleDarkMode())}
                  label="Toggle dark mode"
                />
                <Moon size={16} className="text-theme-muted" />
              </div>
            </SettingRow>

            <SettingRow label="Font Family" description="Choose your preferred typeface">
              <select
                value={settings.fontFamily}
                onChange={(e) => dispatch(setFontFamily(e.target.value))}
                className="input-field w-full sm:w-48"
              >
                {Object.entries(FONT_FAMILIES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </SettingRow>

            <SettingRow label="Font Size" description="Adjust text size across the app">
              <div className="flex gap-2">
                {Object.entries(FONT_SIZES).map(([key, { label }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => dispatch(setFontSize(key))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      settings.fontSize === key
                        ? 'bg-primary text-white'
                        : 'bg-theme-surface border border-theme text-theme-muted hover:border-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </SettingRow>

            <div className="mt-4 p-4 rounded-xl border border-theme bg-theme-surface">
              <p className="text-xs font-semibold text-theme-muted uppercase mb-3">Theme Preview</p>
              <div className="flex gap-3">
                <div className="flex-1 p-3 rounded-lg bg-[#F8FAFC] border border-slate-200">
                  <div className="w-full h-2 rounded bg-[#7C3AED] mb-2" />
                  <div className="w-2/3 h-2 rounded bg-[#A855F7] mb-2" />
                  <p className="text-xs text-[#1E293B]">Light Mode</p>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-[#0F172A] border border-slate-700">
                  <div className="w-full h-2 rounded bg-[#8B5CF6] mb-2" />
                  <div className="w-2/3 h-2 rounded bg-[#A78BFA] mb-2" />
                  <p className="text-xs text-[#F8FAFC]">Dark Mode</p>
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection icon={Database} title="Data Management" description="Backup and restore your preferences">
            <SettingRow label="Backup Data" description="Download settings and task data as JSON">
              <button type="button" onClick={handleBackup} className="btn-secondary">
                <Download size={16} /> Backup
              </button>
            </SettingRow>
            <SettingRow label="Restore Data" description="Import from a backup file">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestore}
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary">
                <Upload size={16} /> Restore
              </button>
            </SettingRow>
          </SettingsSection>

          <SettingsSection icon={Bell} title="Notifications" description="Control alert preferences">
            <SettingRow label="Enable Notifications" description="Receive in-app notifications">
              <Toggle
                checked={settings.notificationsEnabled}
                onChange={(v) => dispatch(setNotificationsEnabled(v))}
                label="Toggle notifications"
              />
            </SettingRow>
          </SettingsSection>

          <SettingsSection icon={Shield} title="Security" description="Manage your account security">
            <SettingRow label="Change Password" description="Update your account password">
              <button type="button" onClick={() => setPasswordModal(true)} className="btn-primary">
                Change Password
              </button>
            </SettingRow>
          </SettingsSection>

          <SettingsSection icon={Info} title="About" description="Application information">
            <SettingRow label="Application" description="Product name">
              <BrandLogo size="sm" />
            </SettingRow>
            <SettingRow label="App Version" description="Current release">
              <span className="text-sm font-semibold text-primary">v{APP_VERSION}</span>
            </SettingRow>
            <SettingRow label="Privacy Policy">
              <button type="button" className="text-sm text-primary hover:underline flex items-center gap-1">
                View <ChevronRight size={14} />
              </button>
            </SettingRow>
            <SettingRow label="Terms & Conditions">
              <button type="button" className="text-sm text-primary hover:underline flex items-center gap-1">
                View <ChevronRight size={14} />
              </button>
            </SettingRow>
          </SettingsSection>

          <p className="text-center text-sm text-theme-muted pb-4">
            <Link to="/profile" className="text-primary hover:underline">← Back to Profile</Link>
          </p>
        </div>

        <Modal isOpen={passwordModal} onClose={() => setPasswordModal(false)} title="Change Password">
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordError && <Alert message={passwordError} type="error" />}
            <div>
              <label className="block text-sm font-medium text-theme mb-1.5">Current Password</label>
              <input
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme mb-1.5">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setPasswordModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Update Password</button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}

export default Settings
