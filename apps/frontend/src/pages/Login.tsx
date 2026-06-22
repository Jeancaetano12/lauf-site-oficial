import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaArrowLeft, FaEnvelope, FaLock } from "react-icons/fa";
import roboPcImg from "../assets/img-robo-pc.png";

export default function Login() {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate("/hub");
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(matricula, senha);
      navigate("/hub");
    } catch (error) {
      // Ideal seria um Toast de erro (ex: react-toastify)
      alert("Falha no login. Verifique sua matrícula e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-white flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-purple/10 blur-[120px] rounded-full"></div>

      <Link
        to="/"
        className="absolute top-8 left-8 z-50 flex items-center gap-2 bg-brand-purple hover:bg-brand-purple-hover text-white px-3 py-1.5 text-sm rounded-lg font-semibold transition-all hover:scale-105 shadow-md shadow-brand-purple/20"
      >
        <FaArrowLeft /> Voltar
      </Link>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-brand-purple/20 blur-[40px] rounded-full z-0"></div>
            <img 
              src={roboPcImg} 
              alt="Robô de Login LAUF" 
              className="relative z-10 w-32 md:w-40 object-contain drop-shadow-[0_0_15px_rgba(110,64,201,0.3)] transition-transform duration-700 hover:scale-110 hover:-translate-y-3" 
            />
          </div>
          <h1 className="text-4xl font-bold mb-2">Bem-vindo de volta</h1>
          <p className="text-brand-gray-medium">Acesse o portal da Liga de Arduino</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-gray-medium ml-1">Matrícula</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-medium">
                <FaEnvelope className="text-sm" />
              </span>
              <input
                type="text"
                placeholder="00000000"
                maxLength={9}
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full bg-brand-gray-medium/10 border border-brand-gray-medium/20 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple transition-colors placeholder:text-brand-gray-medium/40"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-gray-medium ml-1">Senha</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-medium">
                <FaLock className="text-sm" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-brand-gray-medium/10 border border-brand-gray-medium/20 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple transition-colors placeholder:text-brand-gray-medium/40"
                required
              />
            </div>
            <div className="text-right">
              <Link to="/recuperar-senha" title="Em breve" className="text-xs text-brand-purple hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isAuthLoading}
            className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white py-4 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Entrando...
              </div>
            ) : (
              "Entrar no Portal"
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-brand-gray-medium">
          Ainda não faz parte?{" "}
          <Link to="/solicitar-inscricao" className="text-brand-purple font-semibold hover:underline">
            Solicite sua inscrição
          </Link>
        </p>
      </div>
    </div>
  );
}
