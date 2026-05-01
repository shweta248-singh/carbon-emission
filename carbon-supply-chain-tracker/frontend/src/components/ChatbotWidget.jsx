import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const COLORS = {
  primary: "#10b981",
  primaryDark: "#059669",
  botBg: "#0f172a",
  botText: "#e5e7eb",
  userBg: "#10b981",
  userText: "#020617",
  panelBg: "rgba(2, 6, 23, 0.92)",
  border: "rgba(255,255,255,0.1)",
};

export default function Chatbot() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hi, I’m CarbonTrace Assistant 👋 Ask me about inventory, shipment, CO₂ calculation, route optimization, analytics, or project setup.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (visible) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing, visible]);

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      @keyframes carbon-message-entry {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes carbon-pulse {
        0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
        70% { box-shadow: 0 0 0 18px rgba(16,185,129,0); }
        100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
      }
      @keyframes carbon-dot {
        0%, 80%, 100% { transform: translateY(0); opacity: .4; }
        40% { transform: translateY(-5px); opacity: 1; }
      }
      .carbon-chat-scroll::-webkit-scrollbar { width: 5px; }
      .carbon-chat-scroll::-webkit-scrollbar-thumb { background: rgba(16,185,129,.4); border-radius: 99px; }
    `;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  const quickActions = [
    "How to add inventory?",
    "How to create shipment?",
    "How is CO2 calculated?",
    "Explain route optimization",
    "Show sample data",
    "Why email notification not coming?",
  ];

  const sendMessage = async (textParam) => {
    const text = textParam || input;

    if (!text.trim() || typing) return;

    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");
    setError("");
    setTyping(true);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const res = await fetch(`${apiUrl}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          lang: i18n.language || "en",
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError("Too many messages. Please wait a minute and try again.");
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "Too many messages. Please wait a minute and try again.",
          },
        ]);
        return;
      }

      if (!res.ok) {
        throw new Error(data?.reply || "Chatbot request failed.");
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: data.reply || "No response from assistant.",
        },
      ]);
    } catch (err) {
      console.error("CarbonTrace Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Server error. Please check backend/chatbot API and try again.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const BotAvatar = () => (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: "rgba(16,185,129,0.12)",
        border: "1px solid rgba(16,185,129,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      🌱
    </div>
  );

  const UserAvatar = () => (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: "#10b981",
        color: "#020617",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      U
    </div>
  );

  return (
    <>
      <button
        onClick={() => {
          if (!open) {
            setOpen(true);
            setTimeout(() => setVisible(true), 20);
          } else {
            setVisible(false);
            setTimeout(() => setOpen(false), 250);
          }
        }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 62,
          height: 62,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "#020617",
          border: "none",
          fontSize: 26,
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 12px 32px rgba(16,185,129,0.35)",
          animation: open ? "none" : "carbon-pulse 2.8s infinite",
        }}
        title="CarbonTrace Assistant"
      >
        {open ? "×" : "🌱"}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            right: 24,
            width: 390,
            maxWidth: "calc(100vw - 32px)",
            height: "72vh",
            maxHeight: 650,
            minHeight: 470,
            background: COLORS.panelBg,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 24,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 9998,
            opacity: visible ? 1 : 0,
            transform: visible
              ? "translateY(0) scale(1)"
              : "translateY(20px) scale(0.96)",
            transition: "all .25s ease",
            boxShadow: "0 24px 70px rgba(0,0,0,.45)",
          }}
        >
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background:
                "linear-gradient(135deg, rgba(16,185,129,.15), rgba(15,23,42,.8))",
            }}
          >
            <div>
              <div
                style={{
                  color: "#f9fafb",
                  fontSize: 17,
                  fontWeight: 800,
                }}
              >
                CarbonTrace Assistant
              </div>
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                Project support • Online
              </div>
            </div>

            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 12px rgba(16,185,129,.8)",
              }}
            />
          </div>

          <div
            className="carbon-chat-scroll"
            style={{
              flex: 1,
              padding: 16,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {messages.length === 1 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    disabled={typing}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(16,185,129,.25)",
                      background: "rgba(16,185,129,.08)",
                      color: "#a7f3d0",
                      fontSize: 12,
                      cursor: typing ? "not-allowed" : "pointer",
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  flexDirection: msg.type === "user" ? "row-reverse" : "row",
                  alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                  animation: "carbon-message-entry .25s ease forwards",
                }}
              >
                {msg.type === "bot" ? <BotAvatar /> : <UserAvatar />}

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      marginBottom: 4,
                      textAlign: msg.type === "user" ? "right" : "left",
                    }}
                  >
                    {msg.type === "bot" ? "Assistant" : "You"}
                  </div>

                  <div
                    style={{
                      background:
                        msg.type === "user" ? COLORS.userBg : COLORS.botBg,
                      color:
                        msg.type === "user" ? COLORS.userText : COLORS.botText,
                      padding: "11px 14px",
                      borderRadius:
                        msg.type === "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      border:
                        msg.type === "bot"
                          ? "1px solid rgba(255,255,255,.08)"
                          : "none",
                      fontSize: 14,
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div style={{ display: "flex", gap: 10 }}>
                <BotAvatar />
                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    background: COLORS.botBg,
                    padding: "13px 16px",
                    borderRadius: "16px 16px 16px 4px",
                    border: "1px solid rgba(255,255,255,.08)",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#10b981",
                        animation: `carbon-dot 1.2s infinite ease-in-out ${i * 0.2
                          }s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  color: "#fbbf24",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div
            style={{
              padding: 14,
              borderTop: "1px solid rgba(255,255,255,.08)",
              display: "flex",
              gap: 10,
              background: "rgba(15,23,42,.9)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about CarbonTrace..."
              disabled={typing}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !typing) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              style={{
                flex: 1,
                padding: "13px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,.1)",
                background: "#020617",
                color: "#f9fafb",
                outline: "none",
                fontSize: 14,
              }}
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                border: "none",
                background:
                  !input.trim() || typing
                    ? "rgba(148,163,184,.25)"
                    : "linear-gradient(135deg,#10b981,#059669)",
                color: !input.trim() || typing ? "#94a3b8" : "#020617",
                cursor: !input.trim() || typing ? "not-allowed" : "pointer",
                fontWeight: 900,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}