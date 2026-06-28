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

export function useAulas() {
    const [aulas, setAulas] = useState<Aula[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAulas = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/aulas');
            setAulas(response.data);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setAulas([]);
            } else {
                setError(err.response?.data?.message || 'Erro ao buscar as aulas.');
                console.error("Falha ao buscar aulas:", err);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAulas();
    }, [fetchAulas]);

    return {
        aulas,
        isLoading,
        error,
        refetch: fetchAulas
    };
}
