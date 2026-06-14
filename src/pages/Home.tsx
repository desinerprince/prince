import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Instagram, Phone, X, CheckCircle, ArrowRight, Star, ExternalLink, Image as ImageIcon, Video, Layers, PenTool, LayoutTemplate, Globe } from 'lucide-react';
import { CATEGORIES, PortfolioItem, Testimonial } from '../types';

export default function Home() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  // Testimonials Dynamic States
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tName, setTName] = useState('');
  const [tBrand, setTBrand] = useState('');
  const [tReview, setTReview] = useState('');
  const [tStars, setTStars] = useState(5);
  const [tMessage, setTMessage] = useState('');
  const [tSubmitting, setTSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: 'Thumbnail Design', budget: '', details: '' });
  const [showThanks, setShowThanks] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(() => console.error("Could not load portfolio"));

    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(() => console.error("Could not load testimonials"));
  }, []);

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    if (!tName || !tReview) return;
    setTSubmitting(true);
    setTMessage('');

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tName, brand: tBrand, review: tReview, stars: tStars })
      });
      if (res.ok) {
        const newT = await res.json();
        setTestimonials(prev => [newT, ...prev]);
        setTName('');
        setTBrand('');
        setTReview('');
        setTStars(5);
        setTMessage('Thank you! Your premium review has been posted successfully. ❤️');
      } else {
        setTMessage('Failed to submit review. Try again.');
      }
    } catch {
      setTMessage('Error submitting review');
    } finally {
      setTSubmitting(false);
    }
  };

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    setBookingStatus('submitting');
    setBookingMessage('Saving inquiry to Supabase...');
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        setBookingStatus('success');
        setBookingMessage(`Woohoo! Inquiry saved in Supabase "${result.table}"! Connecting to WhatsApp...`);
      } else {
        setBookingStatus('error');
        setBookingMessage(`Notice: Sync issue (${result.error || 'Server error'}). Redirecting to WhatsApp...`);
      }
    } catch (err: any) {
      console.error('Failed to sync with Supabase:', err);
      setBookingStatus('error');
      setBookingMessage('Warning: Offline sync failed. Connecting directly to WhatsApp...');
    }

    // Always fallback to opening WhatsApp to guarantee the message is sent!
    setTimeout(() => {
      const text = `*New Inquiry from Portfolio*\n\n*Name:* ${form.name}\n*Number:* ${form.phone}\n*Email:* ${form.email}\n*Service:* ${form.service}\n*Budget:* ${form.budget}\n*Details:* ${form.details}`;
      const encodedText = encodeURIComponent(text);
      window.open(`https://wa.me/917985816408?text=${encodedText}`, '_blank');
      
      // Clear form
      setForm({ name: '', phone: '', email: '', service: 'Thumbnail Design', budget: '', details: '' });
      
      // Reset status message after a few seconds
      setTimeout(() => {
        setBookingStatus('idle');
        setBookingMessage('');
      }, 6000);
    }, 1800);
  };

  const filteredItems = activeCategory === 'All' ? items : items.filter(item => item.category === activeCategory);

  return (
    <div className="bg-black text-white min-h-screen selection:bg-red-500/30 luxury-red-mesh relative">
      
      {/* Background Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] left-[5%] w-[60vw] h-[60vw] max-w-[800px] orb-red rounded-full opacity-60 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] orb-gold rounded-full opacity-35 animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[55vw] h-[55vw] max-w-[700px] orb-red rounded-full opacity-45 animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[45vw] h-[45vw] max-w-[500px] orb-white rounded-full opacity-25 animate-pulse" style={{ animationDuration: '15s' }}></div>
      </div>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/917985816408" target="_blank" rel="noreferrer" onClick={triggerHaptic} className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-[0_0_25px_rgba(34,197,94,0.6)] hover:scale-110 hover:shadow-[0_0_35px_rgba(34,197,94,0.8)] transition-all">
        <Phone className="w-6 h-6" />
      </a>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-red-luxury/30 rounded-full blur-[140px] mix-blend-screen animate-float"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-gold/15 rounded-full blur-[110px] mix-blend-screen animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxYTFhMWEiPjwvcmVjdD4KPC9zdmc+')] opacity-40 z-0"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            
            {/* Logo */}
            <motion.div 
              className="w-56 mx-auto mb-8 relative cursor-pointer group"
              whileHover={{ scale: 1.08, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => {
                if (navigator.vibrate) navigator.vibrate(20);
              }}
            >
              <div className="absolute inset-0 bg-gold rounded-full blur-[80px] opacity-30 group-hover:opacity-60 group-hover:scale-115 transition-all duration-500"></div>
              {!logoError ? (
                <img 
                  src="/logo.png" 
                  alt="Designer Gautam Logo" 
                  className="relative z-10 w-56 h-56 rounded-full aspect-square object-cover border-2 border-gold/40 shadow-[0_0_25px_rgba(212,175,55,0.4)] group-hover:shadow-[0_0_40px_rgba(212,175,55,0.7)] group-hover:border-gold/60 filter group-hover:brightness-110 transition-all duration-500" 
                  onError={() => { console.log('Logo image load error, falling back to 3D logo'); setLogoError(true); }}
                />
              ) : (
                <div className="relative z-10 glass p-6 rounded-2xl border border-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.2)] group-hover:border-gold/60 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-all duration-500">
                  <span className="text-4xl font-extrabold tracking-tight block text-gradient-gold">
                    DESIGNER
                  </span>
                  <span className="text-3xl font-light tracking-widest block text-white mt-1">
                    GAUTAM
                  </span>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mt-3"></div>
                  <span className="text-[10px] text-gray-500 tracking-[0.2em] uppercase block mt-1">Designing Ideas</span>
                </div>
              )}
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Creative Designs That <br className="hidden md:block"/> 
              <span className="text-gradient-red">Grow Your Brand</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Professional YouTube Thumbnails, Instagram Posts, Posters, Campaign Designs & Branding Solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => { triggerHaptic(); document.getElementById('portfolio')?.scrollIntoView({behavior:'smooth'}); }} className="w-full sm:w-auto btn-gold-3d px-8 py-4 rounded-full font-bold text-lg tracking-wide flex items-center justify-center">
                View Portfolio
              </button>
              <button onClick={() => { triggerHaptic(); document.getElementById('contact')?.scrollIntoView({behavior:'smooth'}); }} className="w-full sm:w-auto btn-red-3d px-8 py-4 rounded-full font-bold text-lg tracking-wide flex items-center justify-center">
                Contact Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-black relative z-10 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-gradient-gold font-bold mb-4">Premium Services</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard 
              icon={<Play className="w-8 h-8 text-red-500" />} 
              title="YouTube Thumbnails" 
              price="₹99"
              priceLabel="99/- Offer"
              features={['High CTR Designs', 'Gaming Thumbnails', 'Educational videos', 'AI-styled thumbnails']}
            />
            <ServiceCard 
              icon={<Instagram className="w-8 h-8 text-pink-500" />} 
              title="Instagram Post Design" 
              price="₹99"
              priceLabel="99/- Offer"
              features={['Business Posts', 'Promotional Creatives', 'Festival Wishes', 'Grid Branding']}
            />
            <ServiceCard 
              icon={<LayoutTemplate className="w-8 h-8 text-gold" />} 
              title="Poster Design" 
              price="₹99"
              priceLabel="99/- Offer"
              features={['Event Posters', 'Business Ads', 'Political Campaigns', 'Movie Posters']}
            />
            <ServiceCard 
              icon={<Layers className="w-8 h-8 text-blue-500" />} 
              title="Campaign Design" 
              price="₹99"
              priceLabel="99/- Offer"
              features={['Complete Branding', 'Multi-platform Ads', 'Visual Strategy', 'Ad Creatives']}
            />
            <ServiceCard 
              icon={<PenTool className="w-8 h-8 text-white" />} 
              title="Logo Design" 
              price="₹99"
              priceLabel="99/- Offer"
              features={['Modern Minimalist', 'Luxury Monograms', 'Corporate Branding', 'Vector Art']}
            />
            <ServiceCard 
              icon={<Globe className="w-8 h-8 text-emerald-400" />} 
              title="Website Building" 
              features={['Premium Website', 'Animated Website', 'Hosting', 'SEO']}
            />
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24 bg-charcoal relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-4">Selected <span className="text-red-500">Works</span></h2>
              <p className="text-gray-400">Browse through my latest premium creations.</p>
            </div>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mt-6 md:mt-0">
              {['All', ...CATEGORIES].map(cat => (
                <button 
                  key={cat} onClick={() => { setActiveCategory(cat); triggerHaptic(); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredItems.map(item => (
                <motion.div 
                  layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
                  key={item.id} 
                  className="group relative aspect-[4/5] sm:aspect-square overflow-hidden rounded-2xl cursor-pointer shadow-2xl border border-white/5"
                  onClick={() => { setLightboxImage(item.imageUrl); triggerHaptic(); }}
                >
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <span className="text-red-500 text-sm font-bold tracking-widest uppercase mb-1">{item.category}</span>
                    <h3 className="text-white text-xl font-bold">{item.title}</h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <ImageIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No designs uploaded in this category yet.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-black relative z-10 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Client <span className="text-gold">Love</span></h2>
            <p className="text-gray-400">Read what our trusted partners say, or write your own premium review!</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Reviews display grid (takes 2 cols on desktop) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map(t => (
                  <div key={t.id} className="glass p-8 rounded-2xl border border-gold/10 hover:border-gold/30 transition-colors group relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-5xl font-serif text-gold">"</div>
                    <div>
                      <div className="flex text-gold mb-6">
                        {[...Array(t.stars)].map((_, i) => <Star key={i} fill="currentColor" className="w-[18px] h-[18px]" />)}
                        {[...Array(5 - t.stars)].map((_, i) => <Star key={i} className="w-[18px] h-[18px] text-gray-700" />)}
                      </div>
                      <p className="text-gray-300 mb-6 italic leading-relaxed text-sm">"{t.review}"</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{t.name}</h4>
                      <p className="text-xs text-red-500">{t.brand}</p>
                    </div>
                  </div>
                ))}
              </div>
              {testimonials.length === 0 && (
                <div className="py-12 text-center text-gray-500 border border-dashed border-gray-800 rounded-2xl">
                  No client reviews yet. Be the first to share one!
                </div>
              )}
            </div>

            {/* Write a review form (takes 1 col on desktop) */}
            <div className="glass p-8 rounded-2xl border border-red-900/30 shadow-[0_0_30px_rgba(197,0,26,0.1)] relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-800/10 rounded-full blur-2xl"></div>
              
              <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                <span className="inline-block w-2.5 h-2.5 bg-red-600 rounded-full mr-2"></span>
                Submit Your Review
              </h3>
              <p className="text-xs text-gray-400 mb-6">Let others know about the luxury design services you received.</p>
              
              <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Your Rating</label>
                  <div className="flex gap-2 bg-black/40 p-2.5 rounded-lg border border-gray-800 inline-flex">
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <button
                        type="button"
                        key={starNum}
                        onClick={() => { setTStars(starNum); triggerHaptic(); }}
                        className="transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      >
                        <Star 
                          className={`w-6 h-6 ${starNum <= tStars ? 'text-gold fill-current drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]' : 'text-gray-700'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1 font-semibold">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Gaurav Kumar" 
                    value={tName} 
                    onChange={e => setTName(e.target.value)} 
                    className="w-full bg-black/70 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-red-500 outline-none transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1 font-semibold">Your Brand / Business (optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Gaming YouTuber / Tech CEO" 
                    value={tBrand} 
                    onChange={e => setTBrand(e.target.value)} 
                    className="w-full bg-black/70 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-red-500 outline-none transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1 font-semibold">Review Message</label>
                  <textarea 
                    required 
                    rows={3}
                    placeholder="Write your experience with Gautam..." 
                    value={tReview} 
                    onChange={e => setTReview(e.target.value)} 
                    className="w-full bg-black/70 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-red-500 outline-none transition-colors resize-none" 
                  />
                </div>

                {tMessage && (
                  <div className="text-xs text-center py-2 px-3 rounded bg-red-950/20 text-gold border border-gold/10">
                    {tMessage}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={tSubmitting}
                  className="w-full btn-red-3d py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all disabled:opacity-50 cursor-pointer"
                >
                  {tSubmitting ? 'Posting...' : 'Post Review'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-charcoal relative z-10 border-t border-red-900/30">
        <div className="absolute inset-0 bg-red-luxury/5 mix-blend-screen pointer-events-none"></div>
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16">
            
            {/* Form */}
            <div className="flex-1 glass p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-3xl"></div>
              <h3 className="text-2xl font-bold mb-6">Start a Project</h3>
              <form onSubmit={handleWhatsAppSubmit} className="space-y-4 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required placeholder="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-gold outline-none transition-colors" />
                  <input required type="tel" placeholder="Mobile Number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-gold outline-none transition-colors" />
                </div>
                <input required type="email" placeholder="Email Address" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-gold outline-none transition-colors" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select value={form.service} onChange={e=>setForm({...form,service:e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-gray-300 focus:border-gold outline-none transition-colors appearance-none">
                    <option>Thumbnail Design</option>
                    <option>Instagram Post Design</option>
                    <option>Poster Design</option>
                    <option>Campaign Design</option>
                    <option>Logo Design</option>
                    <option>Website Building</option>
                    <option>Other</option>
                  </select>
                  <input placeholder="Budget (Optional)" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-gold outline-none transition-colors" />
                </div>
                <textarea required placeholder="Project Details..." rows={4} value={form.details} onChange={e=>setForm({...form,details:e.target.value})} className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-gold outline-none transition-colors resize-none"></textarea>
                <button 
                  type="submit" 
                  disabled={bookingStatus === 'submitting'}
                  className="w-full btn-gold-3d py-4 rounded-lg font-bold text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {bookingStatus === 'submitting' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      Saving & Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Send via WhatsApp <ArrowRight className="ml-2 w-5 h-5" />
                    </span>
                  )}
                </button>

                {bookingMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg text-sm text-center font-medium border ${
                      bookingStatus === 'success' 
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                        : bookingStatus === 'error'
                        ? 'bg-yellow-950/30 border-yellow-500/30 text-yellow-500'
                        : 'bg-white/5 border-white/10 text-gray-300'
                    }`}
                  >
                    {bookingMessage}
                  </motion.div>
                )}
              </form>
            </div>

            {/* Info */}
            <div className="lg:w-[400px] flex flex-col justify-center space-y-8">
              <div>
                <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2">Designer Gautam</h3>
                <p className="text-gray-400">Designing Ideas, Creating Impact. Elevate your brand with premium visual aesthetics.</p>
              </div>
              
              <div className="space-y-4">
                <a href="tel:7985816408" onClick={triggerHaptic} className="flex items-center p-4 glass rounded-xl border border-white/5 hover:border-gold/50 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mr-4 group-hover:bg-gold/20 transition-colors">
                    <Phone className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Call Now</p>
                    <p className="font-bold text-lg tracking-wider">+91 7985816408</p>
                  </div>
                </a>
                
                <a href="https://instagram.com/desinergautam" target="_blank" rel="noreferrer" onClick={triggerHaptic} className="flex items-center p-4 glass rounded-xl border border-white/5 hover:border-red-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mr-4 group-hover:bg-red-500/20 transition-colors">
                    <Instagram className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Instagram</p>
                    <p className="font-bold text-lg">@desinergautam</p>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/10 text-center relative z-10">
        <div className="container mx-auto px-6">
           <div className="relative inline-block">
             <motion.div 
               className="w-32 mx-auto mb-6 relative cursor-pointer group"
               whileHover={{ scale: 1.1, rotate: -2 }}
               whileTap={{ scale: 0.95 }}
               onHoverStart={() => {
                 setShowThanks(true);
                 if (navigator.vibrate) navigator.vibrate(20);
               }}
               onHoverEnd={() => {
                 setShowThanks(false);
               }}
               onClick={() => {
                 setShowThanks(true);
                 if (navigator.vibrate) navigator.vibrate(50);
                 const timeoutId = (window as any).__thankYouTimeout;
                 if (timeoutId) clearTimeout(timeoutId);
                 (window as any).__thankYouTimeout = setTimeout(() => {
                   setShowThanks(false);
                 }, 3000);
               }}
             >
                <div className="absolute inset-0 bg-gold rounded-full blur-[40px] opacity-10 group-hover:opacity-40 group-hover:scale-125 transition-all duration-500"></div>
                {!logoError ? (
                  <img src="/logo.png" alt="Designer Gautam Logo" className="w-full h-auto relative z-10 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(212,175,55,0.7)] transition-all duration-500" />
                ) : (
                  <span className="text-xl font-bold tracking-widest text-gradient-gold block transition-transform group-hover:scale-105">DESIGNER GAUTAM</span>
                )}
             </motion.div>

             <AnimatePresence>
               {showThanks && (
                 <motion.div
                   initial={{ scale: 0, opacity: 0, y: 15, x: "-50%" }}
                   animate={{ scale: 1, opacity: 1, y: -15, x: "-50%" }}
                   exit={{ scale: 0, opacity: 0, y: 15, x: "-50%" }}
                   transition={{ type: "spring", stiffness: 350, damping: 20 }}
                   className="absolute -top-12 left-1/2 bg-gradient-to-r from-yellow-500 via-amber-500 to-gold text-black px-5 py-2 rounded-full shadow-[0_0_25px_rgba(212,175,55,0.6)] border border-gold/40 font-semibold text-xs whitespace-nowrap z-30 pointer-events-none flex items-center gap-1.5"
                 >
                   ✨ Thank You For Visiting! ✨
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
          <p className="text-gray-400 font-serif italic mb-6 text-lg">"Designing Ideas, Creating Impact"</p>
          <div className="flex justify-center items-center space-x-6 mb-8 flex-wrap gap-y-2">
            <a href="#services" onClick={triggerHaptic} className="text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Services</a>
            <a href="#portfolio" onClick={triggerHaptic} className="text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Portfolio</a>
            <a href="#contact" onClick={triggerHaptic} className="text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Contact</a>
            <span className="text-gray-800">|</span>
            <Link to="/login" onClick={triggerHaptic} className="text-sm text-gray-500 hover:text-gold transition-all uppercase tracking-widest font-semibold flex items-center gap-1">
              🔐 Admin Login
            </Link>
          </div>
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Designer Gautam. All luxury rights reserved.</p>
        </div>
      </footer>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
            onClick={() => { setLightboxImage(null); triggerHaptic(); }}
          >
            <button className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 p-2 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxImage} alt="Portfolio Fullscreen" className="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_50px_rgba(255,255,255,0.1)]" 
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}

function ServiceCard({ icon, title, features, price, priceLabel }: { icon: React.ReactNode, title: string, features: string[], price?: string, priceLabel?: string }) {
  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(35);
  };
  return (
    <div onClick={triggerHaptic} className="glass hover:glass-red p-8 rounded-2xl transition-all duration-500 group transform hover:-translate-y-2 cursor-pointer flex flex-col justify-between relative overflow-hidden min-h-[360px]">
      {price && priceLabel && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-red-700 to-rose-700 border border-red-500/50 text-white text-[9px] font-extrabold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-pulse">
          {priceLabel}
        </div>
      )}
      <div>
        <div className="w-16 h-16 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-6 group-hover:border-red-500/50 transition-colors shadow-lg">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-red-400 transition-colors">{title}</h3>
        <ul className="space-y-3 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-center text-gray-400">
              <CheckCircle className="w-4 h-4 mr-3 text-gold opacity-70" />
              <span className="text-sm">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {price ? (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">1st Time Offer</span>
          <div className="text-right">
            <span className="text-gray-500 line-through text-xs mr-2">₹499</span>
            <span className="text-gradient-gold font-extrabold text-2xl drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">{price}</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live Project
          </span>
          <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-wider">Premium Rate</span>
        </div>
      )}
    </div>
  )
}
