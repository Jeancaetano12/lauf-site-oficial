import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FiCheckCircle, FiXCircle, FiLoader, FiHome, FiArrowLeft, FiCheck, FiRefreshCcw } from 'react-icons/fi';

export default function ConfirmarPresenca() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token de presença não fornecido ou inválido.');
        }
    }, [token]);

    const handleConfirmar = async () => {
        setLoading(true);
        setMessage('');
        try {
            setStatus('loading');
            await api.post('/presenca/confirmar', { token });
            setMessage('Sua presença foi registrada com sucesso!');
            setStatus('success');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Erro ao confirmar presença. O QR Code pode estar expirado ou você já confirmou.');
        } finally {
            setLoading(false);
        }
    };

    const handleVoltar = () => {
        if (!confirm("Tem certeza que deseja voltar? Para chegar nessa tela será necessário ler o QRCode novamente.")) return;
        navigate('/aulas');
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center flex flex-col items-center transition-all duration-300">

                {status === 'idle' && (
                    <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
                        <div className="w-20 h-20 bg-brand-purple/10 rounded-full flex items-center justify-center mb-6">
                            <FiCheckCircle className="w-10 h-10 text-brand-purple" />
                        </div>
                        <h2 className='text-2xl font-bold mb-3 text-gray-800'>Confirmar Presença 😉</h2>
                        <p className="text-gray-500 mb-8 px-4 leading-relaxed">
                            Você escaneou o código de chamada da aula. Confirme abaixo para registrar sua presença no sistema.
                        </p>

                        <div className='flex flex-col w-full gap-3'>
                            <button
                                onClick={handleConfirmar}
                                disabled={isLoading}
                                className='w-full flex items-center justify-center gap-2 bg-brand-purple text-white hover:bg-brand-purple-hover font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                            >
                                <FiCheck className="text-xl" /> Confirmar Agora
                            </button>
                            <button
                                onClick={handleVoltar}
                                className='w-full flex items-center mt-2 justify-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                            >
                                <FiArrowLeft className="text-lg" /> Cancelar e Voltar
                            </button>
                        </div>
                    </div>
                )}

                {status === 'loading' && (
                    <div className="py-8 flex flex-col items-center animate-in fade-in duration-500">
                        <FiLoader className="w-16 h-16 text-brand-purple animate-spin mb-6 mx-auto" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Processando...</h2>
                        <p className="text-gray-500">Registrando sua presença no sistema</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-4 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <FiCheckCircle className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tudo certo!</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
                        <button
                            onClick={() => navigate('/aulas')}
                            className="w-full flex items-center justify-center gap-2 bg-brand-purple text-white hover:bg-brand-purple-hover font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                            <FiHome className="text-lg" /> Voltar para o Portal
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-4 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <FiXCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Atenção</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
                        <div className='flex flex-col w-full gap-3'>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full flex items-center justify-center gap-2 bg-brand-purple text-white hover:bg-brand-purple-hover font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            >
                                <FiRefreshCcw className="text-lg" /> Tentar Novamente
                            </button>
                            <button
                                onClick={() => navigate('/aulas')}
                                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            >
                                <FiArrowLeft className="text-lg" /> Voltar para Aulas
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
