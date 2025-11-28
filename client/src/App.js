import { lazy, Suspense, useState } from "react";
import { Route, Routes } from "react-router-dom";
import LoanApplication from "./pages/account/loan_application/LoanApplication";
import useDisableScroll from "./hooks/useDisableScroll";
import Credits from "./pages/account/credits/Credits";

const Header = lazy(() => import("./components/header/Header"));
const Main = lazy(() => import("./pages/main/Main"));
const Footer = lazy(() => import("./components/footer/Footer"));

function App() {
  const [openMenu, setOpenMenu] = useState(false);

  const scrollToBlock = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useDisableScroll(openMenu);

  return (
    <div className="App">
      <Suspense>
        <div className="wrapper">
          <div className="header__container">
            <Header setOpenMenu={setOpenMenu} openMenu={openMenu} />
          </div>

          <main>
            <Routes>
              <Route
                path="/"
                element={<Main scrollToBlock={scrollToBlock} />}
              />
              <Route
                path="/account/loan_applications"
                element={
                  <LoanApplication
                    setOpenMenu={setOpenMenu}
                    openMenu={openMenu}
                  />
                }
              />
              <Route
                path="/account/credits"
                element={
                  <Credits setOpenMenu={setOpenMenu} openMenu={openMenu} />
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </Suspense>
    </div>
  );
}

export default App;
