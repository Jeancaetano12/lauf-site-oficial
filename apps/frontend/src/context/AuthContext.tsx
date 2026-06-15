"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "../services/api";

export interface DecodedToken {
    sub: string;
    nome: string;
    email: string;
    id: string; // no backend id é o mesmo que sub
    matricula: string;
    telefone: string;
    cargo: string;
    genero: string;
    curso: string;
}

interface SolicitarInscricaoData {
    nome: string;
    email: string;
    matricula: string;
    telefone: string;
    curso: string;
    cargoPretendido: string;
    genero: string;
}

interface SolicitarRecuperacaoSenhaData {
    matricula: string;
    email: string;
}

interface RedefinirSenhaData {
    tokenRecuperacaoSenha: string;
    novaSenha: string;
}

interface ConcluirCadastroData {
    tokenRegistro: string;
    senha: string;
}

interface AuthContextData {
    user: DecodedToken | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (matricula: string, senha: string) => Promise<void>;
    logout: () => void;
    solicitarInscricao: (data: SolicitarInscricaoData) => Promise<any>;
    concluirCadastro: (data: ConcluirCadastroData) => Promise<any>;
    solicitarRecuperacaoSenha: (data: SolicitarRecuperacaoSenhaData) => Promise<any>;
    redefinirSenha: (data: RedefinirSenhaData) => Promise<any>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Ao iniciar a aplicação, verifica se há uma sessão válida através dos cookies
        const checkSession = async () => {
            try {
                // Valida a sessão e recupera os dados do usuário via cookie HTTP-Only
                const response = await api.post("/auth/validar-sessao");
                if (response.data?.usuario) {
                    setUser({ ...response.data.usuario, sub: response.data.usuario.id });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Nenhuma sessão válida encontrada", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    async function login(matricula: string, senha: string) {
        try {
            const response = await api.post("/auth/login", {
                matricula,
                senha,
            });

            // O backend envia os tokens via cookies HTTP-Only automaticamente
            // Recebemos o usuário na resposta
            const usuario = response.data.usuario;
            
            setUser({ ...usuario, sub: usuario.id });
        } catch (error) {
            console.error("Falha no login", error);
            throw error; // Lança o erro para ser tratado pela tela de Login (ex: exibir toast)
        }
    }

    async function logout() {
        try {
            // Chama a rota de logout que irá limpar os cookies
            await api.post("/auth/logout");

            setUser(null);
            window.location.href = "/login";
        } catch (error) {
            console.error("Falha no logout", error)
        }
    }

    async function solicitarInscricao(data: SolicitarInscricaoData) {
        try {
            const response = await api.post("/auth/solicitar-inscricao", data);
            return response.data;
        } catch (error) {
            console.error("Falha ao solicitar inscrição", error);
            throw error;
        }
    }

    async function solicitarRecuperacaoSenha(data: SolicitarRecuperacaoSenhaData) {
        try {
            const response = await api.post("/auth/solicitar-recuperacao-senha", data);
            return response.data;
        } catch (error) {
            console.error("Falha ao solicitar recuperação de senha", error);
            throw error;
        }
    }

    async function redefinirSenha(data: RedefinirSenhaData) {
        try {
            const response = await api.post("/auth/redefinir-senha", data);
            return response.data;
        } catch (error) {
            console.error("Falha ao redefinir senha", error);
            throw error;
        }
    }

    async function concluirCadastro(data: ConcluirCadastroData) {
        try {
            const response = await api.post("/auth/concluir-cadastro", data);
            return response.data;
        } catch (error) {
            console.error("Falha ao concluir cadastro", error);
            throw error;
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                solicitarInscricao,
                concluirCadastro,
                solicitarRecuperacaoSenha,
                redefinirSenha,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
}