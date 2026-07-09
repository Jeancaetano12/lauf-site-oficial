import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext'; // ajuste o caminho se o seu AuthContext estiver em outra pasta
import {
    FiArrowLeft,
    FiMapPin,
    FiUser,
    FiClock,
    FiCalendar,
    FiHash,
    FiFileText,
    FiEdit2,
    FiCheckSquare,
    FiCopy,
    FiCheck,
} from 'react-icons/fi';
import type { Aula } from '../hooks/useAulas';
import ModalEditarAula from '../components/ModalEditarAula';

// fundo/borda usam a mesma cor do "ponto", só que com baixa opacidade (via rgba),
// pra criar uma pílula colorida que ainda combina com o gradiente escuro do hero.
const STATUS_COR = {
    AGENDADA: { ponto: '#c084fc', texto: '#f3e8ff', fundo: 'rgba(192, 132, 252, 0.18)', borda: 'rgba(192, 132, 252, 0.45)' },
    CONCLUIDA: { ponto: '#34d399', texto: '#ecfdf5', fundo: 'rgba(52, 211, 153, 0.18)', borda: 'rgba(52, 211, 153, 0.45)' },
    CANCELADA: { ponto: '#f87171', texto: '#fef2f2', fundo: 'rgba(248, 113, 113, 0.18)', borda: 'rgba(248, 113, 113, 0.45)' },
};

export default function AulaDetalhes() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [aula, setAula] = useState<Aula | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [idCopiado, setIdCopiado] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // user pode ainda ser null no primeiro render (enquanto o AuthContext valida a sessão),
    // então usar optional chaining aqui evita quebrar a página nesse instante.
    let podeGerenciar = false;
    if (user?.cargo === 'COORDENADOR') {
        podeGerenciar = true;
    }
    if (user?.nome === aula?.professor.nome) {
        podeGerenciar = true;
    }

    const fetchAula = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await api.get(`/aulas/${id}`);
            setAula(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao carregar detalhes da aula.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAula();
    }, [id]);

    const copiarId = () => {
        if (!aula) return;
        navigator.clipboard.writeText(aula.id);
        setIdCopiado(true);
        setTimeout(() => setIdCopiado(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
            </div>
        );
    }

    if (error || !aula) {
        return (
            <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-4 min-h-[50vh]">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium text-lg shadow-sm w-full max-w-md">
                    {error || 'Aula não encontrada.'}
                </div>
                <button
                    onClick={() => navigate('/aulas')}
                    className="flex items-center text-brand-purple hover:text-brand-purple-hover transition-colors font-medium mt-4 bg-brand-purple/10 px-6 py-2 rounded-lg"
                >
                    <FiArrowLeft className="mr-2" /> Voltar para Aulas
                </button>
            </div>
        );
    }

    const corStatus = STATUS_COR[aula.status] || STATUS_COR.AGENDADA;
    const dataObj = new Date(aula.dataHora);
    const dataStr = dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    const horaStr = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto w-full transition-all duration-300">

            {/* Hero com o gradiente de volta como FUNDO — título, status, ID e ações moram aqui dentro */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br from-brand-black via-slate-800 to-brand-purple p-6 sm:p-8 md:p-10">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-brand-purple opacity-30 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <div className='flex flex-row justify-between mb-2'>
                        <button
                            onClick={() => navigate(-1)}
                            className="cursor-pointer flex items-center text-slate-300 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg transition-colors font-medium mb-4 text-sm"
                        >
                            <FiArrowLeft className="mr-2" /> Voltar
                        </button>

                        <button
                            onClick={copiarId}
                            title="Copiar ID da aula"
                            className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-mono text-white/50 hover:text-white transition-colors"
                        >
                            <FiHash className="w-3 h-3" />
                            {aula.id}
                            {idCopiado ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
                        </button>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
                        {aula.titulo}
                    </h1>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-5 border-t border-white/15">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <span
                                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border"
                                style={{ color: corStatus.texto, backgroundColor: corStatus.fundo, borderColor: corStatus.borda }}
                            >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: corStatus.ponto }}></span>
                                {aula.status}
                            </span>
                        </div>

                        {podeGerenciar && (
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => {
                                        if (aula.status !== 'AGENDADA') {
                                            alert("Não é possivel editar aulas concluidas ou canceladas.");
                                        } else {
                                            setIsModalOpen(true);
                                        }
                                    }}
                                    className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center text-white transition-all font-semibold bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-sm backdrop-blur-sm"
                                >
                                    <FiEdit2 className="mr-2" /> Editar
                                </button>
                                <button
                                    onClick={() => { }}
                                    className="cursor-pointer sm:flex-none flex items-center justify-center text-white transition-all font-semibold bg-brand-purple hover:bg-brand-purple-hover px-4 py-2 rounded-lg text-sm shadow-sm"
                                >
                                    <FiCheckSquare className="mr-2" /> Abrir Chamada
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Faixa única de informações — labels em text-gray-400 (classe padrão, sempre confiável) */}
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200 mt-6 rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-5 flex-1">
                    <FiCalendar className="w-5 h-5 text-brand-purple shrink-0" />
                    <div>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Data</p>
                        <p className="text-sm text-brand-black font-semibold capitalize">{dataStr}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-5 flex-1">
                    <FiClock className="w-5 h-5 text-brand-purple shrink-0" />
                    <div>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Horário</p>
                        <p className="text-sm text-brand-black font-semibold">{horaStr}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-5 flex-1">
                    <FiMapPin className="w-5 h-5 text-brand-purple shrink-0" />
                    <div>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Local</p>
                        <p className="text-sm text-brand-black font-semibold">{aula.local}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-5 flex-1">
                    <FiUser className="w-5 h-5 text-brand-purple shrink-0" />
                    <div>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Professor(a)</p>
                        <p className="text-sm text-brand-black font-semibold">{aula.professor.nome}</p>
                    </div>
                </div>
            </div>

            {/* Descrição: agora num card claro de verdade, texto escuro garantido sobre fundo branco */}
            {aula.descricao && (
                <div className="mt-6 pl-5 py-5 pr-6 border-l-4 border-brand-purple bg-white rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <FiFileText className="w-4 h-4 text-brand-purple" />
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Sobre a aula</p>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{aula.descricao}</p>
                </div>
            )}

            <ModalEditarAula
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                aula={aula}
                dataInicial={new Date(aula.dataHora)}
                onAulaUpdated={fetchAula}
            />
        </div>
    );
}