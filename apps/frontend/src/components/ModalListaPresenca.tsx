"use client";
import { api } from '../services/api';
import { useState, useEffect } from 'react';

interface ModalListaPresencaProps {
    isOpen: boolean;
    onClose: () => void;
    aulaId: string;
    nome?: string;
}

export default function ModalListaPresenca({ isOpen, onClose, aulaId }: ModalListaPresencaProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [presenca, setPresenca] = useState([]);

    useEffect(() => {
        const buscarPresenca = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await api.get(`/aulas/${aulaId}/presenca`)
                setPresenca(response.data)
            } catch (error: any) {
                setError(error.response?.data?.message || 'Erro ao buscar lista de presenca')
            } finally {
                setLoading(false)
            }

        }
        if (isOpen) {
            buscarPresenca()
        }
    }, [isOpen, aulaId])

    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="cal-modal-overlay flex items-center justify-center z-50 fixed inset-0 bg-black bg-opacity-50" onClick={onClose}>
                <div className="cal-modal w-full max-w-md bg-white rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Lista de Presença</h3>
                        <button onClick={onClose} aria-label="Fechar" className="cursor-pointer text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                    </div>
                    <div className="text-center py-4">Carregando...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cal-modal-overlay flex items-center justify-center z-50 fixed inset-0 bg-black bg-opacity-50" onClick={onClose}>
                <div className="cal-modal w-full max-w-md bg-white rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Lista de Presença</h3>
                        <button onClick={onClose} aria-label="Fechar" className="cursor-pointer text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                    </div>
                    <div className="text-center py-4 text-red-600">Erro ao carregar lista de presença</div>
                </div>
            </div>
        );
    }

    return (
        <div className="cal-modal-overlay flex items-center justify-center z-50 fixed inset-0 bg-black bg-opacity-50" onClick={onClose}>
            <div className="cal-modal w-full max-w-md bg-white rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Lista de Presença</h3>
                    <button onClick={onClose} aria-label="Fechar" className="cursor-pointer text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                </div>

                {presenca && presenca.length > 0 ? (
                    <ul className="space-y-3 max-h-96 overflow-y-auto">
                        {presenca.map((p: any) => (
                            <li key={p.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center">
                                <span className="font-medium text-gray-800">{p.nome}</span>
                                <span className="text-sm text-gray-500">
                                    {new Date(p.confirmadoEm).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-4 text-gray-600">Nenhuma presença confirmada para esta aula.</div>
                )}
            </div>
        </div>
    )
}