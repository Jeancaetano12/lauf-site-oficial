import { useState, useCallback } from 'react';
import { api } from '../services/api';

// Para o formulario de inscrição
interface SolicitarInscricaoData {
    nome: string;
    email: string;
    matricula: string;
    telefone: string;
    curso: string;
    cargoPretendido: string;
    genero: string;
}

export interface SolicitacaoInscricao {
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
    curso?: string;
    genero?: string;
    matricula: string;
    cargoPretendido: string;
    status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
    criadoEm: string;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export function useSolicitacoes() {
    const [solicitacoes, setSolicitacoes] = useState<SolicitacaoInscricao[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const buscarSolicitacoes = useCallback(async (status?: 'PENDENTE' | 'APROVADA' | 'REJEITADA', page: number = 1, limit: number = 10) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                ...(status && { status }),
                page,
                limit
            };
            const response = await api.get('/usuarios/solicitacoes', { params });
            setSolicitacoes(response.data.data);
            setMeta(response.data.meta);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao buscar solicitações.');
            console.error("Falha ao buscar solicitações:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    async function solicitarInscricao(data: SolicitarInscricaoData) {
        setIsLoading(true)
        setError(null)
        try {
            const response = await api.post("/auth/solicitar-inscricao", data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao solicitar inscrição.');
            console.error("Falha ao solicitar inscrição", err);
        } finally {
            setIsLoading(false);
        }
    }

    async function aprovarSolicitacao(id: string) {
        setIsLoading(true)
        setError(null)
        try {
            const response = await api.patch(`/auth/solicitacoes/${id}/aprovar`)
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao aprovar solicitação.');
            console.error("Falha ao aprovar solicitação", err);
        } finally {
            setIsLoading(false);
        }
    }

    async function reprovarSolicitacao(id: string) {
        setIsLoading(true)
        setError(null)
        try {
            const response = await api.patch(`/auth/solicitacoes/${id}/reprovar`)
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao reprovar solicitação.');
            console.error("Falha ao reprovar solicitação", err);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        solicitacoes,
        meta,
        isLoading,
        error,
        buscarSolicitacoes,
        solicitarInscricao,
        aprovarSolicitacao,
        reprovarSolicitacao
    };
}
