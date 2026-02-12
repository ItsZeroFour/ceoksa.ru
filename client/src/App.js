import { lazy, Suspense, useState, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoanApplication from "./pages/account/loan_application/LoanApplication";
import useDisableScroll from "./hooks/useDisableScroll";
import Credits from "./pages/account/credits/Credits";
import Rating from "./pages/account/rating/Rating";
import Profile from "./pages/account/profile/Profile";
import { ThemeProvider } from "./context/ThemeContext";
import Auth from "./components/auth/Auth";
import Policy from "./pages/policy/Policy";
import UserAgreement from "./pages/user_agreement/UserAgreement";
import PersonalData from "./pages/account/files/PersonalData";
import ADS from "./pages/account/files/ADS";
import Cookies from "./components/cookies/Cookies";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "./redux/slices/auth/authSlice";

const Header = lazy(() => import("./components/header/Header"));
const Main = lazy(() => import("./pages/main/Main"));
const Footer = lazy(() => import("./components/footer/Footer"));

function App() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openAuthMenu, setOpenAuthMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  const user = useSelector((state) => state.auth);

  useEffect(() => {
    if (user.status === "succeeded" && user.user) {
      setUserData(user.user.data);
    }

    // if (
    //   user.status !== "succeeded" &&
    //   !user.user &&
    //   location.pathname.startsWith("/account")
    // ) {
    //   return <Navigate to="/" replace />;
    // }
  }, [user]);

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
        <Suspense>
          <div className="wrapper">
            <div className="header__container">
              <Header
                setOpenMenu={setOpenMenu}
                openMenu={openMenu}
                setOpenAuthMenu={setOpenAuthMenu}
              />
            </div>

            {openAuthMenu && <Auth setOpenAuthMenu={setOpenAuthMenu} />}

            <main>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Main
                      scrollToBlock={scrollToBlock}
                      setOpenAuthMenu={setOpenAuthMenu}
                    />
                  }
                />
                {user.status === "succeeded" && userData !== null && (
                  <>
                    <Route
                      path="/account/loan_applications"
                      element={
                        <LoanApplication
                          setOpenMenu={setOpenMenu}
                          openMenu={openMenu}
                          userData={userData}
                        />
                      }
                    />
                    <Route
                      path="/account/credits"
                      element={
                        <Credits
                          setOpenMenu={setOpenMenu}
                          openMenu={openMenu}
                        />
                      }
                    />
                    <Route
                      path="/account/rating"
                      element={
                        <Rating setOpenMenu={setOpenMenu} openMenu={openMenu} />
                      }
                    />
                    <Route
                      path="/account/profile"
                      element={
                        <Profile
                          setOpenMenu={setOpenMenu}
                          openMenu={openMenu}
                        />
                      }
                    />
                  </>
                )}

                <Route path="/privacy-policy" element={<Policy />} />
                <Route
                  path="/polzovatelskoe-soglashenie"
                  element={<UserAgreement />}
                />

                {/* Files */}
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
