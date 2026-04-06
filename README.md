# 🏛 PropFinder — India's Premier Real Estate Platform

A production-ready full-stack MERN application with English luxury design, Cloudinary image uploads, OTP-based authentication, and complete role-based access control.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Gmail account (for email features)
- Cloudinary account (for image uploads)

### 1. Install Dependencies
```bash
# From project root
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials (see guide below)
```

### 3. Seed Database
```bash
cd backend
npm run seed
```

### 4. Run Development Servers
```bash
# From project root — runs both servers simultaneously
npm run dev

# OR separately:
# Terminal 1 (Backend — port 5001)
cd backend && npm run dev

# Terminal 2 (Frontend — port 3000)
cd frontend && npm start
```

Open: **http://localhost:3000**

---

## 🔑 Demo Login Credentials

| Role    | Email                        | Password    |
|---------|------------------------------|-------------|
| 👑 Admin   | admin@realestate.com      | admin123    |
| 🏠 Owner   | owner@realestate.com      | owner123    |
| 🤝 Agent   | agent@realestate.com      | agent123    |
| 🛒 Buyer   | buyer@realestate.com      | buyer123    |
| 🎫 Support | support@realestate.com    | support123  |

> **Tip:** Click the demo buttons on the Login page for instant access.

---

## ⚙️ Environment Configuration

Edit `backend/.env`:

### MongoDB
```env
# Local
MONGO_URI=mongodb://localhost:27017/realestate

# MongoDB Atlas (production)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/realestate
```

### JWT (Security)
```env
# Generate a strong secret:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_64_char_random_string_here
JWT_EXPIRE=30d
```

### Cloudinary (Image Uploads)
```env
# Sign up free at https://cloudinary.com
# Dashboard → copy credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Gmail (Emails)
```env
# 1. Enable 2-Step Verification on Gmail
# 2. Go to: myaccount.google.com → Security → App passwords
# 3. Create app password → copy 16-char code (no spaces)
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM_NAME=PropFinder
EMAIL_FROM_ADDRESS=your_gmail@gmail.com
```

---

## 🌐 Deploying to Production

### Option A — Render (Recommended, Free)

**Backend:**
1. Create account at render.com
2. New → Web Service → Connect your GitHub repo
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add all environment variables from `.env`
7. Set `NODE_ENV=production`

**Frontend:**
1. New → Static Site → Connect repo
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Publish Directory: `build`
5. Add env var: `REACT_APP_API_URL=https://your-backend.onrender.com/api`

### Option B — Railway

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option C — Heroku (Full-stack on one dyno)

```bash
heroku create propfinder-app
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_atlas_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set CLIENT_URL=https://propfinder-app.herokuapp.com
# ... set all other env vars
git push heroku main
```

### Option D — VPS (Ubuntu)

```bash
# Install Node.js, Nginx, PM2
sudo apt update && sudo apt install -y nodejs npm nginx
npm install -g pm2

# Clone repo, install, build
cd /var/www && git clone <repo-url> propfinder
cd propfinder && npm run install-all
cd frontend && npm run build

# Configure backend
cd ../backend && cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start server.js --name propfinder-api
pm2 startup && pm2 save

# Nginx config
sudo nano /etc/nginx/sites-available/propfinder
# Point / to /var/www/propfinder/frontend/build
# Point /api to localhost:5001
```

---

## 📁 Project Structure

```
propfinder/
├── backend/
│   ├── config/
│   │   ├── db.js              ← MongoDB connection
│   │   ├── cloudinary.js      ← Cloudinary v2 setup
│   │   └── email.js           ← Nodemailer templates
│   ├── controllers/
│   │   ├── authController.js  ← Register, login, OTP, profile
│   │   ├── propertyController.js ← Full CRUD + Cloudinary
│   │   ├── inquiryController.js  ← Buyer→Owner inquiry flow
│   │   └── otherControllers.js   ← Visits, favorites, payments, support, admin
│   ├── middleware/
│   │   ├── auth.js            ← JWT protect + role authorize
│   │   ├── upload.js          ← Multer memory → Cloudinary stream
│   │   └── errorHandler.js    ← Global error handler
│   ├── models/                ← 9 Mongoose models (User, Property, Inquiry, Visit, Favorite, Review, Payment, SupportTicket)
│   ├── routes/                ← auth, properties, other
│   ├── utils/
│   │   ├── generateToken.js   ← JWT helper
│   │   └── seeder.js          ← Demo data seeder
│   ├── server.js              ← Express entry point (production-ready)
│   └── .env                   ← Your config (never commit!)
│
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/        ← Navbar, Footer, DashboardLayout
        │   └── property/      ← PropertyCard, SearchFilter
        ├── context/           ← AuthContext (5 roles)
        ├── pages/
        │   ├── Home.js        ← Hero, featured, cities, steps, CTA
        │   ├── Properties.js  ← Grid + filters + pagination + skeleton
        │   ├── PropertyDetail.js ← Gallery, tabs, EMI calc, inquiries
        │   ├── About.js       ← Full company about page
        │   ├── Auth.js        ← 2-step signup + 3-step OTP forgot pass
        │   ├── dashboard/
        │   │   ├── DashboardPages.js ← Overview, Inquiries, Visits, Payments, Support
        │   │   ├── ListProperty.js   ← 4-step wizard + drag-drop images
        │   │   └── OwnerPages.js     ← Listings, Visits, Inquiries, Profile
        │   └── admin/
        │       └── AdminPanel.js     ← Stats, approvals, users, tickets
        └── utils/
            ├── api.js         ← Axios with FormData, all endpoints
            └── helpers.js     ← Formatters, constants
```

---

## 🎯 Features

### Public
- Property search with filters (city, type, price, beds, furnishing)
- Sort by newest, price, area, views
- Property detail with image gallery, EMI calculator, reviews
- Share property via Web Share API
- About page with team, values, stats

### Buyer (BUYER role)
- Save/unsave favourite properties
- Send inquiries to owners/agents
- Schedule property visits
- Track all inquiries and visits
- Make payments
- Submit reviews and ratings
- Create support tickets
- OTP-based forgot password

### Owner (OWNER role)
- List properties with drag-drop image upload (Cloudinary)
- 4-step guided listing wizard
- Mark properties as Available / Sold / Rented
- View and manage received inquiries
- Approve or reject visit requests
- Track property performance (views, inquiries)

### Agent (AGENT role)
- All Owner capabilities
- Can post properties on behalf of clients
- Manages inquiries for assigned properties

### Admin (ADMIN role)
- Full platform statistics dashboard
- Approve / reject property listings with card preview
- Toggle featured status per property
- Block / activate user accounts
- Filter users by role
- Respond to support tickets
- View all transactions

### Support (SUPPORT role)
- View and respond to all support tickets
- View all inquiries

---

## 🔒 Security Features

- JWT authentication with 30-day expiry
- Password hashing with bcrypt (12 rounds)
- OTP stored as SHA-256 hash (never plain text)
- Rate limiting on API and OTP endpoints
- Helmet.js security headers
- CORS with whitelist
- Brute-force protection on OTP (5 attempts → invalidate)
- Role-based authorization on all routes
- Owner can't inquire on own property
- Review owner can't review own property

---

## 🖼 Image Handling

- **Profile pictures:** Auto-cropped to 400×400, face detection
- **Property images:** Resized to 1200×800, quality optimized
- **Format:** Auto WebP/AVIF via Cloudinary `fetch_format: auto`
- **Cleanup:** Old images deleted from Cloudinary on update/delete
- **Storage:** Cloudinary `public_id` stored for clean deletion
- **No blur:** Uses CSS `isolation: isolate` — no `backface-visibility` or `image-rendering` overrides

---

## 📧 Email Features

| Trigger | Email Sent |
|---------|-----------|
| User registers | Welcome email with role-specific features |
| Forgot password | OTP email (valid 10 mins) |
| Password reset/changed | Security confirmation email |
| Staff account created | Welcome email |

---

*Built with ❤️ — MERN Stack + Cloudinary + Nodemailer*
