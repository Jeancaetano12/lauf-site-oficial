import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SolicitarInscricao from "./pages/SolicitarInscricao";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/solicitar-inscricao" element={<SolicitarInscricao />} />
      </Routes>
    </Router>
  );
}

export default App;