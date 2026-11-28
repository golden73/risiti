import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import LandingPage from "@/pages/public/LandingPage";
import VerifyLandingPage from "@/pages/public/VerifyLandingPage";
import CustomerDashboard from "@/pages/customer/CustomerDashboard";
import VerifyReceiptPage from "@/pages/customer/VerifyReceiptPage";
import ScanQRPage from "@/pages/customer/ScanQRPage";
import RewardsBalancePage from "@/pages/customer/RewardsBalancePage";
import MarketplacePage from "@/pages/customer/MarketplacePage";
import RedeemPage from "@/pages/customer/RedeemPage";
import HistoryPage from "@/pages/customer/HistoryPage";
import ReportNoReceiptPage from "@/pages/customer/ReportNoReceiptPage";
import UssdSimulatorPage from "@/pages/customer/UssdSimulatorPage";
import MerchantDashboard from "@/pages/merchant/MerchantDashboard";
import ZraDashboard from "@/pages/zra/ZraDashboard";
import NotFoundPage from "@/pages/NotFoundPage";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        <Route
          path="/"
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          }
        />
        <Route path="/verify" element={<VerifyLandingPage />} />

        <Route
          path="/app"
          element={
            <CustomerLayout>
              <CustomerDashboard />
            </CustomerLayout>
          }
        />
        <Route
          path="/app/verify"
          element={
            <CustomerLayout>
              <VerifyReceiptPage />
            </CustomerLayout>
          }
        />
        <Route
          path="/app/scan"
          element={
            <CustomerLayout>
              <ScanQRPage />
            </CustomerLayout>
          }
        />
        <Route
          path="/app/rewards"
          element={
            <CustomerLayout>
              <RewardsBalancePage />
            </CustomerLayout>
          }
        />
        <Route
          path="/app/marketplace"
          element={
            <CustomerLayout>
              <MarketplacePage />
            </CustomerLayout>
          }
        />
        <Route
          path="/app/redeem"
          element={
            <CustomerLayout>
              <RedeemPage />
            </CustomerLayout>
          }
        />
        <Route
          path="/app/history"
          element={
            <CustomerLayout>
              <HistoryPage />
            </CustomerLayout>
          }
        />
        <Route
          path="/app/report"
          element={
            <CustomerLayout>
              <ReportNoReceiptPage />
            </CustomerLayout>
          }
        />
        <Route
          path="/app/ussd"
          element={
            <CustomerLayout>
              <UssdSimulatorPage />
            </CustomerLayout>
          }
        />

        <Route path="/merchant" element={<MerchantDashboard />} />
        <Route path="/zra" element={<ZraDashboard />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}