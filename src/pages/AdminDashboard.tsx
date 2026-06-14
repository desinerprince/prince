import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Trash2, Edit2, LogOut, Plus, Image as ImageIcon, Check, 
  Star, Inbox, Phone, Mail, DollarSign, Calendar, Search, RefreshCw,
  MessageSquare, User, FileText, ArrowRight, Sparkles, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, PortfolioItem, Testimonial } from '../types';

export default function AdminDashboard() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Navigation tab: Defaulting to 'bookings' to immediately highlight client orders
  const [activeTab, setActiveTab] = useState<'bookings' | 'portfolio' | 'testimonials'>('bookings');

  // Supabase bookings live feed
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('All');

  // Testimonials management state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [editTName, setEditTName] = useState('');
  const [editTBrand, setEditTBrand] = useState('');
  const [editTReview, setEditTReview] = useState('');
  const [editTStars, setEditTStars] = useState(5);

  // Form states (Portfolio upload)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Edit states (Portfolio edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');

  useEffect(() => {
    checkAuth();
    fetchItems();
    fetchTestimonials();
    fetchBookings();
  }, []);

  const triggerHaptic = (ms = 50) => {
    if (navigator.vibrate) navigator.vibrate(ms);
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      if (!data.authenticated) {
        navigate('/login');
      }
    } catch {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    triggerHaptic();
    await fetch('/api/logout', { method: 'POST' });
    navigate('/login');
  };

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch items');
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Failed to fetch testimonials');
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    setBookingsError('');
    try {
      const res = await fetch('/api/admin/bookings');
      if (!res.ok) {
        throw new Error('Server returned an invalid error status.');
      }
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      setBookingsError(error.message || 'Could not fetch bookings from Supabase database.');
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      triggerHaptic();
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    triggerHaptic();
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('title', title);
    formData.append('category', category);

    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setTitle('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchItems();
      }
    } catch (error) {
      console.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) return;
    triggerHaptic(60);
    
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Delete failed');
    }
  };

  const startEdit = (item: PortfolioItem) => {
    triggerHaptic();
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditCategory(item.category);
  };

  const saveEdit = async (id: string) => {
    triggerHaptic();
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, category: editCategory }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchItems();
      }
    } catch (error) {
      console.error('Edit failed');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client review?')) return;
    triggerHaptic(60);
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTestimonials(testimonials.filter(t => t.id !== id));
      }
    } catch {
      console.error('Failed to delete testimonial');
    }
  };

  const startEditTestimonial = (t: Testimonial) => {
    triggerHaptic();
    setEditingTestimonialId(t.id);
    setEditTName(t.name);
    setEditTBrand(t.brand);
    setEditTReview(t.review);
    setEditTStars(t.stars);
  };

  const saveEditTestimonial = async (id: string) => {
    triggerHaptic();
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editTName,
          brand: editTBrand,
          review: editTReview,
          stars: editTStars
        })
      });
      if (res.ok) {
        setEditingTestimonialId(null);
        fetchTestimonials();
      }
    } catch {
      console.error('Failed to save testimonial edit');
    }
  };

  // Filter and search bookings list
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      booking.phone?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      booking.email?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      booking.details?.toLowerCase().includes(bookingSearch.toLowerCase());

    const matchesCategory = 
      bookingFilter === 'All' || 
      booking.service?.toLowerCase() === bookingFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Extract unique booking services for filter dropdown
  const uniqueBookingServices = Array.from(
    new Set(bookings.map(b => b.service).filter(Boolean))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Securing environment & loading details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 relative selection:bg-red-luxury/30 selection:text-white">
      {/* Absolute backgrounds */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-luxury/5 to-transparent pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Command Center Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur gap-4 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">Admin Console Connected</span>
            </div>
            <h1 className="text-3.5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-gold tracking-tight mt-1">
              Gautam's HQ Panel
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Control live inquiries, portfolio items, and client reviews.</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center px-4 py-2.5 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300 rounded-lg transition-all border border-red-900/30 font-medium text-sm shadow cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout Session
          </button>
        </div>

        {/* Dynamic Responsive Tab Controls */}
        <div className="flex bg-gray-950 p-1.5 rounded-xl border border-white/5 shadow-inner gap-1">
          <button 
            onClick={() => { setActiveTab('bookings'); triggerHaptic(20); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-3 rounded-lg text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'bookings' 
                ? 'bg-gradient-to-r from-yellow-500 to-gold text-black shadow-lg font-bold' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Customer Enquiries</span>
            {bookings.length > 0 && (
              <span className={`text-2xs px-2 py-0.5 rounded-full font-sans font-extrabold ${
                activeTab === 'bookings' ? 'bg-black text-white' : 'bg-red-500/20 text-red-400'
              }`}>
                {bookings.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('portfolio'); triggerHaptic(20); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'portfolio' 
                ? 'bg-gradient-to-r from-yellow-500 to-gold text-black shadow-lg font-bold' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Manage Portfolio</span>
          </button>

          <button 
            onClick={() => { setActiveTab('testimonials'); triggerHaptic(20); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'testimonials' 
                ? 'bg-gradient-to-r from-yellow-500 to-gold text-black shadow-lg font-bold' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Client Reviews</span>
            {testimonials.length > 0 && (
              <span className={`text-2xs px-2 py-0.5 rounded-full font-sans font-extrabold ${
                activeTab === 'testimonials' ? 'bg-black text-white' : 'bg-gold/20 text-gold'
              }`}>
                {testimonials.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === 'bookings' && (
            <motion.div 
              key="bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-950 p-5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gold/10 rounded-xl border border-gold/20">
                    <Inbox className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                       Client Inquiries Log
                    </h2>
                    <p className="text-gray-500 text-xs">Instantly captured from Supabase database schema.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-2.5">
                  {/* Search Bar */}
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search inquiries..." 
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full bg-black/80 text-white placeholder-gray-500 text-xs rounded-lg pl-9 pr-4 py-2 border border-gray-800 focus:border-gold outline-none transition-all"
                    />
                  </div>

                  {/* Dropdown filter */}
                  <div className="relative">
                    <select 
                      value={bookingFilter}
                      onChange={(e) => setBookingFilter(e.target.value)}
                      className="w-full bg-black/80 text-white text-xs rounded-lg px-3 py-2 border border-gray-800 focus:border-gold outline-none transition-all pr-8 appearance-none cursor-pointer"
                    >
                      <option value="All">All Services</option>
                      {uniqueBookingServices.map(srv => (
                        <option key={srv} value={srv}>{srv}</option>
                      ))}
                    </select>
                    <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                  </div>

                  {/* Refresh Button */}
                  <button 
                    onClick={() => { fetchBookings(); triggerHaptic(10); }}
                    disabled={bookingsLoading}
                    className="bg-gray-900 border border-white/5 hover:bg-gray-800 disabled:opacity-50 text-white p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer"
                    title="Refresh Live Data"
                  >
                    <RefreshCw className={`w-4 h-4 text-gold ${bookingsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {bookingsError && (
                <div className="p-4 bg-red-950/20 border border-red-500/15 rounded-xl text-red-400 text-sm flex flex-col gap-2">
                  <p className="font-semibold">⚠️ Database Sync Concern:</p>
                  <p className="text-xs">{bookingsError}</p>
                  <p className="text-2xs text-gray-400">Note: Please ensure the correct Supabase schema is active in your dashboard by running the SQL scripts provided below.</p>
                </div>
              )}

              {bookingsLoading ? (
                <div className="py-24 text-center space-y-3 border border-dashed border-white/5 rounded-2xl">
                  <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-500 text-xs font-mono">Quering Supabase Tables...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-white/5 rounded-2xl bg-gray-950/30">
                  <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No customer bookings or matching enqueries found</p>
                  <p className="text-xs text-gray-500 mt-1">If customers have filled the form, verify your table schema is active on Supabase.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBookings.map((booking, idx) => {
                    // WhatsApp direct message URL creator
                    const clearNumber = booking.phone?.replace(/[^0-9]/g, '');
                    // Format prefix if missing
                    let whatsappNumber = clearNumber;
                    if (clearNumber && clearNumber.length === 10) {
                      whatsappNumber = '91' + clearNumber; // Default to India prefix if exactly 10 digits
                    }
                    const textMsg = encodeURIComponent(`Hello ${booking.name},\nThis is Gautam here regarding your graphic design inquiry for "${booking.service || 'Design package'}"...`);
                    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${textMsg}`;
                    const formattedDate = booking.created_at || booking.createdAt
                      ? new Date(booking.created_at || booking.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Unknown Date';

                    return (
                      <motion.div 
                        key={booking.id || idx}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-6 rounded-2xl border border-white/5 relative flex flex-col justify-between hover:border-gold/20 transition-all shadow-md group overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 rounded-full blur-xl pointer-events-none group-hover:bg-gold/10 transition-all"></div>
                        
                        <div>
                          {/* Card Head */}
                          <div className="flex justify-between items-start mb-3 gap-2">
                            <div>
                              <h3 className="font-extrabold text-white text-base tracking-tight leading-tight group-hover:text-gold transition-colors block">
                                {booking.name}
                              </h3>
                              <p className="text-3xs text-gray-500 font-mono flex items-center gap-1.5 mt-1">
                                <Calendar className="w-3 h-3" /> {formattedDate}
                              </p>
                            </div>
                            {booking.service && (
                              <span className="bg-yellow-500/10 border border-gold/20 text-gold text-2xs px-2.5 py-0.5 rounded-full font-semibold uppercase shrink-0">
                                {booking.service}
                              </span>
                            )}
                          </div>

                          <div className="border-t border-white/5 my-3.5"></div>

                          {/* Contact information details */}
                          <div className="space-y-2 text-xs font-mono mb-4 text-gray-300">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-gray-500" />
                              <span className="text-gray-400">Mobile:</span>
                              <a href={`tel:${booking.phone}`} className="hover:text-white transition-colors underline decoration-dotted">
                                {booking.phone}
                              </a>
                            </div>

                            {booking.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-gray-400">Email:</span>
                                <a href={`mailto:${booking.email}`} className="hover:text-white transition-colors truncate underline decoration-dotted" title={booking.email}>
                                  {booking.email}
                                </a>
                              </div>
                            )}

                            {booking.budget && (
                              <div className="flex items-center gap-2 pt-1">
                                <DollarSign className="w-3.5 h-3.5 text-gold" />
                                <span className="text-gold font-bold">Planned Budget:</span>
                                <span className="text-yellow-400 font-bold bg-amber-500/10 px-2 py-0.5 border border-gold/15 rounded">
                                  {booking.budget}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Client details text block */}
                          <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 relative mt-3">
                            <div className="absolute top-2 right-2 text-3xs uppercase font-mono text-gray-600 flex items-center gap-1">
                              <FileText className="w-2.5 h-2.5" /> Details
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed italic pr-4 whitespace-pre-line">
                              "{booking.details || 'No details provided.'}"
                            </p>
                          </div>
                        </div>

                        {/* Order action footer controls */}
                        <div className="mt-5 pt-4 border-t border-white/5 flex gap-2">
                          <a 
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => triggerHaptic(20)}
                            className="flex-1 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 border border-emerald-500/25 hover:text-black py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <MessageSquare className="w-4 h-4 fill-current" />
                            <span>WhatsApp Client</span>
                          </a>
                          
                          <a 
                            href={`tel:${booking.phone}`}
                            onClick={() => triggerHaptic(20)}
                            className="bg-gray-900 border border-white/5 hover:bg-gray-800 text-white p-2 rounded-xl text-xs transition-colors py-2 px-3 flex items-center justify-center cursor-pointer"
                            title="Call customer directly"
                          >
                            <Phone className="w-4 h-4 text-gray-400" />
                          </a>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'portfolio' && (
            <motion.div 
              key="portfolio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Upload Section */}
              <div className="glass p-8 rounded-2xl border border-white/5 shadow-2xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-gold" /> Upload New Graphic Design
                </h2>
                
                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Project Title</label>
                    <input 
                      type="text" 
                      required 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-red-500 outline-none transition-colors text-sm" 
                      placeholder="e.g. Luxury Car Poster" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Category</label>
                    <div className="relative">
                      <select 
                        value={category} 
                        onChange={e => setCategory(e.target.value)} 
                        className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none transition-colors appearance-none text-sm pr-10 cursor-pointer"
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Banner/Image File</label>
                    <div className="relative">
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" required className="hidden" id="file-upload" />
                      <label htmlFor="file-upload" className="flex items-center justify-center w-full bg-black/60 border border-gray-800 border-dashed rounded-lg px-4 py-2.5 cursor-pointer hover:border-red-500 transition-colors h-[48px]">
                        <ImageIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-300 truncate max-w-[150px]">
                          {selectedFile ? selectedFile.name : 'Choose image'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={uploading || !selectedFile} 
                    className="w-full btn-red-3d py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-50 h-[48px] font-bold text-sm cursor-pointer"
                  >
                    {uploading ? 'Processing & Saving...' : <><Plus className="w-5 h-5 mr-1" /> Add to Portfolio</>}
                  </button>
                </form>
              </div>

              {/* Portfolio Grid list */}
              <div>
                <h2 className="text-2xl font-extrabold mb-6 flex items-center border-b border-white/5 pb-3">
                  Live Portfolio Showcase ({items.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((item) => (
                    <motion.div layout key={item.id} className="group bg-gray-950 rounded-2xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all flex flex-col justify-between shadow-lg">
                      <div className="relative aspect-[4/3] bg-black overflow-hidden select-none">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" loading="lazy" />
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded text-3xs font-bold text-gold border border-gold/15 uppercase tracking-widest leading-none">
                          {item.category}
                        </div>
                      </div>
                      
                      <div className="p-5 space-y-4">
                        {editingId === item.id ? (
                          <div className="space-y-3">
                            <input 
                              type="text" 
                              value={editTitle} 
                              onChange={e => setEditTitle(e.target.value)} 
                              className="w-full bg-black border border-gray-700 rounded px-3 py-1.5 text-xs focus:border-gold outline-none" 
                            />
                            <select 
                              value={editCategory} 
                              onChange={e => setEditCategory(e.target.value)} 
                              className="w-full bg-black border border-gray-700 rounded px-3 py-1.5 text-xs focus:border-gold outline-none cursor-pointer"
                            >
                              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <button 
                              onClick={() => saveEdit(item.id)} 
                              className="w-full bg-gold/20 text-gold hover:bg-gold/30 px-3 py-2 rounded-lg transition-colors flex items-center justify-center text-xs font-bold cursor-pointer"
                            >
                              <Check className="w-4 h-4 mr-1" /> Save Details
                            </button>
                          </div>
                        ) : (
                          <div>
                            <h3 className="font-extrabold text-white text-base truncate group-hover:text-gold transition-colors">{item.title}</h3>
                            <div className="flex gap-2 mt-4 pt-1">
                              <button 
                                onClick={() => startEdit(item)} 
                                className="flex-1 bg-white/5 hover:bg-white/10 px-3 py-2 border border-white/5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-gray-400" /> Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)} 
                                className="flex-1 bg-red-950/20 text-red-500 hover:bg-red-950/40 border border-red-500/15 px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {items.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-500 border border-dashed border-white/5 rounded-2xl bg-gray-950/40 font-mono">
                      No design assets loaded yet.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'testimonials' && (
            <motion.div 
              key="testimonials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold mb-6 flex items-center border-b border-white/5 pb-3">
                  Client Reviews & Showcase ({testimonials.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((t) => (
                    <div key={t.id} className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-gold/20 transition-all shadow-md">
                      <div>
                        {editingTestimonialId === t.id ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-3xs uppercase tracking-widest text-gray-500 font-bold block mb-1">Full Name</label>
                              <input type="text" value={editTName} onChange={e => setEditTName(e.target.value)} className="w-full bg-black border border-gray-700 rounded px-2 py-1.5 text-xs focus:border-gold outline-none text-white font-medium" />
                            </div>
                            <div>
                              <label className="text-3xs uppercase tracking-widest text-gray-500 font-bold block mb-1">Brand / Channel Name</label>
                              <input type="text" value={editTBrand} onChange={e => setEditTBrand(e.target.value)} className="w-full bg-black border border-gray-700 rounded px-2 py-1.5 text-xs focus:border-gold outline-none text-white font-medium" />
                            </div>
                            <div>
                              <label className="text-3xs uppercase tracking-widest text-gray-500 font-bold block mb-1">Rating Rating</label>
                              <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map(num => (
                                  <button key={num} type="button" onClick={() => { setEditTStars(num); triggerHaptic(15); }}>
                                    <Star className={`w-5 h-5 cursor-pointer ${num <= editTStars ? 'text-gold fill-current' : 'text-gray-600'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-3xs uppercase tracking-widest text-gray-500 font-bold block mb-1">Message</label>
                              <textarea rows={3} value={editTReview} onChange={e => setEditTReview(e.target.value)} className="w-full bg-black border border-gray-700 rounded px-2 py-1.5 text-xs focus:border-gold outline-none text-white resize-none" />
                            </div>

                            <button onClick={() => saveEditTestimonial(t.id)} className="w-full bg-gold/25 text-gold hover:bg-gold/40 px-3 py-2 rounded-lg transition-colors flex items-center justify-center text-xs font-extrabold cursor-pointer">
                              <Check className="w-4 h-4 mr-1" /> Save Review Changes
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col h-full justify-between">
                            <div>
                              <div className="flex text-gold mb-3.5">
                                {[...Array(t.stars)].map((_, i) => <Star key={i} fill="currentColor" className="w-4 h-4" />)}
                                {[...Array(5 - t.stars)].map((_, i) => <Star key={i} className="w-4 h-4 text-gray-700" />)}
                              </div>
                              <p className="text-gray-300 italic text-sm mb-5 leading-relaxed">"{t.review}"</p>
                            </div>
                            
                            <div>
                              <h4 className="font-extrabold text-white text-base tracking-tight">{t.name}</h4>
                              <p className="text-xs text-red-400 font-semibold mt-0.5 mb-5">{t.brand}</p>
                              
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => startEditTestimonial(t)} 
                                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-gray-400" /> Edit Detail
                                </button>
                                <button 
                                  onClick={() => handleDeleteTestimonial(t.id)} 
                                  className="flex-1 bg-red-950/20 text-red-500 hover:bg-red-950/40 border border-red-500/15 px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {testimonials.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-500 border border-dashed border-white/5 rounded-2xl bg-gray-950/40 font-mono">
                      No customer reviews loaded yet.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
