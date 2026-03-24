import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import {
  fetchMessages,
  sendMessage,
  fetchDeals,
  createDeal,
  respondDeal,
  clearMessages,
  fetchConversations,
} from "../negotiationSlice";
import { stompService } from "../../../services/stompService";
import {
  RiSendPlaneFill,
  RiArrowLeftLine,
  RiHandCoinLine,
  RiAttachment2,
  RiCheckLine,
  RiCheckDoubleLine,
  RiChat3Line,
} from "react-icons/ri";
import toast from "react-hot-toast";
import ImageUpload from "../../../shared/components/ImageUpload";
import { EmptyState, MessageSkeleton } from "../../../shared/components/ui";
import { useTranslation } from "react-i18next";

interface NegotiationChatPageProps {
  readOnly?: boolean;
}

export function NegotiationChatPage({
  readOnly = false,
}: NegotiationChatPageProps) {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { messages, deals, conversations, isLoading, isSubmitting } =
    useAppSelector((state) => state.negotiation);
  const { user } = useAppSelector((state) => state.auth);
  const [messageText, setMessageText] = useState("");
  const [showDealForm, setShowDealForm] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [dealForm, setDealForm] = useState({ pricePerUnit: 0, quantity: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const convId = Number(conversationId);
  const isDarkMode = useAppSelector((state) => state.ui.darkMode);

  const theme = {
    rootBg: isDarkMode ? "#0f172a" : "#ffffff",
    sidebarBg: isDarkMode ? "#0b1220" : "#f8fafc",
    panelBg: isDarkMode ? "#111827" : "#ffffff",
    panelSoftBg: isDarkMode ? "#0f172a" : "#f8fafc",
    border: isDarkMode ? "#334155" : "#e2e8f0",
    title: isDarkMode ? "#e2e8f0" : "#1a1a2e",
    text: isDarkMode ? "#cbd5e1" : "#64748b",
    muted: isDarkMode ? "#94a3b8" : "#94a3b8",
    activeItemBg: isDarkMode ? "#1f2937" : "#f1f5f9",
    hoverItemBg: isDarkMode ? "#111827" : "#f8fafc",
    chatBg: isDarkMode
      ? "linear-gradient(180deg, #0f172a 0%, #111827 50%, #172554 100%)"
      : "linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 50%, #dcfce7 100%)",
    placeholderBg: isDarkMode
      ? "linear-gradient(180deg, #0f172a, #111827)"
      : "linear-gradient(180deg, #f0fdf4, #ecfdf5)",
    dealFormBg: isDarkMode ? "#1f2937" : "#fffbeb",
    dealFormBorder: isDarkMode ? "#475569" : "#fde68a",
    dealLabel: isDarkMode ? "#fbbf24" : "#92400e",
    inputBg: isDarkMode ? "#0f172a" : "#ffffff",
    inputText: isDarkMode ? "#e2e8f0" : "#1f2937",
    dealStripBg: isDarkMode ? "#0f172a" : "#f0fdf4",
    dealStripBorder: isDarkMode ? "#334155" : "#bbf7d0",
    dealCardBg: isDarkMode ? "#111827" : "#ffffff",
    sendAreaBg: isDarkMode ? "#0b1220" : "#f8fafc",
    bubbleMine: isDarkMode ? "#14532d" : "#bbf7d0",
    bubbleOther: isDarkMode ? "#1f2937" : "#ffffff",
    bubbleDeal: isDarkMode ? "#78350f" : "#fef3c7",
    bubbleAccepted: isDarkMode ? "#166534" : "#bbf7d0",
    bubbleRejected: isDarkMode ? "#7f1d1d" : "#fecaca",
  };

  useEffect(() => {
    dispatch(fetchConversations());
    if (!convId || isNaN(convId)) return;

    dispatch(fetchMessages(convId));
    dispatch(fetchDeals(convId));

    // Connect STOMP and subscribe
    const connectAndSubscribe = async () => {
      try {
        if (!stompService.isConnected) {
          await stompService.connect();
        }
        stompService.subscribeToConversation(convId);
        stompService.subscribeToTyping(convId, (_senderId, isTyping) => {
          setIsOtherTyping(isTyping);
          if (isTyping) {
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
            typingTimerRef.current = setTimeout(
              () => setIsOtherTyping(false),
              3000,
            );
          }
        });
      } catch (err) {
        console.error("STOMP connection failed:", err);
      }
    };
    connectAndSubscribe();

    return () => {
      stompService.unsubscribeFromConversation(convId);
      stompService.unsubscribeFromTyping(convId);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      dispatch(clearMessages());
    };
  }, [convId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || readOnly) return;
    if (user?.id && convId) {
      stompService.sendTypingIndicator(convId, Number(user.id), false);
    }
    try {
      await dispatch(
        sendMessage({
          conversationId: convId,
          message: messageText,
          messageType: "TEXT",
        }),
      ).unwrap();
      setMessageText("");
    } catch (err) {
      toast.error(t("chat.failed_send_message"));
    }
  };

  const handleAttachmentUpload = async (res: any) => {
    if (readOnly) return;
    try {
      await dispatch(
        sendMessage({
          conversationId: convId,
          message: res.url,
          messageType: "ATTACHMENT",
        }),
      ).unwrap();
      toast.success(t("chat.attachment_sent"));
      setShowAttachment(false);
    } catch (err) {
      toast.error(t("chat.failed_send_attachment"));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealForm.pricePerUnit || !dealForm.quantity) {
      toast.error(t("chat.enter_price_quantity"));
      return;
    }
    try {
      await dispatch(
        createDeal({ conversationId: convId, ...dealForm }),
      ).unwrap();
      toast.success(t("chat.deal_offer_sent"));
      setShowDealForm(false);
      setDealForm({ pricePerUnit: 0, quantity: 0 });
    } catch (err) {
      toast.error(t("chat.failed_create_deal"));
    }
  };

  const handleRespondDeal = async (
    dealOfferId: number,
    action: "ACCEPT" | "REJECT",
  ) => {
    try {
      await dispatch(respondDeal({ dealOfferId, action })).unwrap();
      toast.success(
        action === "ACCEPT" ? t("chat.deal_accepted") : t("chat.deal_rejected"),
      );
      dispatch(fetchDeals(convId));
    } catch (err: any) {
      toast.error(err?.message || t("chat.failed_respond_deal"));
    }
  };

  const handlePayNow = (dealOfferId: number) => {
    navigate(`/wholesaler/payment-address/${dealOfferId}`);
  };

  const goBack = () => {
    if (user?.role === "farmer") navigate("/farmer/negotiations");
    else if (user?.role === "wholesaler") navigate("/wholesaler/negotiations");
    else if (user?.role === "admin") navigate("/admin/negotiations");
    else navigate(-1);
  };

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Determine chat base path based on role
  const chatBasePath =
    user?.role === "farmer"
      ? "/farmer/chat"
      : user?.role === "wholesaler"
        ? "/wholesaler/chat"
        : "/admin/chat";

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessageText(e.target.value);
      if (!readOnly && user?.id && convId) {
        stompService.sendTypingIndicator(convId, Number(user.id), true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
          stompService.sendTypingIndicator(convId, Number(user.id), false);
        }, 2000);
      }
    },
    [convId, user?.id, readOnly],
  );

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 80px)",
        background: theme.rootBg,
        borderTop: `1px solid ${theme.border}`,
      }}
    >
      {/* Left Sidebar - Conversation List */}
      <div
        style={{
          width: 320,
          borderRight: `1px solid ${theme.border}`,
          display: "flex",
          flexDirection: "column",
          background: theme.sidebarBg,
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: `1px solid ${theme.border}`,
            background: theme.panelBg,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: theme.title,
              margin: 0,
            }}
          >
              {t("chat.chats")}
          </h2>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.length === 0 ? (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color: theme.muted,
                fontSize: 14,
              }}
            >
              {t("chat.no_active_conversations")}
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = convId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => navigate(`${chatBasePath}/${conv.id}`)}
                  style={{
                    padding: "16px 20px",
                    borderBottom: `1px solid ${theme.border}`,
                    background: isActive ? theme.activeItemBg : theme.panelBg,
                    cursor: "pointer",
                    transition: "background 0.2s",
                    borderLeft: isActive
                      ? "4px solid #16a34a"
                      : "4px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = theme.hoverItemBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = theme.panelBg;
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: isActive ? 700 : 600,
                      color: theme.title,
                      margin: "0 0 4px 0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {conv.bulkProductName}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: theme.text,
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.role === "farmer"
                      ? conv.wholesalerName
                      : conv.farmerName}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: theme.muted,
                      margin: "4px 0 0 0",
                    }}
                  >
                    {formatTime(conv.createdAt)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Side - Active Chat */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: theme.chatBg,
        }}
      >
        {/* Placeholder when no conversation selected */}
        {(!convId || isNaN(convId)) && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: theme.placeholderBg,
              gap: 16,
            }}
          >
            <div style={{ fontSize: 56 }}>🌾</div>
            <h3
              style={{
                margin: 0,
                color: isDarkMode ? "#86efac" : "#15803d",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {t("chat.select_conversation")}
            </h3>
            <p style={{ margin: 0, color: theme.text, fontSize: 14 }}>
              {t("chat.select_negotiation_prompt")}
            </p>
          </div>
        )}
        {!!convId && !isNaN(convId) && (
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                borderBottom: "1px solid #15803d",
              }}
            >
              <button
                onClick={goBack}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <RiArrowLeftLine size={20} color="#fff" />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.3)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {(user?.role === "farmer"
                    ? conversations.find((c) => c.id === convId)?.wholesalerName
                    : conversations.find((c) => c.id === convId)?.farmerName
                  )
                    ?.charAt(0)
                    .toUpperCase() || "?"}
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#fff",
                      margin: 0,
                    }}
                  >
                    {user?.role === "farmer"
                      ? conversations.find((c) => c.id === convId)
                          ?.wholesalerName
                      : conversations.find((c) => c.id === convId)
                            ?.farmerName || t("chat.negotiation_chat")}
                    {readOnly && (
                      <span
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          fontWeight: 400,
                          fontSize: 13,
                        }}
                      >
                        {" "}
                        {` ${t("chat.read_only")}`}
                      </span>
                    )}
                  </h2>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.8)",
                      margin: 0,
                    }}
                  >
                    {conversations.find((c) => c.id === convId)
                      ?.bulkProductName || `Conv #${convId}`}
                  </p>
                </div>
              </div>
              {!readOnly && (
                <button
                  onClick={() => setShowDealForm(!showDealForm)}
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    background: "#f59e0b",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <RiHandCoinLine /> {t("chat.make_offer")}
                </button>
              )}
            </div>

            {/* Deal Form */}
            {showDealForm && !readOnly && (
              <form
                onSubmit={handleCreateDeal}
                style={{
                  padding: 16,
                  background: theme.dealFormBg,
                  borderBottom: `1px solid ${theme.dealFormBorder}`,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: theme.dealLabel,
                      marginBottom: 4,
                    }}
                  >
                    {t("chat.price_per_unit")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dealForm.pricePerUnit || ""}
                    onChange={(e) =>
                      setDealForm({
                        ...dealForm,
                        pricePerUnit: Number(e.target.value),
                      })
                    }
                    style={{
                      padding: "8px 12px",
                      border: `1px solid ${theme.dealFormBorder}`,
                      borderRadius: 6,
                      fontSize: 14,
                      width: 120,
                      background: theme.inputBg,
                      color: theme.inputText,
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: theme.dealLabel,
                      marginBottom: 4,
                    }}
                  >
                    {t("common.quantity")}
                  </label>
                  <input
                    type="number"
                    value={dealForm.quantity || ""}
                    onChange={(e) =>
                      setDealForm({
                        ...dealForm,
                        quantity: Number(e.target.value),
                      })
                    }
                    style={{
                      padding: "8px 12px",
                      border: `1px solid ${theme.dealFormBorder}`,
                      borderRadius: 6,
                      fontSize: 14,
                      width: 120,
                      background: theme.inputBg,
                      color: theme.inputText,
                    }}
                  />
                </div>
                <div
                  style={{ fontSize: 14, color: theme.dealLabel, fontWeight: 600 }}
                >
                  {t("common.total")}: ₹
                  {(dealForm.pricePerUnit * dealForm.quantity).toFixed(2)}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 20px",
                    background: "#f59e0b",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t("chat.send_offer")}
                </button>
              </form>
            )}

            {/* Active Deals */}
            {deals.filter(
              (d) => d.status === "PENDING" || d.status === "ACCEPTED",
            ).length > 0 && (
              <div
                style={{
                  padding: "12px 20px",
                  background: theme.dealStripBg,
                  borderBottom: `1px solid ${theme.dealStripBorder}`,
                }}
              >
                {deals
                  .filter(
                    (d) => d.status === "PENDING" || d.status === "ACCEPTED",
                  )
                  .map((deal) => {
                    const isMyOffer = deal.createdById === Number(user?.id);
                    const canRespond = !isMyOffer && deal.status === "PENDING";
                    const isAccepted = deal.status === "ACCEPTED";
                    const canPay = isAccepted && user?.role === "wholesaler";

                    return (
                      <div
                        key={deal.id}
                        style={{
                          background: theme.dealCardBg,
                          borderRadius: 10,
                          border: isAccepted
                            ? "2px solid #22c55e"
                            : `1px solid ${theme.dealStripBorder}`,
                          padding: 12,
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: isAccepted ? "#15803d" : "#166534",
                              }}
                            >
                              💰 {isAccepted ? t("chat.accepted_deal") : t("chat.deal_offer")}:
                              ₹{deal.pricePerUnit}/unit × {deal.quantity} = ₹
                              {deal.totalPrice}
                            </p>
                            <p style={{ fontSize: 12, color: theme.text }}>
                              {t("chat.offered_by")}: <strong>{deal.createdByName}</strong>{" "}
                              • {t("chat.status")}: {deal.status}
                            </p>
                          </div>
                          {!readOnly && (
                            <div style={{ display: "flex", gap: 8 }}>
                              {canRespond && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleRespondDeal(deal.id, "ACCEPT")
                                    }
                                    style={{
                                      padding: "6px 14px",
                                      background: "#16a34a",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: 6,
                                      fontSize: 12,
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    {t("chat.accept")}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRespondDeal(deal.id, "REJECT")
                                    }
                                    style={{
                                      padding: "6px 14px",
                                      background: "#ef4444",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: 6,
                                      fontSize: 12,
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    {t("chat.reject")}
                                  </button>
                                </>
                              )}
                              {canPay && (
                                <button
                                  onClick={() => handlePayNow(deal.id)}
                                  style={{
                                    padding: "8px 20px",
                                    background:
                                      "linear-gradient(135deg, #16a34a, #15803d)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
                                  }}
                                >
                                  💳 {t("chat.pay_now")}
                                </button>
                              )}
                              {isMyOffer && deal.status === "PENDING" && (
                                <span
                                  style={{
                                    fontSize: 12,
                                    color: "#94a3b8",
                                    fontStyle: "italic",
                                  }}
                                >
                                  {t("chat.waiting_response")}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                background: theme.chatBg,
              }}
            >
              {/* Attachment Upload area */}
              {showAttachment && !readOnly && (
                <div
                  style={{
                    marginBottom: 16,
                    background: theme.panelBg,
                    borderRadius: 12,
                    padding: 16,
                    boxShadow: isDarkMode
                      ? "0 2px 8px rgba(0,0,0,0.35)"
                      : "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: 14, color: theme.title }}>
                      {t("chat.send_image")}
                    </h4>
                    <button
                      onClick={() => setShowAttachment(false)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: theme.text,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <ImageUpload
                    onUploadSuccess={handleAttachmentUpload}
                    onUploadError={(err) => toast.error(err.message)}
                  />
                </div>
              )}

              {isLoading ? (
                <div style={{ padding: 24 }}>
                  <MessageSkeleton />
                </div>
              ) : messages.length === 0 ? (
                <div
                  style={{
                    padding: 40,
                    background: theme.panelBg,
                    borderRadius: 12,
                    boxShadow: isDarkMode
                      ? "0 1px 3px rgba(0,0,0,0.35)"
                      : "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <EmptyState
                    icon={<RiChat3Line size={26} />}
                    title={t("chat.no_messages")}
                    message={t("chat.start_with_first_message")}
                  />
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === Number(user?.id);
                  const isDeal = msg.messageType === "PRICE_OFFER";
                  const isAccepted = msg.messageType === "DEAL_ACCEPTED";
                  const isRejected = msg.messageType === "DEAL_REJECTED";

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        justifyContent: isMine ? "flex-end" : "flex-start",
                        marginBottom: 12,
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "65%",
                          position: "relative",
                          background: isDeal
                            ? theme.bubbleDeal
                            : isAccepted
                              ? theme.bubbleAccepted
                              : isRejected
                                ? theme.bubbleRejected
                                : isMine
                                  ? theme.bubbleMine
                                  : theme.bubbleOther,
                          color: theme.inputText,
                          padding: "10px 14px",
                          borderRadius: "12px",
                          borderTopLeftRadius: isMine ? "12px" : "4px",
                          borderTopRightRadius: isMine ? "4px" : "12px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        }}
                      >
                        {/* Sender Name */}
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: isMine ? "#15803d" : "#16a34a",
                            marginBottom: 4,
                            margin: "0 0 4px 0",
                          }}
                        >
                          {msg.senderName}
                        </p>

                        {msg.messageType === "ATTACHMENT" ? (
                          <div
                            style={{
                              margin: "4px 0 8px 0",
                              borderRadius: 8,
                              overflow: "hidden",
                            }}
                          >
                            <a
                              href={msg.message}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={msg.message}
                                alt="attachment"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: 200,
                                  objectFit: "contain",
                                  background: isDarkMode ? "#334155" : "#e2e8f0",
                                  display: "block",
                                }}
                              />
                            </a>
                          </div>
                        ) : (
                          <p
                            style={{
                              fontSize: 14.5,
                              lineHeight: 1.4,
                              margin: 0,
                              paddingRight: 40,
                              wordWrap: "break-word",
                            }}
                          >
                            {msg.message}
                          </p>
                        )}

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 4,
                            marginTop: -10,
                            float: "right",
                          }}
                        >
                          <span style={{ fontSize: 11, color: theme.text }}>
                            {formatTime(msg.createdAt)}
                          </span>
                          {/* Message status ticks */}
                          {isMine && (
                            <span
                              style={{
                                color:
                                  msg.status === "SEEN" ? "#53bdeb" : "#8696a0",
                                fontSize: 14,
                                display: "flex",
                              }}
                            >
                              {msg.status === "SENT" ? (
                                <RiCheckLine />
                              ) : (
                                <RiCheckDoubleLine />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
              {isOtherTyping && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 0 8px 4px",
                  }}
                >
                  <div style={{ display: "flex", gap: 3 }}>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: isDarkMode ? "#86efac" : "#16a34a",
                          display: "inline-block",
                          animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                          opacity: 0.7,
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: theme.text }}>
                    {t("chat.typing")}
                  </span>
                </div>
              )}
            </div>

            {/* Input WhatsApp Style */}
            {!readOnly && (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "12px 20px",
                  background: theme.sendAreaBg,
                  alignItems: "center",
                  borderTop: `1px solid ${theme.border}`,
                }}
              >
                <button
                  onClick={() => setShowAttachment(!showAttachment)}
                  style={{
                    background: showAttachment ? "#dcfce7" : "transparent",
                    border: "none",
                    color: "#16a34a",
                    cursor: "pointer",
                    padding: 10,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s",
                  }}
                >
                  <RiAttachment2 size={22} />
                </button>

                <div
                  style={{
                    flex: 1,
                    background: theme.inputBg,
                    borderRadius: 24,
                    display: "flex",
                    padding: "12px 20px",
                    alignItems: "center",
                    gap: 12,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <input
                    value={messageText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={t("chat.type_message")}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      fontSize: 15,
                      outline: "none",
                      color: theme.inputText,
                    }}
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={isSubmitting || !messageText.trim()}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: messageText.trim() ? 1 : 0.5,
                    transition: "all 0.2s",
                    flexShrink: 0,
                    boxShadow: messageText.trim()
                      ? "0 2px 8px rgba(22,163,74,0.4)"
                      : "none",
                  }}
                >
                  <RiSendPlaneFill size={22} style={{ marginLeft: 2 }} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
