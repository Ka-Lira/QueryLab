import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Parte1 from "./pages/Parte1";

/* home */
import Home from "./pages/Home";

function App() {
  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      <Navbar />

      {/* contenido */}
      <main className="pt-16">
        <Routes>
          {/* se estemos en '/', muestre home-page */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/parte1" element={<Parte1 />} />




        </Routes>
      </main>
    </div>
  );
};

export default App;