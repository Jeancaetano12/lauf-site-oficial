import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SolicitarInscricao from "./pages/SolicitarInscricao";
import { AuthProvider } from "./context/AuthContext";
import LaufHub from "./pages/LaufHub";
import RecuperarSenha from "./pages/RecuperarSenha";
import ProtectedRoute from "./components/ProtectedRoute";
import RedefinirSenha from "./pages/RedefinirSenha";
import ConfirmarInscricao from "./pages/ConfirmarInscricao";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/solicitar-inscricao" element={<SolicitarInscricao />} />
          <Route path="/confirmar-inscricao" element={<ConfirmarInscricao />} />
          <Route
            path="/hub"
            element={
              <ProtectedRoute>
                <LaufHub />
              </ProtectedRoute>
            }
          />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;