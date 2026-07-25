"use client";

import { useEffect, useState } from 'react';
import {
    FiInbox,
    FiMail,
    FiPhone,
    FiBookOpen,
    FiHash,
    FiClock,
    FiEye,
    FiCheck,
    FiX,
    FiChevronLeft,
    FiChevronRight,
} from 'react-icons/fi';
import { useSolicitacoes, type SolicitacaoInscricao } from '../hooks/useSolicitacoes';
import { useNavigate } from 'react-router-dom';

const STATUS_COR = {
    PENDENTE: { ponto: '#fbbf24', texto: '#000000', fundo: 'rgba(251, 191, 36, 0.18)', borda: 'rgba(251, 191, 36, 0.45)' },
    APROVADA: { ponto: '#34d399', texto: '#000000', fundo: 'rgba(52, 211, 153, 0.18)', borda: 'rgba(52, 211, 153, 0.45)' },
    REJEITADA: { ponto: '#f87171', texto: '#000000', fundo: 'rgba(248, 113, 113, 0.18)', borda: 'rgba(248, 113, 113, 0.45)' },
};

const FILTROS: { label: string; valor?: 'PENDENTE' | 'APROVADA' | 'REJEITADA' }[] = [
    { label: 'Pendentes', valor: 'PENDENTE' },
    { label: 'Aprovadas', valor: 'APROVADA' },
    { label: 'Rejeitadas', valor: 'REJEITADA' },
    { label: 'Todas', valor: undefined },
];

export default function Solicitacoes() {
    const { solicitacoes, meta, isLoading, error, buscarSolicitacoes, aprovarSolicitacao, reprovarSolicitacao } = useSolicitacoes();
    const [filtroAtivo, setFiltroAtivo] = useState<'PENDENTE' | 'APROVADA' | 'REJEITADA' | undefined>('PENDENTE');
    const [pagina, setPagina] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        buscarSolicitacoes(filtroAtivo, pagina);
    }, [filtroAtivo, pagina, buscarSolicitacoes]);

    const formatarData = (iso: string) => {
        return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto w-full transition-all duration-300">
            {/* Hero com o mesmo gradiente escuro usado em AulaDetalhes */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg bg-linear-to-br from-brand-black via-slate-800 to-brand-purple p-6 sm:p-8 md:p-10 mb-6">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-brand-purple opacity-30 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
                        Solicitações
                    </h1>
                    <p className="text-slate-300 mt-2 text-sm sm:text-base">
                        Pedidos de inscrição aguardando análise de coordenadores.
                    </p>

                    {/* Filtros por status, reaproveitando o estilo de pílula */}
                    <div className="flex flex-wrap items-center justify-center-safe gap-2 mt-6 pt-5 border-t border-white/15">
                        {FILTROS.map((filtro) => {
                            const ativo = filtroAtivo === filtro.valor;
                            return (
                                <button
                                    key={filtro.label}
                                    onClick={() => {
                                        setPagina(1);
                                        setFiltroAtivo(filtro.valor);
                                    }}
                                    className={`cursor-pointer px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${ativo
                                        ? 'bg-white text-brand-black border-white'
                                        : 'text-white/70 border-white/20 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {filtro.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Estado de carregamento */}
            {isLoading && (
                <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-purple"></div>
                </div>
            )}

            {/* Estado de erro */}
            {!isLoading && error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium text-center shadow-sm">
                    {error}
                </div>
            )}

            {/* Vazio */}
            {!isLoading && !error && solicitacoes.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-16 text-gray-400">
                    <FiInbox className="w-10 h-10 mb-3" />
                    <p className="font-medium">Nenhuma solicitação encontrada.</p>
                </div>
            )}

            {/* Lista de solicitações — cards claros, no mesmo padrão da faixa de informações de AulaDetalhes */}
            {!isLoading && !error && solicitacoes.length > 0 && (
                <div className="space-y-4">
                    {solicitacoes.map((solicitante: SolicitacaoInscricao) => {
                        const corStatus = STATUS_COR[solicitante.status] || STATUS_COR.PENDENTE;
                        return (
                            <div
                                key={solicitante.id}
                                className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-5"
                            >
                                {/* Info principal */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <h2 className="text-lg font-bold text-brand-black truncate">{solicitante.nome}</h2>
                                        <span
                                            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0"
                                            style={{ color: corStatus.texto, backgroundColor: corStatus.fundo, borderColor: corStatus.borda }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: corStatus.ponto }}></span>
                                            {solicitante.status}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">
                                        <span className="inline-flex items-center gap-1.5">
                                            <FiHash className="w-3.5 h-3.5 text-brand-purple" />
                                            {solicitante.matricula}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <FiBookOpen className="w-3.5 h-3.5 text-brand-purple" />
                                            {solicitante.cargoPretendido}
                                            {solicitante.curso ? ` · ${solicitante.curso}` : ''}
                                        </span>
                                        {solicitante.email && (
                                            <span className="inline-flex items-center gap-1.5">
                                                <FiMail className="w-3.5 h-3.5 text-brand-purple" />
                                                {solicitante.email}
                                            </span>
                                        )}
                                        {solicitante.telefone && (
                                            <span className="inline-flex items-center gap-1.5">
                                                <FiPhone className="w-3.5 h-3.5 text-brand-purple" />
                                                {solicitante.telefone}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1.5">
                                            <FiClock className="w-3.5 h-3.5 text-brand-purple" />
                                            {formatarData(solicitante.criadoEm)}
                                        </span>
                                    </div>
                                </div>

                                {/* Ações */}
                                {solicitante.status === 'PENDENTE' && (
                                    <div className="flex items-center justify-center gap-2 shrink-0">
                                        <button
                                            onClick={() => { navigate(`/solicitacoes/${solicitante.id}`) }}
                                            title="Ver detalhes"
                                            className="cursor-pointer flex items-center justify-center gap-2 text-brand-text bg-brand-purple hover:bg-brand-purple-hover transition-all font-semibold px-4 py-2 rounded-lg text-sm"
                                        >
                                            <FiEye className="w-4 h-4" /> Detalhes
                                        </button>
                                        <button
                                            onClick={() => { aprovarSolicitacao(solicitante.id) }}
                                            disabled={isLoading}
                                            title="Aceitar solicitação"
                                            className="cursor-pointer flex items-center justify-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 transition-all font-semibold px-4 py-2 rounded-lg text-sm shadow-sm"
                                        >
                                            <FiCheck className="w-4 h-4" /> Aceitar
                                        </button>
                                        <button
                                            onClick={() => { reprovarSolicitacao(solicitante.id) }}
                                            disabled={isLoading}
                                            title="Recusar solicitação"
                                            className="cursor-pointer flex items-center justify-center gap-2 text-white bg-red-500 hover:bg-red-600 transition-all font-semibold px-4 py-2 rounded-lg text-sm shadow-sm"
                                        >
                                            <FiX className="w-4 h-4" /> Recusar
                                        </button>
                                    </div>
                                )}

                                {solicitante.status !== 'PENDENTE' && (
                                    <div className="flex items-center justify-center gap-2 shrink-0">
                                        <button
                                            onClick={() => { navigate(`/solicitacoes/${solicitante.id}`) }}
                                            title="Ver detalhes"
                                            className="cursor-pointer flex items-center justify-center gap-2 text-brand-text bg-brand-purple hover:bg-brand-purple-hover transition-all font-semibold px-4 py-2 rounded-lg text-sm"
                                        >
                                            <FiEye className="w-4 h-4" /> Detalhes
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Paginação simples usando o meta retornado pelo hook */}
            {!isLoading && !error && meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={() => setPagina((paginaAtual) => Math.max(1, paginaAtual - 1))}
                        disabled={meta.page <= 1}
                        className="cursor-pointer flex items-center gap-1.5 text-sm font-semibold text-brand-text bg-white hover:bg-brand-gray-light disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg shadow-sm transition-all"
                    >
                        <FiChevronLeft className="w-4 h-4" /> Anterior
                    </button>
                    <span className="text-sm text-gray-400 font-medium">
                        Página {meta.page} de {meta.totalPages}
                    </span>
                    <button
                        onClick={() => setPagina((paginaAtual) => Math.min(meta.totalPages, paginaAtual + 1))}
                        disabled={meta.page >= meta.totalPages}
                        className="cursor-pointer flex items-center gap-1.5 text-sm font-semibold text-brand-text bg-white hover:bg-brand-gray-light disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg shadow-sm transition-all"
                    >
                        Próxima <FiChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}