# KrushiKranti Frontend

> Modern agricultural marketplace platform connecting farmers, wholesalers, and consumers.

## Overview

KrushiKranti is a comprehensive e-commerce platform built with **React 19**, **TypeScript**, and **Redux Toolkit**. The application empowers farmers to sell products directly to consumers and enables bulk procurement through wholesaler integration.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | UI Framework |
| **TypeScript** | 5.9 | Type Safety |
| **Vite** | 7.x | Build Tool & Dev Server |
| **Redux Toolkit** | 2.x | State Management |
| **React Router** | 7.x | Client-side Routing |
| **Tailwind CSS** | 4.x | Styling Framework |
| **Axios** | 1.x | HTTP Client |
| **i18next** | 24.x | Internationalization |

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running on port 8080

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API URL and keys

# Start development server
npm run dev
```

Access the application at: **http://localhost:5173**

### Production Build

```bash
npm run build
npm run preview
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_RAZORPAY_KEY_ID=your-razorpay-key
VITE_WS_ENABLED=true
VITE_WS_URL=http://localhost:8080
```

---

## Features

### For Farmers
- List and manage products
- Track orders and earnings
- Real-time order notifications
- Bulk marketplace for wholesaler negotiations

### For Wholesalers
- Browse bulk products
- Negotiate deals with farmers
- Track bulk orders and shipments

### For Consumers
- Browse product catalog
- Shopping cart and checkout
- Order tracking and history
- Product reviews and ratings

### For Administrators
- User management
- Blog content management
- Platform analytics and reporting
- Order oversight and support

---

## Project Structure

```
src/
├── app/                    # Redux store configuration
├── assets/                 # Static images and fonts
├── components/             # Shared components
├── i18n/                   # Internationalization
├── layouts/                # Page layouts (Navbar, Footer)
├── modules/                # Feature modules
│   ├── auth/               # Authentication
│   ├── product/            # Product management
│   ├── cart/               # Shopping cart
│   ├── orders/             # Order management
│   ├── payment/            # Payment processing
│   ├── blog/               # Blog posts
│   ├── chat/               # Real-time messaging
│   ├── farmer/             # Farmer dashboard
│   ├── wholesaler/         # Wholesaler dashboard
│   └── admin/              # Admin dashboard
├── routes/                 # Routing configuration
├── services/               # API services
├── shared/                 # Shared utilities and hooks
└── utils/                  # Helper functions
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Documentation

For detailed documentation, see:
- **Frontend Documentation:** [DOCUMENTATION.md](./DOCUMENTATION.md)
- **API Reference:** [../API_DOCS.md](../API_DOCS.md)
- **Architecture Guide:** [../ARCHITECTURE.md](../ARCHITECTURE.md)
- **Setup Guide:** [../SETUP_GUIDE.md](../SETUP_GUIDE.md)

---

## Language Support

- English (en) - Default
- Hindi (hi)
- Marathi (mr)

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## License

Proprietary - All rights reserved

---

*For backend setup and API documentation, refer to the krushikranti-backend directory.*
