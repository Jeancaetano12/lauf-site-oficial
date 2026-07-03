"use client";

import { useAulas } from "../hooks/useAulas";
import Calendario from "../components/Calendario";
import { FiRefreshCw } from "react-icons/fi";

export default function Aulas() {
    const { aulas, isLoading, error, refetch } = useAulas();

    return (
        <div className="flex flex-col w-full h-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-brand-white">Calendário de Aulas</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-purple hover:bg-brand-purple-hover text-brand-white font-medium rounded-lg transition-colors border border-brand-purple disabled:opacity-70 disabled:cursor-wait"
                        title="Atualizar aulas"
                    >
                        <FiRefreshCw className={`text-lg ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Atualizar</span>
                    </button>
                    {/* Futuramente o botão de Criar Aula pode vir aqui */}
                </div>
            </div>

            {error && (
                <div className="bg-red-100 text-red-600 p-4 rounded-xl border border-red-200">
                    {error}
                </div>
            )}

            <div className="w-full max-w-5xl mx-auto bg-brand-white rounded-2xl shadow-lg border border-brand-gray-medium overflow-hidden">
                {isLoading && aulas.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <span className="text-brand-gray-text font-medium animate-pulse">Carregando calendário...</span>
                    </div>
                ) : (
                    <Calendario aulas={aulas} onAulasUpdated={refetch} />
                )}
            </div>
        </div>
    );
}