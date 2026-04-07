# 🏛 PropFinder — India's Premier Real Estate Platform

A production-ready full-stack MERN application with English luxury design, Cloudinary image uploads, OTP-based authentication, and complete role-based access control.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Gmail account (for email features)
- Cloudinary account (for image uploads)

Open: **http://localhost:3000**

---
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
