# KrushiKranti Frontend Documentation

## 📋 Overview

KrushiKranti is an agricultural marketplace platform built with **React 19**, **TypeScript**, and **Redux Toolkit**. The frontend provides a modern, responsive UI for farmers, wholesalers, and consumers.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | UI Framework |
| **TypeScript** | 5.x | Type Safety |
| **Vite** | 6.x | Build Tool & Dev Server |
| **Redux Toolkit** | 2.x | State Management |
| **React Router** | 7.x | Client-side Routing |
| **Tailwind CSS** | 4.x | Styling Framework |
| **Axios** | 1.x | HTTP Client |
| **React Hook Form** | 7.x | Form Handling |
| **Zod** | 3.x | Schema Validation |
| **i18next** | 24.x | Internationalization |
| **Lucide React** | - | Icon Library |
| **React Hot Toast** | - | Notifications |
| **@react-oauth/google** | - | Google OAuth |

---

## 📁 Project Structure

```
krushikranti-frontend/
├── package.json                 # Dependencies & scripts
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
├── index.html                   # HTML entry point
├── .env                         # Environment variables
│
├── public/                      # Static assets
│   └── vite.svg
│
└── src/
    ├── main.tsx                 # React entry point
    ├── App.tsx                  # Root component
    ├── index.css                # Global styles + Tailwind
    │
    ├── app/                     # Redux store setup
    │   ├── store.ts             # Store configuration
    │   ├── selectors.ts         # Shared selectors
    │   └── uiSlice.ts           # UI state (theme, sidebar)
    │
    ├── assets/                  # Images, fonts
    │
    ├── i18n/                    # Internationalization
    │   ├── config.ts            # i18next setup
    │   └── locales/
    │       ├── en.json          # English translations
    │       ├── hi.json          # Hindi translations
    │       └── mr.json          # Marathi translations
    │
    ├── layouts/                 # Page layouts
    │   ├── MainLayout.tsx       # Public pages layout
    │   ├── AdminLayout.tsx      # Admin dashboard layout
    │   ├── FarmerLayout.tsx     # Farmer dashboard layout
    │   ├── UserLayout.tsx       # User dashboard layout
    │   ├── WholesalerLayout.tsx # Wholesaler dashboard layout
    │   ├── BaseDashboardLayout.tsx # Base dashboard
    │   ├── Navbar.tsx           # Navigation bar
    │   ├── Footer.tsx           # Footer component
    │   └── components/
    │       ├── NotificationDropdown.tsx
    │       └── UserMenu.tsx
    │
    ├── modules/                 # Feature modules
    │   ├── auth/                # Authentication
    │   ├── product/             # Product management
    │   ├── orders/              # Order management
    │   ├── cart/                # Shopping cart
    │   ├── wishlist/            # Wishlist
    │   ├── payment/             # Payment processing
    │   ├── chat/                # Real-time chat
    │   ├── blog/                # Blog posts
    │   ├── notifications/       # Notifications
    │   ├── admin/               # Admin features
    │   ├── farmer/              # Farmer features
    │   ├── wholesaler/          # Wholesaler features
    │   └── user/                # User profile
    │
    ├── routes/                  # Routing configuration
    │   ├── index.tsx            # Route definitions
    │   └── pages/               # Route-level pages
    │
    ├── services/                # API services
    │   ├── api.ts               # Axios instance
    │   ├── PaymentService.ts    # Razorpay integration
    │   ├── UploadService.ts     # Image uploads
    │   ├── socketService.ts     # WebSocket connection
    │   └── index.ts             # Service exports
    │
    └── shared/                  # Shared utilities
        ├── api.ts               # Shared API helpers
        ├── icons.ts             # Icon exports
        ├── components/          # Reusable components
        │   ├── ImageUpload.tsx  # Image upload component
        │   └── ...
        ├── hooks/               # Custom hooks
        │   ├── index.ts         # useAppDispatch, useAppSelector
        │   └── useImageUpload.ts
        ├── ui/                  # UI components
        └── utils/               # Utility functions
```

---

## 🏗️ Module Structure

Each feature module follows this pattern:

```
modules/auth/
├── index.ts           # Public exports
├── types.ts           # TypeScript types/interfaces
├── authSlice.ts       # Redux slice (state + actions)
├── authService.ts     # API calls
├── components/        # Module-specific components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── GoogleLoginButton.tsx
└── pages/             # Module pages
    ├── LoginPage.tsx
    ├── RegisterPage.tsx
    └── VerifyOtpPage.tsx
```

---

## 🔐 Authentication Module

### Features
- Email/Password registration
- Email OTP verification
- Login with JWT tokens
- Google OAuth integration
- Role-based access control

### Components
| Component | Description |
|-----------|-------------|
| `LoginPage` | Email/password login form |
| `RegisterPage` | User registration with role selection |
| `VerifyOtpPage` | 6-digit OTP verification |
| `GoogleLoginButton` | Google OAuth button |

### State (authSlice)
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  registerLoading: boolean;
  otpLoading: boolean;
  otpVerified: boolean;
  pendingVerificationEmail: string | null;
}
```

### Actions
- `login` - Authenticate user
- `register` - Register new user
- `verifyOtp` - Verify email OTP
- `resendOtp` - Resend OTP
- `logout` - Clear auth state
- `googleLogin` - Google OAuth

---

## 🛒 Product Module

### Features
- Product listing with filters
- Product details page
- Farmer product management
- Category filtering
- Search functionality

### State (productSlice)
```typescript
interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  farmerProducts: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}
```

### Actions
- `fetchProducts` - Get all products
- `fetchProductById` - Get single product
- `fetchMyProducts` - Farmer's products
- `createProduct` - Add new product
- `updateProduct` - Update product
- `deleteProduct` - Remove product

---

## 📦 Orders Module

### Features
- Order placement
- Order tracking
- Order history
- Status updates (for farmers)

### Order Status Flow
```
PLACED → CONFIRMED → PROCESSING → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
                                                            ↳ CANCELLED
```

---

## 🛍️ Cart Module

### Features
- Add/remove items
- Update quantities
- Cart persistence
- Checkout flow

---

## 💳 Payment Module

### Features
- Razorpay integration
- Payment verification
- Order confirmation

### Flow
1. User clicks "Pay Now"
2. Frontend creates Razorpay order via backend
3. Razorpay modal opens
4. User completes payment
5. Frontend verifies payment with backend
6. Order confirmed

---

## 💬 Chat Module

### Features
- Real-time messaging
- Farmer ↔ Wholesaler communication
- Message history

---

## 📝 Blog Module

### Features
- Blog listing
- Blog details
- Admin blog management

---

## 🌐 Internationalization (i18n)

### Supported Languages
- English (en) - Default
- Hindi (hi)
- Marathi (mr)

### Usage
```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('auth.login')}</h1>;
}
```

---

## 🎨 Styling

### Tailwind CSS Classes
```css
/* Custom input field */
.input-field {
  @apply w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 
    border border-slate-200 dark:border-slate-700 
    rounded-lg text-sm;
}

/* Primary button */
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 
    text-white font-bold py-2 px-4 rounded-lg;
}
```

### Dark Mode
- Uses `dark:` Tailwind prefix
- Stored in `uiSlice` state
- Toggle via UI button

---

## 🔌 API Integration

### Axios Instance (`services/api.ts`)
```typescript
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
});

// JWT token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🛣️ Routes

### Public Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | HomePage | Landing page |
| `/login` | LoginPage | User login |
| `/register` | RegisterPage | User registration |
| `/verify-otp` | VerifyOtpPage | OTP verification |
| `/products` | ProductsPage | Product listing |
| `/products/:id` | ProductPage | Product details |
| `/blog` | BlogPage | Blog listing |

### Protected Routes
| Path | Component | Role |
|------|-----------|------|
| `/dashboard` | UserDashboard | USER |
| `/farmer/*` | FarmerLayout | FARMER |
| `/wholesaler/*` | WholesalerLayout | WHOLESALER |
| `/admin/*` | AdminLayout | ADMIN |

---

## 🗄️ Redux Store

### Store Configuration
```typescript
// app/store.ts
export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    orders: ordersReducer,
    ui: uiReducer,
    // ...
  }
});
```

### Custom Hooks
```typescript
// shared/hooks/index.ts
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd krushikranti-frontend
npm install
```

### Environment Variables (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Development Server
```bash
npm run dev
```
Access at: http://localhost:5173

### Production Build
```bash
npm run build
npm run preview
```

---

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

---

## 🔐 Role-Based UI

### User Roles
- **USER (Consumer)**: Browse, buy, review
- **FARMER**: Sell products, manage orders
- **WHOLESALER**: Bulk orders, chat with farmers
- **ADMIN**: Full system management

### Role Selection (Registration)
```tsx
const roleOptions = [
  { value: 'user', label: 'Consumer' },
  { value: 'farmer', label: 'Farmer' },
  { value: 'wholesaler', label: 'Wholesaler' }
];
```

---

## 🔄 State Management Patterns

### Async Thunk Pattern
```typescript
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getProducts();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Slice Pattern
```typescript
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      });
  }
});
```

---

## 🐛 Troubleshooting

### CORS Issues
Ensure backend has CORS configured for `http://localhost:5173`

### API Connection Failed
1. Check if backend is running on port 8080
2. Verify `VITE_API_BASE_URL` in `.env`
3. Restart Vite dev server after `.env` changes

### Type Errors
```bash
npm run build  # Check for TypeScript errors
```

---

## 📚 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |

---

## 🚚 Shiprocket Delivery Integration

### Overview
The platform integrates with Shiprocket for order delivery and real-time tracking.

### Features
- Automatic shipment creation on order confirmation
- Real-time delivery status updates via WebSocket
- Order tracking page with timeline visualization
- Push notifications for delivery status changes

### Order Status Flow
```
PLACED → CONFIRMED → PROCESSING → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
                                                            ↳ CANCELLED
```

### Tracking Page (`/orders/:orderId/tracking`)
- Displays order details (ID, date, status)
- Visual timeline with delivery milestones
- Status badges with color coding
- Delivery partner and AWB information

---

## 🔔 Real-Time Notification System

### Overview
WebSocket-based notification system for real-time updates across all user roles.

### Technology Stack
- **Frontend**: socket.io-client 4.8.3
- **Backend**: Spring Boot WebSocket with Socket.IO

### WebSocket Service (`services/websocketService.ts`)
```typescript
// Auto-connects when user authenticates
websocketService.connect(userId);

// Subscribes to channels based on role
websocketService.subscribeToUserNotifications(userId);
websocketService.subscribeToFarmerOrders(farmerId);
```

### WebSocket Initialization
The `useWebSocket` hook in `shared/hooks/useWebSocket.ts` automatically:
- Connects when user is authenticated
- Subscribes to appropriate channels based on role
- Disconnects on logout

### Notification Types
| Type | Icon | Description |
|------|------|-------------|
| `order` | Package | New order placed |
| `payment` | CreditCard | Payment received |
| `message` | MessageCircle | New chat message |
| `system` | Bell | System announcements |
| `delivery` | Truck | Delivery status update |
| `order_status` | Clock | Order status change |

### Browser Notifications
- Permission requested on first connection
- Native browser notifications for delivery updates
- Shows notification even when tab is in background

### Integration Points
| Component | Purpose |
|-----------|---------|
| `App.tsx` → `WebSocketInitializer` | Initializes connection |
| `NotificationDropdown.tsx` | Displays notifications |
| `OrderTrackingPage.tsx` | Shows delivery updates |
| `FarmerOrdersPage.tsx` | Real-time order notifications |

---

## 📊 Commission & Analytics

### Admin Dashboard
- Total orders, revenue, and commission tracking
- 10% commission rate on all farmer sales
- Revenue distribution: 90% to farmer, 10% to platform

### Stats Endpoints
```typescript
// Admin stats
orderService.getAdminStats()
// Returns: { totalOrders, totalRevenue, totalCommission, pendingOrders, shippedOrders, deliveredOrders }

// Farmer stats  
orderService.getFarmerStats()
// Returns: { totalOrders, totalEarnings, pendingOrders, completedOrders }
```
| `npm run lint` | Run ESLint |

---

*Last Updated: March 2026*
