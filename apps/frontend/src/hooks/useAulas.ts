import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export interface Aula {
    id: string;
    titulo: string;
    local: string;
    status: 'AGENDADA' | 'CONCLUIDA' | 'CANCELADA';
    dataHora: string;
    professor: {
        nome: string;
    };
}

export interface Professor {
    id: string;
    nome: string;
}

export interface CriarAulaDTO {
    professorId: string;
    titulo: string;
    local: string;
    status: 'AGENDADA' | 'CONCLUIDA' | 'CANCELADA';
    dataHora: string; // ISO String
}

// Variável global para armazenar o cache e evitar requests repetidos na navegação
let globalAulas: Aula[] | null = null;
let globalProfessores: Professor[] | null = null;

export function useAulas() {
    const [aulas, setAulas] = useState<Aula[]>(globalAulas || []);
    const [professores, setProfessores] = useState<Professor[]>(globalProfessores || []);
    const [isLoading, setIsLoading] = useState(globalAulas === null);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAulas = useCallback(async (force = false) => {
        // Se não for forced e já tiver cache, apenas retorna
        if (!force && globalAulas !== null) {
            setAulas(globalAulas);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/aulas');
            globalAulas = response.data; // Atualiza o cache
            setAulas(response.data);
        } catch (err: any) {
            if (err.response?.status === 404) {
                globalAulas = [];
                setAulas([]);
            } else {
                setError(err.response?.data?.message || 'Erro ao buscar as aulas.');
                console.error("Falha ao buscar aulas:", err);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchProfessores = useCallback(async () => {
        setIsLoading(true);
        setError(null)
        if (globalProfessores !== null) {
            setProfessores(globalProfessores);
            setIsLoading(false);
            return;
        }
        try {
            const response = await api.get('/aulas/professores');
            globalProfessores = response.data;
            setProfessores(response.data);
        } catch (err) {
            console.error("Falha ao buscar professores:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const criarAula = async (dados: CriarAulaDTO) => {
        setIsCreating(true);
        setError(null);
        try {
            await api.post('/aulas', dados);
            await fetchAulas(true); // Recarrega a lista após criar
            return true;
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Erro  desconhecido ao agendar aula.';
            setError(msg);
            throw new Error(msg);
        } finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        fetchAulas();
    }, [fetchAulas]);

    return {
        aulas,
        professores,
        isLoading,
        isCreating,
        error,
        refetch: () => fetchAulas(true),
        fetchProfessores,
        criarAula
    };
}
