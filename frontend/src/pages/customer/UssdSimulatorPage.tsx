import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, RotateCcw, Smartphone } from "lucide-react";
import { usePhone } from "@/context/PhoneContext";
import { api, ApiError } from "@/lib/api";
import type { USSDResponse } from "@/types/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { SimulatedBadge } from "@/components/ui/SimulatedBadge";

interface ChatMessage {
  id: number;
  role: "bot" | "user";
  text: string;
}

const MENU_HINTS = [
  "1 Verify receipt",
  "2 My points",
  "3 Redeem",
  "4 Report no receipt",
  "5 Merchant sales",
];

export default function UssdSimulatorPage() {
  const { phone } = usePhone();
  const sessionIdRef = useRef<string>(`web-${Date.now()}`);
  const counterRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [sessionText, setSessionText] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const pushMessage = (role: "bot" | "user", text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: ++counterRef.current, role, text },
    ]);
  };

  // Start a session on mount.
  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    setSessionText("");
    sessionIdRef.current = `web-${Date.now()}`;
    api
      .ussd({ session_id: sessionIdRef.current, phone, text: "" })
      .then((res) => {
        if (!cancelled) pushMessage("bot", res.response_text);
      })
      .catch((e) => {
        if (!cancelled)
          setError(
            e instanceof ApiError ? e : new ApiError("unknown", "USSD failed.", null),
          );
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const send = async (raw: string) => {
    const value = raw.trim();
    if (!value || sending) return;
    setError(null);
    pushMessage("user", value);
    setInput("");

    const nextText = sessionText ? `${sessionText}*${value}` : value;
    setSending(true);
    try {
      const res: USSDResponse = await api.ussd({
        session_id: sessionIdRef.current,
        phone,
        text: nextText,
      });
      pushMessage("bot", res.response_text);
      if (res.end) {
        // Session finished — reset accumulated text for a fresh flow.
        setSessionText("");
        sessionIdRef.current = `web-${Date.now()}`;
      } else {
        setSessionText(nextText);
      }
    } catch (e) {
      setError(
        e instanceof ApiError ? e : new ApiError("unknown", "USSD failed.", null),
      );
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    sessionIdRef.current = `web-${Date.now()}`;
    setSessionText("");
    setMessages([]);
    setError(null);
    api
      .ussd({ session_id: sessionIdRef.current, phone, text: "" })
      .then((res) => pushMessage("bot", res.response_text))
      .catch(() => setError(new ApiError("network", "Cannot reach the backend.", null)));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Feature phone friendly"
        title="USSD simulator"
        description="Try the menu-based USSD experience that works on any phone — no internet required in the field."
        action={<SimulatedBadge label="USSD session" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="flex h-[32rem] flex-col overflow-hidden">
          <CardHeader
            title="Session"
            subtitle={`Phone · ${phone}`}
            action={
              <Button
                size="sm"
                variant="ghost"
                onClick={reset}
                leftIcon={<RotateCcw className="h-4 w-4" />}
              >
                Restart
              </Button>
            }
          />
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-ink-50/50 p-4"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-brand-600 text-white"
                      : "border border-ink-200 bg-white text-ink-800 shadow-soft"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-400 shadow-soft">
                  …
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-ink-100 p-3">
            {error && (
              <p className="mb-2 px-1 text-xs font-medium text-red-600">
                {error.message}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type a choice, e.g. 1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                disabled={sending}
              />
              <Button
                onClick={() => send(input)}
                loading={sending}
                disabled={!input.trim()}
                leftIcon={<Send className="h-4 w-4" />}
                aria-label="Send"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-brand-600" />
              <h3 className="text-base font-semibold text-ink-900">Main menu</h3>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              Tap an option to send it, or type your own reply.
            </p>
            <div className="mt-4 space-y-2">
              {MENU_HINTS.map((hint, i) => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => send(String(i + 1))}
                  className="flex w-full items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3 text-left text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50/50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    {i + 1}
                  </span>
                  {hint.replace(/^\d\s/, "")}
                </button>
              ))}
            </div>
          </Card>

          <Card className="border-dashed bg-ink-50/50 p-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-ink-400" />
              <p className="text-sm font-semibold text-ink-700">How it works</p>
            </div>
            <p className="mt-2 text-sm text-ink-500">
              The USSD flow is stateless: your choices are joined with{" "}
              <span className="font-mono text-ink-700">*</span> and sent to the
              backend, which returns the next screen. Sessions end automatically
              after a completed action.
            </p>
            <Badge tone="neutral" className="mt-3">
              {sessionText ? `Session: ${sessionText}` : "New session"}
            </Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}