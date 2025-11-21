import { Route, Routes } from "react-router-dom";
import Header from "./components/header/Header";
import Main from "./pages/main/Main";
import Footer from "./components/footer/Footer";

function App() {
  return (
    <div className="App">
      <div className="wrapper">
        <Header />

        <Routes>
          <Route path="/" element={<Main />} />
        </Routes>

        <Footer />
      </div>
    </div>
  );
}

export default App;
