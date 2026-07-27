import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useSolicitacoes, type SolicitacaoInscricao } from "../hooks/useSolicitacoes";
import {
    FiArrowLeft,
    FiUser,
    FiBookOpen,
    FiCheck,
    FiX,
    FiMail,
    FiPhone,
    FiCopy,
} from "react-icons/fi";
import { formatarNomeCurso, formatarTelefone, formatarGenero } from "../utils/formatters";


// Mesmo esquema de cores dinâmicas (fundo/borda em rgba com baixa opacidade)
// usado em AulaDetalhes e na listagem de Solicitações.
const STATUS_COR = {
    PENDENTE: { ponto: '#fbbf24', texto: '#fffbeb', fundo: 'rgba(251, 191, 36, 0.18)', borda: 'rgba(251, 191, 36, 0.45)' },
    APROVADA: { ponto: '#34d399', texto: '#ecfdf5', fundo: 'rgba(52, 211, 153, 0.18)', borda: 'rgba(52, 211, 153, 0.45)' },
    REJEITADA: { ponto: '#f87171', texto: '#fef2f2', fundo: 'rgba(248, 113, 113, 0.18)', borda: 'rgba(248, 113, 113, 0.45)' },
};

const formatarData = (iso: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function SolicitacaoDetalhes() {
    const { aprovarSolicitacao, reprovarSolicitacao } = useSolicitacoes();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [solicitacao, setSolicitacao] = useState<SolicitacaoInscricao | null>(null);
    const [idCopiado, setIdCopiado] = useState(false);

    const fetchSolicitacaoDetalhes = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await api.get(`usuarios/solicitacoes/${id}`);
            setSolicitacao(response.data);
        } catch (err: any) {
            console.error('Error buscando solicitacao:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitacaoDetalhes();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
            </div>
        );
    }

    if (!solicitacao) {
        return (
            <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-4 min-h-[50vh]">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium text-lg shadow-sm w-full max-w-md">
                    Solicitação não encontrada.
                </div>
                <button
                    onClick={() => navigate('/solicitacoes')}
                    className="flex items-center text-brand-purple hover:text-brand-purple-hover transition-colors font-medium mt-4 bg-brand-purple/10 px-6 py-2 rounded-lg"
                >
                    <FiArrowLeft className="mr-2" /> Voltar para Solicitações
                </button>
            </div>
        );
    }

    const corStatus = STATUS_COR[solicitacao.status] || STATUS_COR.PENDENTE;

    const copiarId = () => {
        if (!solicitacao) return;
        navigator.clipboard.writeText(solicitacao.id);
        setIdCopiado(true);
        setTimeout(() => setIdCopiado(false), 2000);
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto w-full transition-all duration-300">

            {/* Hero com o mesmo gradiente escuro usado em AulaDetalhes — voltar, título, status, ID e ações moram aqui dentro */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg bg-linear-to-br from-brand-black via-slate-800 to-brand-purple p-6 sm:p-8 md:p-10">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-brand-purple opacity-30 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex flex-row justify-between mb-2">
                        <button
                            onClick={() => { navigate(`/solicitacoes`) }}
                            className="cursor-pointer flex items-center text-slate-300 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg transition-colors font-medium mb-4 text-sm"
                        >
                            <FiArrowLeft className="mr-2" /> Voltar
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-white/50 cursor-pointer hover:text-white transition-colors"
                                onClick={copiarId}>
                                {solicitacao.id}
                                {idCopiado ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
                            </span>
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm truncate">
                        {solicitacao.nome}
                    </h1>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-5 border-t border-white/15">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <span
                                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border"
                                style={{ color: corStatus.texto, backgroundColor: corStatus.fundo, borderColor: corStatus.borda }}
                            >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: corStatus.ponto }}></span>
                                {solicitacao.status}
                            </span>
                        </div>

                        {solicitacao.status === 'PENDENTE' && (
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => { aprovarSolicitacao(solicitacao.id); window.location.reload() }}
                                    className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center text-white transition-all font-semibold bg-emerald-500/90 hover:bg-emerald-600 px-4 py-2 rounded-lg text-sm shadow-sm"
                                >
                                    <FiCheck className="mr-2" /> Aprovar
                                </button>
                                <button
                                    onClick={() => { reprovarSolicitacao(solicitacao.id); window.location.reload() }}
                                    className="cursor-pointer sm:flex-none flex items-center justify-center text-white transition-all font-semibold bg-red-600 hover:bg-red-800 px-4 py-2 rounded-lg text-sm shadow-sm"
                                >
                                    <FiX className="mr-2" /> Rejeitar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Informações — dois cards claros lado a lado, mesmo padrão de fundo branco/texto escuro de AulaDetalhes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FiUser className="w-4 h-4 text-brand-purple" />
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Informações Pessoais</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-400 shrink-0">Nome</span>
                            <span className="text-sm text-brand-black font-semibold text-right truncate">{solicitacao.nome}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-400 shrink-0 flex items-center gap-1.5"><FiMail className="w-3.5 h-3.5" /> Email</span>
                            <span className="text-sm text-brand-black font-semibold text-right truncate">{solicitacao.email || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-400 shrink-0 flex items-center gap-1.5"><FiPhone className="w-3.5 h-3.5" /> Telefone</span>
                            <span className="text-sm text-brand-black font-semibold text-right">{formatarTelefone(solicitacao.telefone) || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-400 shrink-0">Gênero</span>
                            <span className="text-sm text-brand-black font-semibold text-right">{formatarGenero(solicitacao.genero) || '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FiBookOpen className="w-4 h-4 text-brand-purple" />
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Informações Acadêmicas</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-400 shrink-0">Curso</span>
                            <span className="text-sm text-brand-black font-semibold text-right truncate">{formatarNomeCurso(solicitacao.curso) || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-400 shrink-0">Matrícula</span>
                            <span className="text-sm text-brand-black font-semibold text-right">{solicitacao.matricula}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-400 shrink-0">Cargo Pretendido</span>
                            <span className="text-sm text-brand-black font-semibold text-right">{solicitacao.cargoPretendido}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-400 shrink-0">Criado em</span>
                            <span className="text-sm text-brand-black font-semibold text-right">{formatarData(solicitacao.criadoEm)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}