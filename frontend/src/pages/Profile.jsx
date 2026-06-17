import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Settings,
  Shield,
} from 'lucide-react'
import Layout from '../components/Layout'
import ProfileAvatar from '../components/ProfileAvatar'
import Alert from '../components/ui/Alert'
import Loader from '../components/ui/Loader'
import { fetchProfile, updateProfile } from '../store/slices/authSlice'

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender (optional)' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
]

const MAX_PHOTO_SIZE = 2 * 1024 * 1024

function Profile() {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((state) => state.auth)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    profilePhoto: null,
  })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [success, setSuccess] = useState('')
  const [localError, setLocalError] = useState('')
  const [saving, setSaving] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    dispatch(fetchProfile()).finally(() => setInitialLoading(false))
  }, [dispatch])

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: user.gender || '',
        profilePhoto: user.profilePhoto || null,
      })
      setPhotoPreview(user.profilePhoto || null)
    }
  }, [user])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setLocalError('')
    setSuccess('')
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setLocalError('Please select a valid image file')
      return
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setLocalError('Image must be smaller than 2 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setPhotoPreview(dataUrl)
      setForm((prev) => ({ ...prev, profilePhoto: dataUrl }))
      setLocalError('')
      setSuccess('')
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setPhotoPreview(null)
    setForm((prev) => ({ ...prev, profilePhoto: null }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    setSuccess('')

    if (!form.name.trim()) {
      setLocalError('Full name is required')
      return
    }

    setSaving(true)
    try {
      await dispatch(
        updateProfile({
          name: form.name.trim(),
          profilePhoto: form.profilePhoto,
          contactNumber: form.contactNumber,
          address: form.address,
          dateOfBirth: form.dateOfBirth || null,
          gender: form.gender || null,
        })
      ).unwrap()
      setSuccess('Profile updated successfully')
    } catch (err) {
      setLocalError(err || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (initialLoading) {
    return (
      <Layout>
        <div className="page-container flex justify-center py-20">
          <Loader />
        </div>
      </Layout>
    )
  }

  const displayUser = { ...user, profilePhoto: photoPreview }

  return (
    <Layout>
      <div className="page-container max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-theme">My Profile</h1>
          <p className="text-theme-muted mt-1">View and update your personal information</p>
        </div>

        {(localError || error) && (
          <div className="mb-4">
            <Alert message={localError || error} type="error" onClose={() => setLocalError('')} />
          </div>
        )}
        {success && (
          <div className="mb-4">
            <Alert message={success} type="success" onClose={() => setSuccess('')} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="glass-card overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary px-6 py-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <ProfileAvatar user={displayUser} size="xl" onClick={() => fileInputRef.current?.click()} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-theme-surface border-2 border-primary flex items-center justify-center text-primary shadow-lg hover:scale-105 transition-transform"
                    aria-label="Change profile photo"
                  >
                    <Camera size={16} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-bold text-white">{form.name || 'Your Name'}</h2>
                  <p className="text-white/80 text-sm mt-1">{form.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                    >
                      Upload Photo
                    </button>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 text-white/90 hover:bg-white/20 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-theme mb-1.5">
                  <span className="flex items-center gap-2">
                    <User size={14} className="text-primary" />
                    Full Name
                  </span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="John Doe"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme mb-1.5">
                  <span className="flex items-center gap-2">
                    <Mail size={14} className="text-primary" />
                    Email Address
                  </span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  disabled
                  className="input-field opacity-70 cursor-not-allowed bg-theme-surface"
                  title="Email cannot be changed"
                />
                <p className="text-xs text-theme-muted mt-1">Email is set during registration and cannot be edited.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme mb-1.5">
                  <span className="flex items-center gap-2">
                    <Phone size={14} className="text-primary" />
                    Contact Number
                  </span>
                </label>
                <input
                  type="tel"
                  value={form.contactNumber}
                  onChange={(e) => handleChange('contactNumber', e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme mb-1.5">
                  <span className="flex items-center gap-2">
                    <MapPin size={14} className="text-primary" />
                    Address
                  </span>
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Street, City, Country"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-theme mb-1.5">
                    <span className="flex items-center gap-2">
                      <Calendar size={14} className="text-primary" />
                      Date of Birth
                      <span className="text-theme-muted font-normal">(optional)</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme mb-1.5">
                    Gender <span className="text-theme-muted font-normal">(optional)</span>
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="input-field"
                  >
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {user?.role && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-theme-surface border border-theme">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-theme-muted font-medium">Account Role</p>
                    <p className="text-sm font-semibold text-theme">{user.role}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
              <button type="submit" disabled={saving || loading} className="btn-primary flex-1 sm:flex-none">
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link to="/settings" className="btn-secondary flex-1 sm:flex-none justify-center">
                <Settings size={16} />
                Settings
              </Link>
            </div>
          </section>
        </form>
      </div>
    </Layout>
  )
}

export default Profile
