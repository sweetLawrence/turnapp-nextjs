"use client"

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  User, Lock, Loader2, Facebook, Twitter, Instagram, Globe, Save,
  Camera, ImagePlus, ExternalLink,
} from 'lucide-react';
import api from '@/lib/services/apiClient';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userSlug, setUserSlug] = useState('');
  
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    avatar: '',
    cover_image: '',
    facebook: '',
    twitter: '',
    instagram: '',
    website: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        const user = response.data.data.user;
        setProfileForm({
          name: user.name || '',
          email: user.email || '',
          bio: user.bio || '',
          location: user.location || '',
          avatar: user.profile_photo_url || '',
          cover_image: user.cover_image || '',
          facebook: user.social_links?.facebook || '',
          twitter: user.social_links?.twitter || '',
          instagram: user.social_links?.instagram || '',
          website: user.social_links?.website || '',
        });
        setUserSlug(user.slug || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    
    try {
      const response = await api.put('/auth/profile', {
        name: profileForm.name,
        bio: profileForm.bio,
        location: profileForm.location,
        facebook: profileForm.facebook,
        twitter: profileForm.twitter,
        instagram: profileForm.instagram,
        website: profileForm.website,
      });
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        // Update localStorage user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          ...response.data.data.user
        }));
        // Refresh to get updated slug if name changed
        loadProfile();
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    setUploading(true);
    try {
      const response = await api.post('/organizer/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setProfileForm({
          ...profileForm,
          avatar: response.data.data.avatar_url
        });
        toast.success('Profile picture updated!');
      }
    } catch (error) {
      toast.error('Failed to upload profile picture');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      // Reset input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }
    
    const formData = new FormData();
    formData.append('cover_image', file);
    
    setUploading(true);
    try {
      const response = await api.post('/organizer/cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setProfileForm({
          ...profileForm,
          cover_image: response.data.data.cover_url
        });
        toast.success('Cover image updated!');
      }
    } catch (error) {
      toast.error('Failed to upload cover image');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      // Reset input
      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    
    try {
      const response = await api.put('/auth/password', passwordForm);
      
      if (response.data.success) {
        toast.success('Password updated successfully');
        setPasswordForm({
          current_password: '',
          password: '',
          password_confirmation: '',
        });
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update password');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Profile Settings</h1>
            <p className="text-zinc-400 text-sm">Manage your account information and preferences</p>
          </div>
          
          {/* View Public Profile Button */}
          {userSlug && (
            <Button
              variant="outline"
              onClick={() => window.open(`/organizers/${userSlug}`, '_blank')}
              className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Public Profile
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
              activeTab === 'profile' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <User className={`h-4 w-4 ${activeTab === 'profile' ? 'text-primary' : ''}`} />
            Profile Information
            {activeTab === 'profile' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
              activeTab === 'password' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Lock className={`h-4 w-4 ${activeTab === 'password' ? 'text-primary' : ''}`} />
            Password & Security
            {activeTab === 'password' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            )}
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 space-y-6">
              
              {/* Cover Image Upload */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Banner Image</h3>
                <div className="relative group">
                  <div className="h-48 md:h-56 bg-zinc-800 rounded-xl overflow-hidden border border-white/5">
                    {profileForm.cover_image ? (
                      <img 
                        src={profileForm.cover_image} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                        <ImagePlus className="h-10 w-10 mb-2" />
                        <span className="text-sm">Upload a banner image</span>
                        <span className="text-xs mt-1">Recommended: 1200x400px</span>
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-black/90 transition-colors disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4 inline mr-2" />
                    Change Banner
                  </button>
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Profile Picture</h3>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 group-hover:border-primary transition-colors">
                      {profileForm.avatar ? (
                        <img 
                          src={profileForm.avatar} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-zinc-800">
                          <User className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 bg-primary rounded-full p-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300">Upload a profile picture</p>
                    <p className="text-xs text-zinc-500">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.name ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="Your full name"
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name[0]}</p>}
                  </div>
                  
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Location Field - NEW */}
                  <div className="md:col-span-2">
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary"
                      placeholder="e.g., Nairobi, Kenya"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="border-t border-white/5 pt-6">
                <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={4}
                  maxLength={500}
                  className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary resize-none ${
                    errors.bio ? 'border-red-500' : 'border-zinc-800'
                  }`}
                  placeholder="Tell us about yourself..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && <p className="text-xs text-red-400">{errors.bio[0]}</p>}
                  <p className="text-xs text-zinc-500 ml-auto">{profileForm.bio.length}/500</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="border-t border-white/5 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block flex items-center gap-2">
                      <Facebook className="h-3 w-3" /> Facebook
                    </label>
                    <input
                      type="url"
                      value={profileForm.facebook}
                      onChange={(e) => setProfileForm({ ...profileForm, facebook: e.target.value })}
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.facebook ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="https://facebook.com/yourpage"
                    />
                    {errors.facebook && <p className="text-xs text-red-400 mt-1">{errors.facebook[0]}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block flex items-center gap-2">
                      <Twitter className="h-3 w-3" /> Twitter
                    </label>
                    <input
                      type="url"
                      value={profileForm.twitter}
                      onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })}
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.twitter ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="https://twitter.com/yourhandle"
                    />
                    {errors.twitter && <p className="text-xs text-red-400 mt-1">{errors.twitter[0]}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block flex items-center gap-2">
                      <Instagram className="h-3 w-3" /> Instagram
                    </label>
                    <input
                      type="url"
                      value={profileForm.instagram}
                      onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.instagram ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="https://instagram.com/yourhandle"
                    />
                    {errors.instagram && <p className="text-xs text-red-400 mt-1">{errors.instagram[0]}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block flex items-center gap-2">
                      <Globe className="h-3 w-3" /> Website
                    </label>
                    <input
                      type="url"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.website ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="https://yourwebsite.com"
                    />
                    {errors.website && <p className="text-xs text-red-400 mt-1">{errors.website[0]}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving || uploading}
                className="bg-primary hover:bg-primary/90 text-white px-8"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
                <p className="text-sm text-zinc-400 mb-6">
                  Ensure your account is using a long, random password to stay secure.
                </p>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      required
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.current_password ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="Enter current password"
                    />
                    {errors.current_password && <p className="text-xs text-red-400 mt-1">{errors.current_password[0]}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                      required
                      minLength={8}
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white focus:outline-none focus:border-primary ${
                        errors.password ? 'border-red-500' : 'border-zinc-800'
                      }`}
                      placeholder="Enter new password (min 8 characters)"
                    />
                    {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password[0]}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.password_confirmation}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white px-8"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;