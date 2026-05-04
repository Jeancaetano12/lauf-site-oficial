"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "../services/api";

export interface DecodedToken {
    sub: string;
    nome: string;
    email: string;
    id: string; // no backend id é o mesmo que sub
    matricula: string;
    telefone: string;
    cargo: string;
}

interface SolicitarInscricaoData {
    nome: string;
    email: string;
    matricula: string;
    telefone: string;
    curso: string;
    cargoPretendido: string;
}

interface SolicitarRecuperacaoSenhaData {
    matricula: string;
    email: string;
}

interface AuthContextData {
    user: DecodedToken | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (matricula: string, senha: string) => Promise<void>;
    logout: () => void;
    solicitarInscricao: (data: SolicitarInscricaoData) => Promise<any>;
    solicitarRecuperacaoSenha: (data: SolicitarRecuperacaoSenhaData) => Promise<any>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<DecodedToken | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Ao iniciar a aplicação, recupera o token salvo e restaura a sessão
        const loadStorageData = () => {
            const storageAccessToken = localStorage.getItem("@Lauf:accessToken");
            const storageRefreshToken = localStorage.getItem("@Lauf:refreshToken");

            if (storageAccessToken && storageRefreshToken) {
                try {
                    const decoded = jwtDecode<DecodedToken>(storageAccessToken);
                    // Adicionamos o id com base no sub para manter consistência
                    setUser({ ...decoded, id: decoded.sub });
                } catch (error) {
                    console.error("Erro ao decodificar o token salvo", error);
                    // Se falhou por algum motivo de estrutura, limpa
                    logout();
                }
            }
            setIsLoading(false);
        };

        loadStorageData();
    }, []);

    async function login(matricula: string, senha: string) {
        try {
            const response = await api.post("/auth/login", {
                matricula,
                senha,
            });

            const { accessToken, refreshToken } = response.data;

            localStorage.setItem("@Lauf:accessToken", accessToken);
            localStorage.setItem("@Lauf:refreshToken", refreshToken);

            const decoded = jwtDecode<DecodedToken>(accessToken);
            setUser({ ...decoded, id: decoded.sub });
        } catch (error) {
            console.error("Falha no login", error);
            throw error; // Lança o erro para ser tratado pela tela de Login (ex: exibir toast)
        }
    }

    function logout() {
        localStorage.removeItem("@Lauf:accessToken");
        localStorage.removeItem("@Lauf:refreshToken");
        setUser(null);
        window.location.href = "/login";
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

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                solicitarInscricao,
                solicitarRecuperacaoSenha,
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