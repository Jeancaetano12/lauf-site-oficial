import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import QRCode from 'react-qr-code';
import { FiX, FiCheck, FiPlay, FiSquare } from 'react-icons/fi';

interface ModalQrCodeProps {
    isOpen: boolean;
    onClose: () => void;
    aulaId: string;
}

export default function ModalQrCode({ isOpen, onClose, aulaId }: ModalQrCodeProps) {
    const [loading, setLoading] = useState(true);
    const [qrData, setQrData] = useState<{ token: string, expiraEm: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [qrUrl, setQrUrl] = useState<string>('');

    const checkQrCode = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/aulas/${aulaId}/qr`);

            if (response.data.qrCodeAtivo && response.data.qrCodeToken) {
                const expira = new Date(response.data.qrCodeExpiraEm);
                if (expira > new Date()) {
                    setQrData({
                        token: response.data.qrCodeToken,
                        expiraEm: response.data.qrCodeExpiraEm
                    });
                    setQrUrl(`${window.location.origin}/confirmar-presenca?token=${response.data.qrCodeToken}`);
                } else {
                    // Expirado mas ativo? (Edge case, backend devia limpar ou a gente pode só dizer que expirou)
                    setError('QR Code expirado.');
                    setQrData(null);
                }
            } else {
                setQrData(null);
            }
        } catch (err: any) {
            // Se não encontrou ou não tá ativo, o backend pode retornar algo específico.
            // Assumimos que não tem QR Code ativo
            setQrData(null);
        } finally {
            setLoading(false);
        }
    }, [aulaId]);

    useEffect(() => {
        if (isOpen) {
            checkQrCode();
        } else {
            setQrData(null);
            setError(null);
        }
    }, [isOpen, checkQrCode]);

    const handleIniciarChamada = async () => {
        if (!confirm("Iniciar a chamada fará a aula ser concluida 15 minutos depois, tem certeza? (Essa ação é irreversível)")) return;
        try {
            setLoading(true);
            setError(null);
            await api.patch(`/aulas/${aulaId}/iniciar-chamada`);
            await checkQrCode(); // recarrega os dados do QR gerado
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao iniciar chamada.');
            setLoading(false);
        }
    };

    const handleEncerrarChamada = async () => {
        if (!confirm("Encerrar a chamada fará a aula ser concluida antecipadamente, tem certeza? (Essa ação é irreversível)")) return;
        try {
            setLoading(true);
            setError(null);
            await api.patch(`/aulas/${aulaId}/encerrar-chamada`);
            setQrData(null);
            window.location.reload();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao encerrar chamada.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Chamada (QR Code)</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center min-h-75 justify-center text-center">
                    {loading ? (
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-purple"></div>
                    ) : error ? (
                        <div className="text-red-500 font-medium">{error}</div>
                    ) : qrData ? (
                        <div className="flex flex-col items-center space-y-6 w-full">
                            <div className="p-4 bg-white border-2 border-brand-purple/20 rounded-2xl shadow-sm">
                                <QRCode value={qrUrl} size={256} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1">
                                    <FiCheck /> Chamada Ativa
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Expira às: {new Date(qrData.expiraEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            <button
                                onClick={handleEncerrarChamada}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold py-3 rounded-xl transition-colors cursor-pointer"
                            >
                                <FiSquare /> Encerrar Chamada
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                                Sem QR Code
                            </div>
                            <p className="text-gray-600 text-sm">
                                A chamada para esta aula ainda não foi iniciada
                            </p>
                            <button
                                onClick={handleIniciarChamada}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-brand-purple text-white hover:bg-brand-purple-hover font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
                            >
                                <FiPlay /> Iniciar Chamada Agora
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
