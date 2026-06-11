"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, User as UserIcon, BookOpen, Settings, X, Check, Phone, Mail } from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";

interface Course {
  id: number;
  name: string;
  slug: string;
}

interface ProfileData {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bio: string;
  is_author: boolean;
  studying_in: Course[];
  my_courses: Course[];
  my_certificates?: { name: string }[];
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  
  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [allCertificates, setAllCertificates] = useState<{name: string}[]>([]);
  const [newCertName, setNewCertName] = useState("");
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    phone_number: "",
    email: "",
    certificates: [] as string[]
  });

  const fetchProfile = async () => {
    try {
      const [profileRes, certsRes] = await Promise.all([
        axiosInstance.get("/user_control/me/"),
        axiosInstance.get("/user_control/certificates/")
      ]);
      
      setProfile(profileRes.data);
      setAllCertificates(certsRes.data);
      
      setEditForm({
        first_name: profileRes.data.first_name || "",
        last_name: profileRes.data.last_name || "",
        bio: profileRes.data.bio || "",
        phone_number: profileRes.data.phone_number || "",
        email: profileRes.data.email || "",
        certificates: profileRes.data.my_certificates?.map((c: any) => c.name) || []
      });
    } catch (err) {
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const message = window.sessionStorage.getItem("profile_notification");
    if (message) {
      setNotification(message);
      window.sessionStorage.removeItem("profile_notification");
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await axiosInstance.patch("/user_control/me/", editForm);
      await fetchProfile();
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert("Failed to update profile: " + JSON.stringify(err.response?.data || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleCertificate = (name: string) => {
    setEditForm(prev => {
      const isSelected = prev.certificates.includes(name);
      if (isSelected) {
        return { ...prev, certificates: prev.certificates.filter(c => c !== name) };
      } else {
        return { ...prev, certificates: [...prev.certificates, name] };
      }
    });
  };

  const addNewCertificate = () => {
    if (newCertName.trim() && !editForm.certificates.includes(newCertName.trim())) {
      const name = newCertName.trim();
      setEditForm(prev => ({ ...prev, certificates: [...prev.certificates, name] }));
      if (!allCertificates.some(c => c.name === name)) {
        setAllCertificates(prev => [...prev, { name }]);
      }
      setNewCertName("");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="surface-panel max-w-lg px-6 py-8 text-center text-red-600">
          <h3 className="font-bold text-xl mb-2">Oops!</h3>
          <p>{error || "Failed to load profile."}</p>
        </div>
      </div>
    );
  }

  const displayName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile.username;

  return (
    <div className="w-full max-w-5xl space-y-12">
      {notification && (
        <div className="surface-panel flex items-start justify-between gap-4 border-emerald-200/70 bg-emerald-50/80 px-5 py-4 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15">
              <Check size={16} className="text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <p className="font-bold">Success</p>
              <p className="text-sm text-emerald-700/90 dark:text-emerald-300/90">{notification}</p>
            </div>
          </div>
          <button
            onClick={() => setNotification("")}
            className="rounded-full p-1 text-emerald-700 transition-colors hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Profile Header */}
      <div className="surface-panel overflow-hidden relative">
        <div className="relative h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-6 right-6 z-10 rounded-2xl border border-white/30 bg-white/20 p-3 text-white backdrop-blur-md transition-all hover:bg-white/30"
            title="Edit Profile"
          >
            <Settings size={20} />
          </button>
        </div>
        
        <div className="relative px-8 pb-8">
          <div className="absolute -top-16 left-8 rounded-full border border-slate-100 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-950">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400">
              <UserIcon size={64} />
            </div>
          </div>
          
          <div className="pt-20 pl-2 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black leading-tight text-slate-950 dark:text-slate-100">{displayName}</h1>
                {profile.is_author && (
                  <span className="rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                    PRO TEACHER
                  </span>
                )}
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-lg font-medium">@{profile.username}</p>
              
              {profile.bio && (
                <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed text-base italic">
                  "{profile.bio}"
                </p>
              )}

              <div className="flex flex-wrap gap-4 mt-6">
                {profile.email && (
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                    <Mail size={14} className="text-indigo-500" />
                    {profile.email}
                  </div>
                )}
                {profile.phone_number && (
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                    <Phone size={14} className="text-purple-500" />
                    {profile.phone_number}
                  </div>
                )}
              </div>

              {/* Certificates Display */}
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.my_certificates?.map((cert: any, idx: number) => (
                  <span key={idx} className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700 shadow-sm dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                    <Check size={12} /> {cert.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {profile.is_author && (
                <Link 
                  href="/courses/create" 
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
                >
                  Create Course
                </Link>
              )}
              <Link
                href="/auth/change-password"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-95 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Change Password
              </Link>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-6 py-3 font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="my-8 surface-panel w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-8 py-6 dark:border-slate-800 dark:bg-slate-950/40">
              <h2 className="text-xl font-black text-slate-950 dark:text-slate-100">Update Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="rounded-xl p-2 transition-colors hover:bg-white dark:hover:bg-slate-700">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6 p-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">First Name</label>
                  <input 
                    type="text" 
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                    className="input-base font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                  <input 
                    type="text" 
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                    className="input-base font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Bio</label>
                <textarea 
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                  <input 
                    type="email" 
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={editForm.phone_number}
                    onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Your Certificates</label>
                <div className="flex flex-wrap gap-2 mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                  {allCertificates.length > 0 ? allCertificates.map((cert) => {
                    const isSelected = editForm.certificates.includes(cert.name);
                    return (
                      <button
                        key={cert.name}
                        type="button"
                        onClick={() => toggleCertificate(cert.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                          isSelected 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300"
                        }`}
                      >
                        {isSelected && <Check size={14} />}
                        {cert.name}
                      </button>
                    );
                  }) : (
                    <p className="text-slate-400 text-xs italic">No existing certificates found. Add a new one below!</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCertName}
                    onChange={(e) => setNewCertName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewCertificate())}
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
                    placeholder="Add new certificate name..."
                  />
                  <button 
                    type="button"
                    onClick={addNewCertificate}
                    className="px-6 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all border border-indigo-100 dark:border-indigo-800"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 size={20} className="animate-spin" /> : <><Check size={20} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-16">
        {/* Enrolled Courses */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4 shadow-sm border border-indigo-100 dark:border-indigo-800">
              <BookOpen size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Enrolled Courses</h2>
          </div>

          {profile.studying_in && profile.studying_in.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profile.studying_in.map((course) => (
                <Link 
                  href={`/courses/${course.slug}`} 
                  key={course.id}
                  className="group flex flex-col bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                >
                  <div className="h-40 bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                    <BookOpen size={56} className="text-white/40 group-hover:scale-110 group-hover:text-white transition-all duration-500 z-20" />
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {course.name}
                    </h3>
                    
                    <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
                      <span className="text-indigo-600 dark:text-indigo-400 text-sm font-black tracking-widest uppercase group-hover:translate-x-1 transition-transform">
                        Continue &rarr;
                      </span>
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700" />
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50/50 dark:bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-16 text-center">
              <div className="mx-auto w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600">
                <BookOpen size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 mb-3">Your learning journey starts here</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-10 text-lg">
                Pick a course and level up your skills today.
              </p>
              <Link 
                href="/courses" 
                className="inline-flex items-center justify-center px-10 py-4 bg-white dark:bg-slate-800 border-2 border-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/10 text-lg font-black text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
              >
                Browse Catalog
              </Link>
            </div>
          )}
        </div>

        {/* My Courses (Created) */}
        {profile.is_author && (
          <div>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mr-4 shadow-sm border border-purple-100 dark:border-purple-800">
                <UserIcon size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">My Teaching Lab</h2>
            </div>

            {profile.my_courses && profile.my_courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {profile.my_courses.map((course) => (
                  <Link 
                    href={`/courses/${course.slug}/manage`} 
                    key={course.id}
                    className="group flex flex-col bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                  >
                    <div className="h-40 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center p-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                      <BookOpen size={56} className="text-white/40 group-hover:scale-110 group-hover:text-white transition-all duration-500 z-20" />
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                        {course.name}
                      </h3>
                      
                      <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
                        <span className="text-purple-600 dark:text-purple-400 text-sm font-black tracking-widest uppercase group-hover:translate-x-1 transition-transform">
                          Manage &rarr;
                        </span>
                        <div className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-black rounded-lg uppercase tracking-tighter">
                          Live
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50/50 dark:bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-16 text-center">
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 mb-3">Ready to share your wisdom?</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-10 text-lg">
                  Create your first course and inspire thousands of students.
                </p>
                <Link 
                  href="/courses/create" 
                  className="inline-flex items-center justify-center px-10 py-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20 text-lg font-black text-white hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Launch Course
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
