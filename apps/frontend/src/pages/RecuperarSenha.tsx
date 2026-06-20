import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaEnvelope, FaLock } from "react-icons/fa";
import { GoCpu } from "react-icons/go";
import { useAuth } from "../context/AuthContext";

export default function RecuperarSenha() {
    const [matricula, setMatricula] = useState("")
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const { solicitarRecuperacaoSenha } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await solicitarRecuperacaoSenha({ matricula, email });
            alert("Solicitação enviada, verifique seu email para continuar.");
        } catch (error) {
            alert("Erro ao solicitar recuperação de senha");
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
                to="/login"
                className="absolute top-8 left-8 z-50 flex items-center gap-2 bg-brand-purple hover:bg-brand-purple-hover text-white px-3 py-1.5 text-sm rounded-lg font-semibold transition-all hover:scale-105 shadow-md shadow-brand-purple/20"
            >
                <FaArrowLeft /> Voltar
            </Link>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-brand-purple/10 rounded-2xl border border-brand-purple/20 mb-6">
                        <GoCpu className="text-5xl text-brand-purple" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Recuperar senha</h1>
                    <p className="text-brand-gray-medium">Solicite a criação de uma nova senha.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-gray-medium ml-1">Sua Matrícula</label>
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
                        <label className="text-sm font-medium text-brand-gray-medium ml-1">Seu email</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-medium">
                                <FaLock className="text-sm" />
                            </span>
                            <input
                                type="email"
                                placeholder="fulano@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-brand-gray-medium/10 border border-brand-gray-medium/20 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple transition-colors placeholder:text-brand-gray-medium/40"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white py-4 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Enviando..." : "Enviar solicitação"}
                    </button>
                </form>
                <div className="text-center mt-6">
                    <Link to="/login" title="Voltar para Login" className="text-sm text-brand-purple hover:underline">
                        Voltar para Login
                    </Link>
                </div>
            </div>
        </div>
    );
}