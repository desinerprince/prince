import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gsyaqfiovrksfifdzgsd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_ybXoQlIckjwtEOQdPRdYlw_GHnmibGU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Ensure data and uploads dirs exist
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DATA_FILE = path.join(process.cwd(), 'data.json');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initialize simple JSON DB
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ items: [], testimonials: [] }));
}

const JWT_SECRET = process.env.JWT_SECRET || 'designer-gautam-super-secret-key-321';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gautam123'; // Default for portfolio

const DEFAULT_TESTIMONIALS = [
  { id: 't1', name: "Rahul Verma", brand: "TechyRahul", review: "Gautam completely transformed my YouTube channel. CTR went from 4% to 11% in a week!", stars: 5, createdAt: new Date().toISOString() },
  { id: 't2', name: "Sneha Designs", brand: "Sneha Boutique", review: "The luxury branding package was exactly what my business needed. Pure premium quality.", stars: 5, createdAt: new Date().toISOString() },
  { id: 't3', name: "Amit Singh", brand: "Fitness Pro", review: "Next level poster designs. He understands the exact vibe needed for fitness campaigns.", stars: 5, createdAt: new Date().toISOString() }
];

// Multer setup for local uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(UPLOADS_DIR));

  // --- API Routes ---

  // Auth Middleware
  const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      jwt.verify(token, JWT_SECRET);
      next();
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Login
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDb();

    if (db.adminUser) {
      // Admin account is configured, validate against custom credentials
      if (username && username.trim().toLowerCase() === db.adminUser.username.toLowerCase() && password === db.adminUser.password) {
        const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' });
        res.cookie('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        return res.json({ success: true });
      } else {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
    } else {
      // Fallback: If no custom admin has been registered in the database yet:
      if (password === ADMIN_PASSWORD) {
        const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' });
        res.cookie('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        return res.json({ success: true });
      }
      return res.status(401).json({ error: 'Please set up your admin account first, or enter the correct fallback password.' });
    }
  });

  // Admin Setup Status (Check if user has registered an admin account)
  app.get('/api/admin/setup-status', (req, res) => {
    const db = readDb();
    res.json({ isConfigured: !!db.adminUser });
  });

  // Register Admin Account (Single-slot setup)
  app.post('/api/admin/setup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = readDb();
    if (db.adminUser) {
      return res.status(403).json({ error: 'Admin account has already been registered! The registration slot is closed.' });
    }

    db.adminUser = { username, password, createdAt: new Date().toISOString() };
    writeDb(db);

    res.json({ success: true, message: 'Admin account created successfully! Nobody else can register now.' });
  });

  // Logout
  app.post('/api/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
  });

  // Check auth status
  app.get('/api/auth/status', (req, res) => {
    try {
      const token = req.cookies.admin_token;
      if (!token) return res.json({ authenticated: false });
      jwt.verify(token, JWT_SECRET);
      res.json({ authenticated: true });
    } catch {
      res.json({ authenticated: false });
    }
  });

  // Helper to read DB
  const readDb = () => {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    if (!raw.items) raw.items = [];
    if (!raw.testimonials || raw.testimonials.length === 0) {
      raw.testimonials = [...DEFAULT_TESTIMONIALS];
    }
    if (!raw.adminUser) {
      raw.adminUser = {
        username: "DESINERGAUTAM",
        password: "PRINCE@123",
        createdAt: new Date().toISOString()
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(raw, null, 2));
    }
    return raw;
  };
  const writeDb = (data: any) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  // Get portfolio items (Public)
  app.get('/api/portfolio', (req, res) => {
    const db = readDb();
    res.json(db.items);
  });

  // Add portfolio item (Admin)
  app.post('/api/portfolio', authenticate, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Image is required' });
    
    const { title, category } = req.body;
    const db = readDb();
    
    const newItem = {
      id: Date.now().toString(),
      title: title || 'Untitled',
      category: category || 'Other',
      imageUrl: `/uploads/${req.file.filename}`,
      createdAt: new Date().toISOString()
    };
    
    db.items.unshift(newItem); // Add to front
    writeDb(db);
    
    res.json(newItem);
  });

  // Delete portfolio item (Admin)
  app.delete('/api/portfolio/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const itemIndex = db.items.findIndex((i: any) => i.id === id);
    
    if (itemIndex > -1) {
      const item = db.items[itemIndex];
      // Try to remove file
      try {
        const filePath = path.join(process.cwd(), item.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        console.error('File deletion error', e);
      }
      
      db.items.splice(itemIndex, 1);
      writeDb(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  });

  // Update item (Title/Category) (Admin)
  app.put('/api/portfolio/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const { title, category } = req.body;
    const db = readDb();
    
    const itemIndex = db.items.findIndex((i: any) => i.id === id);
    if (itemIndex > -1) {
      if (title) db.items[itemIndex].title = title;
      if (category) db.items[itemIndex].category = category;
      writeDb(db);
      res.json(db.items[itemIndex]);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  });

  // --- Testimonials API ---
  app.get('/api/testimonials', (req, res) => {
    const db = readDb();
    res.json(db.testimonials);
  });

  app.post('/api/testimonials', (req, res) => {
    const { name, brand, review, stars } = req.body;
    if (!name || !review) {
      return res.status(400).json({ error: 'Name and Review description are required' });
    }
    const safeStars = Math.max(1, Math.min(5, Number(stars) || 5));
    const db = readDb();

    const newTestimonial = {
      id: 't_' + Date.now().toString() + '_' + Math.floor(Math.random() * 1000),
      name,
      brand: brand || 'Client',
      review,
      stars: safeStars,
      createdAt: new Date().toISOString()
    };

    db.testimonials.unshift(newTestimonial);
    writeDb(db);
    res.json(newTestimonial);
  });

  app.put('/api/testimonials/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const { name, brand, review, stars } = req.body;
    const db = readDb();

    const testIndex = db.testimonials.findIndex((t: any) => t.id === id);
    if (testIndex > -1) {
      if (name !== undefined) db.testimonials[testIndex].name = name;
      if (brand !== undefined) db.testimonials[testIndex].brand = brand;
      if (review !== undefined) db.testimonials[testIndex].review = review;
      if (stars !== undefined) db.testimonials[testIndex].stars = Math.max(1, Math.min(5, Number(stars) || 5));
      writeDb(db);
      res.json(db.testimonials[testIndex]);
    } else {
      res.status(404).json({ error: 'Testimonial not found' });
    }
  });

  app.delete('/api/testimonials/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const testIndex = db.testimonials.findIndex((t: any) => t.id === id);
    if (testIndex > -1) {
      db.testimonials.splice(testIndex, 1);
      writeDb(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Testimonial not found' });
    }
  });

  // --- Supabase Bookings API ---
  app.post('/api/bookings', async (req, res) => {
    try {
      const { name, phone, email, service, budget, details } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: 'Name and Phone number are required' });
      }

      const payload = {
        name,
        phone,
        email: email || '',
        service: service || '',
        budget: budget || '',
        details: details || '',
        created_at: new Date().toISOString()
      };

      // Try 'bookings' table first
      const { data, error } = await supabase
        .from('bookings')
        .insert([payload])
        .select();

      if (error) {
        console.error('Supabase: Insert to "bookings" failed. Trying "appointments"... Error:', error.message);
        const { data: appData, error: appError } = await supabase
          .from('appointments')
          .insert([payload])
          .select();
        
        if (appError) {
          console.error('Supabase: Insert to "appointments" failed. Trying "inquiries"... Error:', appError.message);
          const { data: inqData, error: inqError } = await supabase
            .from('inquiries')
            .insert([payload])
            .select();

          if (inqError) {
            console.error('Supabase: All standard table inserts failed!', inqError.message);
            throw new Error(`Failed to insert into any standard Supabase table (bookings, appointments, inquiries). Error: ${inqError.message}`);
          }
          return res.json({ success: true, table: 'inquiries', data: inqData });
        }
        return res.json({ success: true, table: 'appointments', data: appData });
      }

      res.json({ success: true, table: 'bookings', data });
    } catch (err: any) {
      console.error('Error in /api/bookings:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  // Get all bookings from Supabase (Admin Authenticated)
  app.get('/api/admin/bookings', authenticate, async (req, res) => {
    try {
      // Try 'bookings' table first
      const { data, error } = await supabase
        .from('bookings')
        .select('*');

      if (error) {
        console.warn('Supabase Fetch bookings failed. Testing appointments... Error:', error.message);
        const { data: appData, error: appError } = await supabase
          .from('appointments')
          .select('*');

        if (appError) {
          console.warn('Supabase Fetch appointments failed. Testing inquiries... Error:', appError.message);
          const { data: inqData, error: inqError } = await supabase
            .from('inquiries')
            .select('*');

          if (inqError) {
            console.error('Supabase Fetch all tables failed:', inqError.message);
            throw new Error('Could not find bookings, appointments, or inquiries tables in Supabase.');
          }
          
          // Sort manually in case they don't have default orderings
          const sortedInq = (inqData || []).sort((a: any, b: any) => 
            new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime()
          );
          return res.json({ bookings: sortedInq });
        }
        
        const sortedApp = (appData || []).sort((a: any, b: any) => 
          new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime()
        );
        return res.json({ bookings: sortedApp });
      }
      
      const sortedBook = (data || []).sort((a: any, b: any) => 
        new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime()
      );
      res.json({ bookings: sortedBook });
    } catch (err: any) {
      console.error('Error fetching admin bookings:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });


  // Vite middleware for development (must be after APIs)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
 