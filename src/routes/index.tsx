import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { MainLayout } from "../layouts";
import { AdminLayout } from "../layouts/AdminLayout";
import { FarmerLayout } from "../layouts/FarmerLayout";
import { WholesalerLayout } from "../layouts/WholesalerLayout";
import { UserLayout } from "../layouts/UserLayout";
import { DeliveryLayout } from "../layouts/DeliveryLayout";
import { ProtectedRoute } from "../modules/auth/components";
import { RiLoader4Line } from "react-icons/ri";
import { ErrorBoundary } from "../shared/components/ErrorBoundary";

const HomePage = lazy(() =>
  import("./pages/HomePage").then((m) => ({ default: m.HomePage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
const UnauthorizedPage = lazy(() =>
  import("./pages/UnauthorizedPage").then((m) => ({
    default: m.UnauthorizedPage,
  })),
);
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const ErrorPage = lazy(() =>
  import("./pages/ErrorPage").then((m) => ({ default: m.ErrorPage })),
);
const AboutPage = lazy(() =>
  import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const ContactPage = lazy(() =>
  import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })),
);
const BlogPage = lazy(() =>
  import("./pages/BlogPage").then((m) => ({ default: m.BlogPage })),
);
const BlogDetailPage = lazy(() =>
  import("./pages/BlogDetailPage").then((m) => ({ default: m.BlogDetailPage })),
);

const LoginPage = lazy(() =>
  import("../modules/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
const AdminLoginPage = lazy(() =>
  import("../modules/auth/pages/AdminLoginPage").then((m) => ({
    default: m.AdminLoginPage,
  })),
);
const AdminRegisterPage = lazy(() =>
  import("../modules/auth/pages/AdminRegisterPage").then((m) => ({
    default: m.AdminRegisterPage,
  })),
);
const RegisterPage = lazy(() =>
  import("../modules/auth/pages/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
);
const RoleSelectionPage = lazy(() =>
  import("../modules/auth/pages/RoleSelectionPage").then((m) => ({
    default: m.RoleSelectionPage,
  })),
);
const VerifyOtpPage = lazy(() =>
  import("../modules/auth/pages/VerifyOtpPage").then((m) => ({
    default: m.VerifyOtpPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("../modules/auth/pages/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const VerifyResetOtpPage = lazy(() =>
  import("../modules/auth/pages/VerifyResetOtpPage").then((m) => ({
    default: m.VerifyResetOtpPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("../modules/auth/pages/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);

const ProductListPage = lazy(() =>
  import("../modules/product/pages/ProductListPage").then((m) => ({
    default: m.ProductListPage,
  })),
);
const ProductDetailPage = lazy(() =>
  import("../modules/product/pages/ProductDetailPage").then((m) => ({
    default: m.ProductDetailPage,
  })),
);

const CartPage = lazy(() =>
  import("../modules/cart/pages/CartPage").then((m) => ({
    default: m.CartPage,
  })),
);
const CheckoutPage = lazy(() =>
  import("../modules/cart/pages/CheckoutPage").then((m) => ({
    default: m.CheckoutPage,
  })),
);

const MyOrdersPage = lazy(() =>
  import("../modules/orders/pages/MyOrdersPage").then((m) => ({
    default: m.MyOrdersPage,
  })),
);
const WishlistPage = lazy(() =>
  import("../modules/wishlist/pages/WishlistPage").then((m) => ({
    default: m.WishlistPage,
  })),
);
const DeliveryTrackingPage = lazy(() =>
  import("../modules/orders/pages/DeliveryTrackingPage").then((m) => ({
    default: m.DeliveryTrackingPage,
  })),
);

const OrderDetailsPage = lazy(() =>
  import("../modules/orders/pages/OrderDetailsPage").then((m) => ({
    default: m.OrderDetailsPage,
  })),
);

const DeliveryDashboardPage = lazy(() =>
  import("../modules/orders/pages/DeliveryDashboardPage").then((m) => ({
    default: m.DeliveryDashboardPage,
  })),
);

const FarmerDashboardPage = lazy(() =>
  import("../modules/farmer/pages/FarmerDashboardPage").then((m) => ({
    default: m.FarmerDashboardPage,
  })),
);
const FarmerProductsPage = lazy(() =>
  import("../modules/farmer/pages/FarmerProductsPage").then((m) => ({
    default: m.FarmerProductsPage,
  })),
);
const AddProductPage = lazy(() =>
  import("../modules/farmer/pages/AddProductPage").then((m) => ({
    default: m.AddProductPage,
  })),
);
const EditProductPage = lazy(() =>
  import("../modules/farmer/pages/EditProductPage").then((m) => ({
    default: m.EditProductPage,
  })),
);
const FarmerEarningsPage = lazy(() =>
  import("../modules/farmer/pages/FarmerEarningsPage").then((m) => ({
    default: m.FarmerEarningsPage,
  })),
);
const FarmerOrdersPage = lazy(() =>
  import("../modules/farmer/pages/FarmerOrdersPage").then((m) => ({
    default: m.FarmerOrdersPage,
  })),
);

const WholesalerDashboardPage = lazy(() =>
  import("../modules/wholesaler/pages/WholesalerDashboardPage").then((m) => ({
    default: m.WholesalerDashboardPage,
  })),
);
const BulkRequestsPage = lazy(() =>
  import("../modules/wholesaler/pages/BulkRequestsPage").then((m) => ({
    default: m.BulkRequestsPage,
  })),
);
const InventoryPage = lazy(() =>
  import("../modules/wholesaler/pages/InventoryPage").then((m) => ({
    default: m.InventoryPage,
  })),
);

const AdminDashboardPage = lazy(() =>
  import("../modules/admin/pages/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const ManageUsersPage = lazy(() =>
  import("../modules/admin/pages/ManageUsersPage").then((m) => ({
    default: m.ManageUsersPage,
  })),
);
const ManageProductsPage = lazy(() =>
  import("../modules/admin/pages/ManageProductsPage").then((m) => ({
    default: m.ManageProductsPage,
  })),
);
const ManageDeliveryBoysPage = lazy(() =>
  import("../modules/admin/pages/ManageDeliveryBoysPage").then((m) => ({
    default: m.ManageDeliveryBoysPage,
  })),
);
const OrderAssignmentPage = lazy(() =>
  import("../modules/admin/pages/OrderAssignmentPage").then((m) => ({
    default: m.OrderAssignmentPage,
  })),
);
const FraudDetectionPage = lazy(() =>
  import("../modules/admin/pages/FraudDetectionPage").then((m) => ({
    default: m.FraudDetectionPage,
  })),
);
const CommissionPage = lazy(() =>
  import("../modules/admin/pages/CommissionPage").then((m) => ({
    default: m.CommissionPage,
  })),
);
const AdminLogsPage = lazy(() =>
  import("../modules/admin/pages/AdminLogsPage").then((m) => ({
    default: m.AdminLogsPage,
  })),
);
const AdminOrdersPage = lazy(() =>
  import("../modules/admin/pages/AdminOrdersPage").then((m) => ({
    default: m.AdminOrdersPage,
  })),
);

const ChatPage = lazy(() =>
  import("../modules/chat/pages/ChatPage").then((m) => ({
    default: m.ChatPage,
  })),
);
const GlobalChatMonitorPage = lazy(() =>
  import("../modules/admin/pages/GlobalChatMonitorPage").then((m) => ({
    default: m.default,
  })),
);

const AdminBlogsPage = lazy(() =>
  import("../modules/admin/pages/AdminBlogsPage").then((m) => ({
    default: m.AdminBlogsPage,
  })),
);
const AdminBannersPage = lazy(() =>
  import("./pages/admin/AdminBannersPage").then((m) => ({
    default: m.AdminBannersPage,
  })),
);
const AdminBlogFormPage = lazy(() =>
  import("../modules/admin/pages/AdminBlogFormPage").then((m) => ({
    default: m.AdminBlogFormPage,
  })),
);
const AdminPaymentsPage = lazy(() =>
  import("../modules/admin/pages/AdminPaymentsPage").then((m) => ({
    default: m.AdminPaymentsPage,
  })),
);
const AdminShipmentsPage = lazy(() =>
  import("../modules/admin/pages/AdminShipmentsPage").then((m) => ({
    default: m.AdminShipmentsPage,
  })),
);
const AdminContactMessagesPage = lazy(() =>
  import("../modules/admin/pages/AdminContactMessagesPage").then((m) => ({
    default: m.AdminContactMessagesPage,
  })),
);
const AdminProfilePage = lazy(() =>
  import("../pages/admin/profile/AdminProfilePage").then((m) => ({
    default: m.AdminProfilePage,
  })),
);

// ── Bulk Marketplace pages ──────────────────────────────────────────────────
const BulkMarketPage = lazy(() =>
  import("../modules/bulk/pages/BulkMarketPage").then((m) => ({
    default: m.BulkMarketPage,
  })),
);
const FarmerBulkProductsPage = lazy(() =>
  import("../modules/bulk/pages/FarmerBulkProductsPage").then((m) => ({
    default: m.FarmerBulkProductsPage,
  })),
);
const NegotiationChatPage = lazy(() =>
  import("../modules/bulk/pages/NegotiationChatPage").then((m) => ({
    default: m.NegotiationChatPage,
  })),
);
const ReadOnlyNegotiationChatPage = lazy(() =>
  import("../modules/bulk/pages/NegotiationChatPage").then((m) => ({
    default: () => <m.NegotiationChatPage readOnly={true} />,
  })),
);
const PaymentAddressPage = lazy(() =>
  import("../modules/bulk/pages/PaymentAddressPage").then((m) => ({
    default: m.PaymentAddressPage,
  })),
);
const BulkOrderTrackingPage = lazy(() =>
  import("../modules/bulk/pages/BulkOrderTrackingPage").then((m) => ({
    default: m.BulkOrderTrackingPage,
  })),
);
const EventsPage = lazy(() =>
  import("../modules/events/pages/EventsPage").then((m) => ({
    default: m.EventsPage,
  })),
);
const AdminEventsPage = lazy(() =>
  import("../modules/events/pages/AdminEventsPage").then((m) => ({
    default: m.AdminEventsPage,
  })),
);

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-bg dark:bg-gray-900">
      <RiLoader4Line className="animate-spin text-green-600" size={48} />
    </div>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: (
      <SuspenseWrapper>
        <ErrorPage />
      </SuspenseWrapper>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "products",
        element: (
          <SuspenseWrapper>
            <ProductListPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "products/:id",
        element: (
          <SuspenseWrapper>
            <ProductDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "profile/:id",
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "cart",
        element: (
          <ProtectedRoute allowedRoles={["user"]}>
            <SuspenseWrapper>
              <CartPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "auth/role-selection",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <RoleSelectionPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "unauthorized",
        element: (
          <SuspenseWrapper>
            <UnauthorizedPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "about",
        element: (
          <SuspenseWrapper>
            <AboutPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "contact",
        element: (
          <SuspenseWrapper>
            <ContactPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "blog",
        element: (
          <SuspenseWrapper>
            <BlogPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "blogs",
        element: (
          <SuspenseWrapper>
            <BlogPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "bulk-market",
        element: (
          <SuspenseWrapper>
            <BulkMarketPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "blog/:id",
        element: (
          <SuspenseWrapper>
            <BlogDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "blogs/:id",
        element: (
          <SuspenseWrapper>
            <BlogDetailPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  // ── User (consumer) protected routes ──────────────────────────────────────
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRoles={["user"]}>
        <UserLayout />
      </ProtectedRoute>
    ),
    errorElement: (
      <SuspenseWrapper>
        <ErrorPage />
      </SuspenseWrapper>
    ),
    children: [
      {
        path: "dashboard",
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "orders",
        element: (
          <SuspenseWrapper>
            <MyOrdersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "orders/:id",
        element: (
          <SuspenseWrapper>
            <OrderDetailsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "orders/:id/track",
        element: (
          <SuspenseWrapper>
            <DeliveryTrackingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "delivery/orders",
        element: (
          <SuspenseWrapper>
            <DeliveryDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "wishlist",
        element: (
          <SuspenseWrapper>
            <WishlistPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "chat",
        element: (
          <SuspenseWrapper>
            <ChatPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "profile",
        element: (
          <SuspenseWrapper>
            <AdminProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "checkout",
        element: (
          <SuspenseWrapper>
            <CheckoutPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  // ── Farmer protected routes ────────────────────────────────────────────────
  {
    path: "/farmer",
    element: (
      <ProtectedRoute allowedRoles={["farmer"]}>
        <FarmerLayout />
      </ProtectedRoute>
    ),
    errorElement: (
      <SuspenseWrapper>
        <ErrorPage />
      </SuspenseWrapper>
    ),
    children: [
      { path: "", element: <Navigate to="dashboard" replace /> },
      {
        path: "dashboard",
        element: (
          <SuspenseWrapper>
            <FarmerDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "products",
        element: (
          <SuspenseWrapper>
            <FarmerProductsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "products/add",
        element: (
          <SuspenseWrapper>
            <AddProductPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "products/edit/:id",
        element: (
          <SuspenseWrapper>
            <EditProductPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "orders",
        element: (
          <SuspenseWrapper>
            <FarmerOrdersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "profile",
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
      // {
      //   path: "chat",
      //   element: (
      //     <SuspenseWrapper>
      //       <ChatPage />
      //     </SuspenseWrapper>
      //   ),
      // },
      {
        path: "bulk-products",
        element: (
          <SuspenseWrapper>
            <FarmerBulkProductsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "negotiations",
        element: (
          <SuspenseWrapper>
            <NegotiationChatPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "chat/:conversationId",
        element: (
          <SuspenseWrapper>
            <NegotiationChatPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "orders/track/:orderId",
        element: (
          <SuspenseWrapper>
            <BulkOrderTrackingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "earnings",
        element: (
          <SuspenseWrapper>
            <FarmerEarningsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "events",
        element: (
          <SuspenseWrapper>
            <EventsPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  // ── Wholesaler protected routes ────────────────────────────────────────────
  {
    path: "/wholesaler",
    element: (
      <ProtectedRoute allowedRoles={["wholesaler"]}>
        <WholesalerLayout />
      </ProtectedRoute>
    ),
    errorElement: (
      <SuspenseWrapper>
        <ErrorPage />
      </SuspenseWrapper>
    ),
    children: [
      { path: "", element: <Navigate to="dashboard" replace /> },
      {
        path: "dashboard",
        element: (
          <SuspenseWrapper>
            <WholesalerDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "bulk-market",
        element: (
          <SuspenseWrapper>
            <BulkMarketPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "bulk-requests",
        element: (
          <SuspenseWrapper>
            <BulkRequestsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "inventory",
        element: (
          <SuspenseWrapper>
            <InventoryPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "profile",
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "negotiations",
        element: (
          <SuspenseWrapper>
            <NegotiationChatPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "chat/:conversationId",
        element: (
          <SuspenseWrapper>
            <NegotiationChatPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "payment-address/:dealId",
        element: (
          <SuspenseWrapper>
            <PaymentAddressPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "orders/track/:orderId",
        element: (
          <SuspenseWrapper>
            <BulkOrderTrackingPage />
          </SuspenseWrapper>
        ),
      },
      // {
      //   path: "chat",
      //   element: (
      //     <SuspenseWrapper>
      //       <ChatPage />
      //     </SuspenseWrapper>
      //   ),
      // },
    ],
  },
  // ── Delivery protected routes ──────────────────────────────────────────────
  {
    path: "/delivery",
    element: (
      <ProtectedRoute allowedRoles={["delivery"]}>
        <DeliveryLayout />
      </ProtectedRoute>
    ),
    errorElement: (
      <SuspenseWrapper>
        <ErrorPage />
      </SuspenseWrapper>
    ),
    children: [
      { path: "", element: <Navigate to="dashboard" replace /> },
      {
        path: "dashboard",
        element: (
          <SuspenseWrapper>
            <DeliveryDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "orders",
        element: (
          <SuspenseWrapper>
            <DeliveryDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "orders/:id/track",
        element: (
          <SuspenseWrapper>
            <DeliveryTrackingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "profile",
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  // ── Admin protected routes ─────────────────────────────────────────────────
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: (
      <SuspenseWrapper>
        <ErrorPage />
      </SuspenseWrapper>
    ),
    children: [
      { path: "", element: <Navigate to="dashboard" replace /> },
      {
        path: "dashboard",
        element: (
          <SuspenseWrapper>
            <AdminDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "users",
        element: (
          <SuspenseWrapper>
            <ManageUsersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "orders",
        element: (
          <SuspenseWrapper>
            <AdminOrdersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "products",
        element: (
          <SuspenseWrapper>
            <ManageProductsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "delivery-boys",
        element: (
          <SuspenseWrapper>
            <ManageDeliveryBoysPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "order-assignment",
        element: (
          <SuspenseWrapper>
            <OrderAssignmentPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "fraud",
        element: (
          <SuspenseWrapper>
            <FraudDetectionPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "commissions",
        element: (
          <SuspenseWrapper>
            <CommissionPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "logs",
        element: (
          <SuspenseWrapper>
            <AdminLogsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "profile",
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "negotiations",
        element: (
          <SuspenseWrapper>
            <NegotiationChatPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "chat/:conversationId",
        element: (
          <SuspenseWrapper>
            <ReadOnlyNegotiationChatPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "chat",
        element: (
          <SuspenseWrapper>
            <GlobalChatMonitorPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "blogs",
        element: (
          <SuspenseWrapper>
            <AdminBlogsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "blogs/create",
        element: (
          <SuspenseWrapper>
            <AdminBlogFormPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "blogs/edit/:id",
        element: (
          <SuspenseWrapper>
            <AdminBlogFormPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "payments",
        element: (
          <SuspenseWrapper>
            <AdminPaymentsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "shipments",
        element: (
          <SuspenseWrapper>
            <AdminShipmentsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "contact-messages",
        element: (
          <SuspenseWrapper>
            <AdminContactMessagesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "banners",
        element: (
          <SuspenseWrapper>
            <AdminBannersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "events",
        element: (
          <SuspenseWrapper>
            <AdminEventsPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  // ── Auth routes ────────────────────────────────────────────────────────────
  {
    path: "/login",
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/register",
    element: (
      <SuspenseWrapper>
        <RegisterPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/verify-otp",
    element: (
      <SuspenseWrapper>
        <VerifyOtpPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <SuspenseWrapper>
        <ForgotPasswordPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/verify-reset-otp",
    element: (
      <SuspenseWrapper>
        <VerifyResetOtpPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <SuspenseWrapper>
        <ResetPasswordPage />
      </SuspenseWrapper>
    ),
  },
  // ── Admin auth routes (public) ────────────────────────────────────────────
  {
    path: "/admin/login",
    element: (
      <SuspenseWrapper>
        <AdminLoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/admin/register",
    element: (
      <SuspenseWrapper>
        <AdminRegisterPage />
      </SuspenseWrapper>
    ),
  },
  // ── Catch-all route ────────────────────────────────────────────────────────
  {
    path: "*",
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
