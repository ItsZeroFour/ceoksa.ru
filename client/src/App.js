import { lazy, Suspense, useState, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import useDisableScroll from "./hooks/useDisableScroll";
import { ThemeProvider } from "./context/ThemeContext";
import Auth from "./components/auth/Auth";
import Cookies from "./components/cookies/Cookies";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "./redux/slices/auth/authSlice";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Header from "./components/header/Header";
import SbpTransfer from "./pages/account/sbp_transfer/SbpTransfer";

const Main = lazy(() => import("./pages/main/Main"));
const Footer = lazy(() => import("./components/footer/Footer"));
const LoanApplication = lazy(() =>
  import("./pages/account/loan_application/LoanApplication")
);
const Credits = lazy(() => import("./pages/account/credits/Credits"));
const MyCredits = lazy(() => import("./pages/account/my_credits/MyCredits"));
const Rating = lazy(() => import("./pages/account/rating/Rating"));
const Profile = lazy(() => import("./pages/account/profile/Profile"));
const Policy = lazy(() => import("./pages/policy/Policy"));
const UserAgreement = lazy(() =>
  import("./pages/user_agreement/UserAgreement")
);
const PersonalData = lazy(() => import("./pages/account/files/PersonalData"));
const ADS = lazy(() => import("./pages/account/files/ADS"));
const Repayment = lazy(() => import("./pages/account/repayment/Repayment"));

const CardTransfer = lazy(() =>
  import("./pages/account/card_transfer/CardTransfer")
);
const PaymentSchedule = lazy(() =>
  import("./pages/account/payment_schedule/PaymentSchedule")
);
const CertificateOrder = lazy(() =>
  import("./pages/account/certificate_order/CertificateOrder")
);

const ProtectedRoute = ({ children, userData, userStatus }) => {
  if (userStatus === "idle" || userStatus === "loading") {
    return (
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
  }

  if (userStatus !== "succeeded" || !userData) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openAuthMenu, setOpenAuthMenu] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  const user = useSelector((state) => state.auth);
  const userData = user.user?.data ?? null;

  const scrollToBlock = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useDisableScroll(openMenu);

  return (
    <ThemeProvider>
      <div className="App">
        <Suspense fallback={<div>Загрузка...</div>}>
          <div className="wrapper">
            <div className="header__container">
              <Header
                setOpenMenu={setOpenMenu}
                openMenu={openMenu}
                setOpenAuthMenu={setOpenAuthMenu}
                userData={userData}
                userStatus={user.status}
              />
            </div>

            {openAuthMenu && <Auth setOpenAuthMenu={setOpenAuthMenu} />}

            <main>
              <ScrollToTop />

              <Routes>
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

                <Route
                  path="/account/loan_applications"
                  element={
                    <ProtectedRoute
                      userData={userData}
                      userStatus={user.status}
                    >
                      <LoanApplication
                        setOpenMenu={setOpenMenu}
                        openMenu={openMenu}
                        userData={userData}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/credits"
                  element={
                    <ProtectedRoute
                      userData={userData}
                      userStatus={user.status}
                    >
                      <Credits setOpenMenu={setOpenMenu} openMenu={openMenu} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/my-credits/repayment"
                  element={
                    <ProtectedRoute
                      userData={userData}
                      userStatus={user.status}
                    >
                      <Repayment
                        setOpenMenu={setOpenMenu}
                        openMenu={openMenu}
                      />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/account/my-credits/sbp-transfer"
                  element={
                    <ProtectedRoute
                      userData={userData}
                      userStatus={user.status}
                    >
                      <SbpTransfer
                        setOpenMenu={setOpenMenu}
                        openMenu={openMenu}
                        userData={userData}
                      />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/account/my-credits/card-transfer"
                  element={
                    <ProtectedRoute
                      userData={userData}
                      userStatus={user.status}
                    >
                      <CardTransfer
                        setOpenMenu={setOpenMenu}
                        openMenu={openMenu}
                      />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/account/my-credits/schedule"
                  element={
                    <ProtectedRoute
                      userData={userData}
                      userStatus={user.status}
                    >
                      <PaymentSchedule
                        setOpenMenu={setOpenMenu}
                        openMenu={openMenu}
                      />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/account/my-credits/certificates"
                  element={
                    <ProtectedRoute
                      userData={userData}
                      userStatus={user.status}
                    >
                      <CertificateOrder
                        setOpenMenu={setOpenMenu}
                        openMenu={openMenu}
                        userData={userData}
                      />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/account/my-credits"
                  element={
                    <ProtectedRoute
                      userData={userData}
                      userStatus={user.status}
                    >
                      <MyCredits
                        setOpenMenu={setOpenMenu}
                        openMenu={openMenu}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/rating"
                  element={
                    <ProtectedRoute
                      userData={userData}
                      userStatus={user.status}
                    >
                      <Rating setOpenMenu={setOpenMenu} openMenu={openMenu} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/profile"
                  element={
                    <ProtectedRoute
                      userData={userData}
                      userStatus={user.status}
                    >
                      <Profile
                        setOpenMenu={setOpenMenu}
                        openMenu={openMenu}
                        user={userData}
                      />
                    </ProtectedRoute>
                  }
                />

                <Route path="/privacy-policy" element={<Policy />} />
                <Route
                  path="/polzovatelskoe-soglashenie"
                  element={<UserAgreement />}
                />

                <Route
                  path="/soglasie-na-obrabotku-personalnyh-dannyh"
                  element={
                    <PersonalData
                      setOpenMenu={setOpenMenu}
                      openMenu={openMenu}
                    />
                  }
                />
                <Route
                  path="/soglasie-na-poluchenie-reklamy"
                  element={
                    <ADS setOpenMenu={setOpenMenu} openMenu={openMenu} />
                  }
                />
              </Routes>
            </main>

            <Cookies />
            <Footer />
          </div>
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;
