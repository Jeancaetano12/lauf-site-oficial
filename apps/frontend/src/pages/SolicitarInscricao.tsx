import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUser, FaEnvelope, FaIdCard, FaPhone, FaGraduationCap } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function SolicitarInscricao() {
  const { solicitarInscricao } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [telefone, setTelefone] = useState("");
  const [curso, setCurso] = useState("");
  const [cargo, setCargo] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await solicitarInscricao({ nome, email, matricula, telefone, curso, cargoPretendido: cargo });
      setMessage("Inscrição solicitada com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("Error requesting registration:", error);
      setMessage("Erro ao solicitar inscrição. Tente novamente.");
    }
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

      <div className="w-full max-w-2xl z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4">Solicite sua Inscrição</h1>
          <p className="text-brand-text/70 max-w-md mx-auto">
            Preencha os dados abaixo para que a coordenação da LAUF possa avaliar seu perfil.
          </p>

          {message && (
            <div className={`mb-4 p-4 rounded-xl border ${message === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}>
              {message}
            </div>
          )}
        </div>

        <div className="bg-brand-gray-light border border-brand-gray-medium p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-brand-black/5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-purple ml-1">Nome Completo</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-purple/50">
                  <FaUser className="text-sm" />
                </span>
                <input
                  type="text"
                  name="nome"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-white text-brand-black border border-brand-gray-medium rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-purple ml-1">E-mail Pessoal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-purple/50">
                  <FaEnvelope className="text-sm" />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="exemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-brand-black border border-brand-gray-medium rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-purple ml-1">Matrícula</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-purple/50">
                  <FaIdCard className="text-sm" />
                </span>
                <input
                  type="text"
                  name="matricula"
                  placeholder="00000000"
                  maxLength={9}
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="w-full bg-white text-brand-black border border-brand-gray-medium rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-purple ml-1">Telefone / WhatsApp</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-purple/50">
                  <FaPhone className="text-sm" />
                </span>
                <input
                  type="tel"
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  maxLength={11}
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full bg-white text-brand-black border border-brand-gray-medium rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-purple ml-1">Seu Curso</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-purple/50">
                  <FaGraduationCap className="text-sm" />
                </span>
                <select
                  name="curso"
                  value={curso}
                  onChange={(e) => setCurso(e.target.value)}
                  className="w-full bg-white text-brand-black border border-brand-gray-medium rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all appearance-none"
                  required
                >
                  <option value="" disabled>Selecione seu curso</option>
                  <option value="ANALISE_E_DESENVOLVIMENTO_DE_SISTEMAS">Análise e Desenvolvimento de Sistemas</option>
                  <option value="BANCO_DE_DADOS">Banco de Dados</option>
                  <option value="CIENCIAS_AERONAUTICAS">Ciências Aeronáuticas</option>
                  <option value="ENGENHARIA_DA_COMPUTACAO">Engenharia da Computação</option>
                  <option value="GESTAO_DA_TECNOLOGIA_DA_INFORMACAO">Gestão da Tecnologia da Informação</option>
                  <option value="JOGOS_DIGITAIS">Jogos Digitais</option>
                  <option value="SEGURANCA_DA_INFORMACAO">Segurança da Informação</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-purple ml-1">Cargo Pretendido</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-purple/50">
                  <FaGraduationCap className="text-sm" />
                </span>
                <select
                  name="cargo"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full bg-white text-brand-black border border-brand-gray-medium rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all appearance-none"
                  required
                >
                  <option value="" disabled>Selecione o cargo</option>
                  <option value="ALUNO">Aluno</option>
                  <option value="PROFESSOR">Professor</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2 pt-6">
              <button
                type="submit"
                className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white py-4 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-purple/20"
              >
                Enviar Solicitação
              </button>
              <p className="text-center text-brand-black text-sm text-brand-text/50 mt-6 px-4">
                Ao enviar, você concorda que seus dados serão analisados pelos coordenadores da liga para fins de recrutamento.
              </p>
            </div>
          </form>
        </div>

        <p className="text-center mt-12 text-brand-text/60">
          Já tem acesso?{" "}
          <Link to="/login" className="text-brand-purple font-bold hover:underline">
            Fazer Login
          </Link>
        </p>
      </div>
    </div>
  );
}
