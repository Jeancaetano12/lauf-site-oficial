import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
// Componentes Globais
import ProtectedRoute from "./components/ProtectedRoute";
import HubLayout from "./layouts/HubLayout";
import { AuthProvider } from "./context/AuthContext";
// Paginas
import Home from "./pages/Home";
import Login from "./pages/Login";
import SolicitarInscricao from "./pages/SolicitarInscricao";
import LaufHub from "./pages/LaufHub";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import ConfirmarInscricao from "./pages/ConfirmarInscricao";
import Aulas from "./pages/Aulas";
import Perfil from "./pages/Perfil";
import Solicitacoes from "./pages/Solicitacoes";
import Configuracoes from "./pages/Configuracoes";
import AulaDetalhes from "./pages/AulasDetalhes";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/solicitar-inscricao" element={<SolicitarInscricao />} />
          <Route path="/confirmar-inscricao" element={<ConfirmarInscricao />} />
          {/* Rota Pai que carrega o Layout de Navegação */}
          <Route
            element={
              <ProtectedRoute>
                <HubLayout />
              </ProtectedRoute>
            }
          >
            {/* Todas as rotas que precisam do menu lateral/bottom-bar entram aqui como filhas */}
            <Route path="/hub" element={<LaufHub />} />
            <Route path="/aulas" element={<Aulas />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/solicitacoes" element={<Solicitacoes />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/aulas/:id" element={<AulaDetalhes />} />
            {/* <Route path="/calendario" element={<Calendario />} /> */}
          </Route>
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;