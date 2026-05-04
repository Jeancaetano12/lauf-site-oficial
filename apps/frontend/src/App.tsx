import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SolicitarInscricao from "./pages/SolicitarInscricao";
import { AuthProvider } from "./context/AuthContext";
import LaufHub from "./pages/LaufHub";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/solicitar-inscricao" element={<SolicitarInscricao />} />
          <Route path="/hub" element={<LaufHub />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;