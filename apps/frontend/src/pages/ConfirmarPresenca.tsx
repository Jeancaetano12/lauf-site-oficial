import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FiCheckCircle, FiXCircle, FiLoader, FiHome } from 'react-icons/fi';

export default function ConfirmarPresenca() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Confirmando sua presença...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token de presença não fornecido ou inválido.');
            return;
        }

        const confirmar = async () => {
            try {
                await api.post('/presenca/confirmar', { token });
                setStatus('success');
                setMessage('Presença confirmada com sucesso!');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Erro ao confirmar presença. O QR Code pode estar expirado ou você já confirmou.');
            }
        };

        confirmar();
    }, [token]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center flex flex-col items-center">
                {status === 'loading' && (
                    <>
                        <FiLoader className="w-16 h-16 text-brand-purple animate-spin mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Aguarde...</h2>
                        <p className="text-gray-500">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <FiCheckCircle className="w-20 h-20 text-emerald-500 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tudo certo!</h2>
                        <p className="text-gray-600 mb-8">{message}</p>

                        <button
                            onClick={() => navigate('/aulas')}
                            className="w-full flex items-center justify-center gap-2 bg-brand-purple text-white hover:bg-brand-purple-hover font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
                        >
                            <FiHome /> Voltar para as aulas
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <FiXCircle className="w-20 h-20 text-red-500 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops!</h2>
                        <p className="text-gray-600 mb-8">{message}</p>
                        <button
                            onClick={() => navigate('/aulas')}
                            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
                        >
                            <FiHome /> Voltar para as aulas
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
