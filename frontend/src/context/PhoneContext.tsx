import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "@/lib/constants";

interface PhoneContextValue {
  phone: string;
  hasPhone: boolean;
  setPhone: (phone: string) => void;
  clearPhone: () => void;
}

const PhoneContext = createContext<PhoneContextValue | undefined>(undefined);

function readStoredPhone(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.phone) ?? "";
  } catch {
    return "";
  }
}

export function PhoneProvider({ children }: { children: ReactNode }) {
  const [phone, setPhoneState] = useState<string>(() => readStoredPhone());

  useEffect(() => {
    try {
      if (phone) localStorage.setItem(STORAGE_KEYS.phone, phone);
      else localStorage.removeItem(STORAGE_KEYS.phone);
    } catch {
      /* ignore storage errors (private mode) */
    }
  }, [phone]);

  const setPhone = useCallback((value: string) => {
    setPhoneState(value.trim());
  }, []);

  const clearPhone = useCallback(() => setPhoneState(""), []);

  const value = useMemo<PhoneContextValue>(
    () => ({ phone, hasPhone: phone.length > 0, setPhone, clearPhone }),
    [phone, setPhone, clearPhone],
  );

  return <PhoneContext.Provider value={value}>{children}</PhoneContext.Provider>;
}

export function usePhone(): PhoneContextValue {
  const ctx = useContext(PhoneContext);
  if (!ctx) throw new Error("usePhone must be used within a PhoneProvider");
  return ctx;
}