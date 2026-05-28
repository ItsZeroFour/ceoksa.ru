import {
  lazy,
  Suspense,
  useState,
  useEffect,
  createContext,
  useContext,
} from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import useDisableScroll from "./hooks/useDisableScroll";
import { ThemeProvider } from "./context/ThemeContext";
import { fetchMe } from "./redux/slices/auth/authSlice";

import Auth from "./components/auth/Auth";
import Cookies from "./components/cookies/Cookies";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Header from "./components/header/Header";

const Main = lazy(() => import("./pages/main/Main"));
const Footer = lazy(() => import("./components/footer/Footer"));
const Policy = lazy(() => import("./pages/policy/Policy"));
const UserAgreement = lazy(() =>
  import("./pages/user_agreement/UserAgreement")
);

const LoanApplication = lazy(() =>
  import("./pages/account/loan_application/LoanApplication")
);
const Credits = lazy(() => import("./pages/account/credits/Credits"));
const MyCredits = lazy(() => import("./pages/account/my_credits/MyCredits"));
const Rating = lazy(() => import("./pages/account/rating/Rating"));
const Profile = lazy(() => import("./pages/account/profile/Profile"));
const Repayment = lazy(() => import("./pages/account/repayment/Repayment"));
const SbpTransfer = lazy(() =>
  import("./pages/account/sbp_transfer/SbpTransfer")
);
const CardTransfer = lazy(() =>
  import("./pages/account/card_transfer/CardTransfer")
);
const PaymentSchedule = lazy(() =>
  import("./pages/account/payment_schedule/PaymentSchedule")
);
const CertificateOrder = lazy(() =>
  import("./pages/account/certificate_order/CertificateOrder")
);
const PartialRepayment = lazy(() =>
  import("./pages/account/partial_repayment/PartialRepayment")
);
const FullRepayment = lazy(() =>
  import("./pages/account/full_repayment/FullRepayment")
);
const Notifications = lazy(() =>
  import("./pages/account/notifications/Notifications")
);
const NotificationDetail = lazy(() =>
  import("./pages/account/notification_detail/NotificationDetail")
);
const PersonalData = lazy(() => import("./pages/account/files/PersonalData"));
const ADS = lazy(() => import("./pages/account/files/ADS"));

export const MenuContext = createContext();
export const useMenu = () => useContext(MenuContext);

const Loading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "50vh",
    }}
  >
    Загрузка...
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, status } = useSelector((state) => state.auth);
  const userData = user?.data ?? null;

  if (status === "idle" || status === "loading") return <Loading />;
  if (status !== "succeeded" || !userData) return <Navigate to="/" replace />;

  return children;
};

const protectedRoutes = [
  {
    path: "/account/loan_applications",
    element: LoanApplication,
    needsUser: true,
  },
  { path: "/account/credits", element: Credits },
  { path: "/account/my-credits", element: MyCredits },
  { path: "/account/my-credits/repayment", element: Repayment },
  {
    path: "/account/my-credits/sbp-transfer",
    element: SbpTransfer,
    needsUser: true,
  },
  { path: "/account/my-credits/card-transfer", element: CardTransfer },
  { path: "/account/my-credits/schedule", element: PaymentSchedule },
  {
    path: "/account/my-credits/certificates",
    element: CertificateOrder,
    needsUser: true,
  },
  { path: "/account/my-credits/partial-repayment", element: PartialRepayment },
  { path: "/account/my-credits/full-repayment", element: FullRepayment },
  { path: "/account/rating", element: Rating },
  { path: "/account/profile", element: Profile, needsUser: true },
  { path: "/account/notifications", element: Notifications },
  { path: "/account/notifications/:id", element: NotificationDetail },
];

const publicRoutes = [
  { path: "/privacy-policy", element: Policy },
  { path: "/polzovatelskoe-soglashenie", element: UserAgreement },
  { path: "/soglasie-na-obrabotku-personalnyh-dannyh", element: PersonalData },
  { path: "/soglasie-na-poluchenie-reklamy", element: ADS },
];

function App() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openAuthMenu, setOpenAuthMenu] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  const { user, status: userStatus } = useSelector((state) => state.auth);
  const userData = user?.data ?? null;

  const scrollToBlock = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useDisableScroll(openMenu);

  return (
    <ThemeProvider>
      <MenuContext.Provider value={{ openMenu, setOpenMenu }}>
        <div className="App">
          <Suspense fallback={<Loading />}>
            <div className="wrapper">
              <div className="header__container">
                <Header
                  setOpenAuthMenu={setOpenAuthMenu}
                  userData={userData}
                  userStatus={userStatus}
                />
              </div>

              {openAuthMenu && <Auth setOpenAuthMenu={setOpenAuthMenu} />}

              <main>
                <ScrollToTop />
                <Routes>
                  {/* Main page */}
                  <Route
                    path="/"
                    element={
                      <Main
                        scrollToBlock={scrollToBlock}
                        setOpenAuthMenu={setOpenAuthMenu}
                        openAuthMenu={openAuthMenu}
                      />
                    }
                  />

                  {/* Protected account routes */}
                  {protectedRoutes.map(
                    ({ path, element: Element, needsUser }) => (
                      <Route
                        key={path}
                        path={path}
                        element={
                          <ProtectedRoute>
                            <Element {...(needsUser ? { userData } : {})} />
                          </ProtectedRoute>
                        }
                      />
                    )
                  )}

                  {/* Public routes */}
                  {publicRoutes.map(({ path, element: Element }) => (
                    <Route key={path} path={path} element={<Element />} />
                  ))}
                </Routes>
              </main>

              <Cookies />
              <Footer />
            </div>
          </Suspense>
        </div>
      </MenuContext.Provider>
    </ThemeProvider>
  );
}

export default App;
