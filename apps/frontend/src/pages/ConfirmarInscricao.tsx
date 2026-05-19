"use client";

import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { FaLock, FaArrowLeft } from "react-icons/fa";
import { GoCpu } from "react-icons/go";
import { useAuth } from "../context/AuthContext";

export default function ConfirmarInscricao() {
    const [searchParams] = useSearchParams();
    const tokenRegistro = searchParams.get("token");
    const navigate = useNavigate();
    const { concluirCadastro } = useAuth();
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        if (!tokenRegistro) {
            setMessage({ type: "error", text: "Token de inscrição ausente ou inválido." });
            return;
        }

        if (senha !== confirmarSenha) {
            setMessage({ type: "error", text: "As senhas não coincidem." });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            await concluirCadastro({ tokenRegistro, senha });
            setMessage({ type: "success", text: "Inscrição concluída com sucesso! Clique no botão abaixo para fazer login." });
            // Aguarda 2 segundos e redireciona para login
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            setMessage({ type: "error", text: "Token inválido ou expirado. Clique no botão abaixo para fazer login." });
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
                className="absolute top-8 left-8 flex items-center gap-2 text-brand-gray-medium hover:text-brand-white transition-colors"
            >
                <FaArrowLeft /> Voltar para o início
            </Link>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-brand-purple/10 rounded-2xl border border-brand-purple/20 mb-6">
                        <GoCpu className="text-5xl text-brand-purple" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Conclua seu cadastro</h1>
                    <p className="text-brand-gray-medium">Digite sua nova senha abaixo.</p>
                </div>

                {message && (
                    <div className={`mb-4 p-4 rounded-xl border ${message.type === "success"
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-gray-medium ml-1">Nova Senha</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-medium">
                                <FaLock className="text-sm" />
                            </span>
                            <input
                                type="password"
                                placeholder="Digite sua nova senha"
                                value={senha}
                                onChange={(e) => {
                                    setSenha(e.target.value);
                                    setMessage(null); // Limpa mensagem ao digitar
                                }}
                                className="w-full bg-brand-gray-medium/10 border border-brand-gray-medium/20 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple transition-colors placeholder:text-brand-gray-medium/40"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-gray-medium ml-1">Confirmar Nova Senha</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-medium">
                                <FaLock className="text-sm" />
                            </span>
                            <input
                                type="password"
                                placeholder="Confirme sua nova senha"
                                value={confirmarSenha}
                                onChange={(e) => {
                                    setConfirmarSenha(e.target.value);
                                    setMessage(null);
                                }}
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
                        {loading ? "Confirmando..." : "Confirmar Inscrição"}
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