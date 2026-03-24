import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../shared/hooks";
import { RiMapPinLine, RiArrowLeftLine, RiLoader4Line } from "react-icons/ri";
import toast from "react-hot-toast";
import api from "../../../services/api";

interface ShippingFormData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  border: "1.5px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  color: "#111827",
  background: "#fff",
};

export function PaymentAddressPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState<ShippingFormData>({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealId) return;

    if (
      !form.fullName ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      toast.error("Please fill all shipping details");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error("Invalid phone number (must be 10 digits starting with 6–9)");
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error("Invalid pincode (must be 6 digits)");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.post(`/bulk-payments/initiate/${dealId}`, {
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      });
      const paymentOrder = response.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "KrushiKranti",
        description: "Bulk Order Payment",
        order_id: paymentOrder.id,
        handler: async function (razorpayResponse: any) {
          try {
            const verifyRes = await api.post("/bulk-payments/verify", {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              deal_id: dealId,
            });
            const orderData = verifyRes.data?.data ?? verifyRes.data;
            toast.success(
              "Payment successful! Order confirmed. Shipping will be arranged shortly.",
            );
            navigate(`/wholesaler/orders/track/${orderData.id}`);
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: form.fullName,
          email: user?.email || "",
          contact: form.phone,
        },
        theme: { color: "#16a34a" },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to initiate payment. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #16a34a, #15803d)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 2px 8px rgba(21,128,61,0.3)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: 8,
            padding: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <RiArrowLeftLine size={20} color="#fff" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <RiMapPinLine size={24} color="#fff" />
          <div>
            <h1
              style={{
                margin: 0,
                color: "#fff",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              Delivery Address
            </h1>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.8)",
                fontSize: 13,
              }}
            >
              Deal #{dealId}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "32px 36px" }}>
            <p
              style={{
                color: "#64748b",
                fontSize: 15,
                marginTop: 0,
                marginBottom: 28,
              }}
            >
              Enter your delivery address. This will be used by Shiprocket to
              schedule pickup and delivery of your bulk order.
            </p>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                }}
              >
                {/* Full Name */}
                <div style={{ gridColumn: "span 2" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    placeholder="Enter full name"
                    style={inputStyle}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    style={inputStyle}
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) =>
                      setForm({ ...form, pincode: e.target.value })
                    }
                    placeholder="6-digit pincode"
                    maxLength={6}
                    style={inputStyle}
                  />
                </div>

                {/* Address */}
                <div style={{ gridColumn: "span 2" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Complete Address *
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="Street, locality, landmark..."
                    rows={3}
                    style={
                      {
                        ...inputStyle,
                        resize: "vertical",
                      } as React.CSSProperties
                    }
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Enter city"
                    style={inputStyle}
                  />
                </div>

                {/* State */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    State *
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    placeholder="Enter state"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    flex: 2,
                    padding: "14px",
                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    opacity: isProcessing ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {isProcessing && <RiLoader4Line className="animate-spin" />}
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
