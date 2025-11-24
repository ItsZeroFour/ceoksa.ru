import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const Header = lazy(() => import("./components/header/Header"));
const Main = lazy(() => import("./pages/main/Main"));
const Footer = lazy(() => import("./components/footer/Footer"));

function App() {
  const scrollToBlock = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="App">
      <Suspense>
        <div className="wrapper">
          <Header />

          <Routes>
            <Route path="/" element={<Main scrollToBlock={scrollToBlock} />} />
          </Routes>

          <Footer />
        </div>
      </Suspense>
    </div>
  );
}

export default App;
