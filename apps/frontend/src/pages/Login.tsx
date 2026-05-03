import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaEnvelope, FaLock } from "react-icons/fa";
import { GoCpu } from "react-icons/go";

export default function Login() {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { matricula, senha });
    // Lógica de login será integrada aqui
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-white flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-purple/10 blur-[120px] rounded-full"></div>

      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-brand-gray-medium hover:text-brand-white transition-colors"
      >
        <FaArrowLeft /> Voltar para o início
      </Link>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-brand-purple/10 rounded-2xl border border-brand-purple/20 mb-6">
            <GoCpu className="text-5xl text-brand-purple" />
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
            className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white py-4 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-purple/20"
          >
            Entrar no Portal
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
