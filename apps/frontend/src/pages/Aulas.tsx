"use client";

import { useAulas } from "../hooks/useAulas";
import Calendario from "../components/Calendario";

export default function Aulas() {
    const { aulas, isLoading, error } = useAulas();

    return (
        <div className="flex flex-col w-full h-full space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Calendário de Aulas</h1>
                {/* Futuramente o botão de Criar Aula pode vir aqui */}
            </div>

            {error && (
                <div className="bg-red-100 text-red-600 p-4 rounded-xl border border-red-200">
                    {error}
                </div>
            )}

            <div className="w-full max-w-5xl mx-auto bg-brand-white rounded-2xl shadow-lg border border-brand-gray-medium overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <span className="text-brand-gray-text font-medium animate-pulse">Carregando calendário...</span>
                    </div>
                ) : (
                    <Calendario aulas={aulas} />
                )}
            </div>
        </div>
    );
}