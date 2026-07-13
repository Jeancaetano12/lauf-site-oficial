import React, { useState, useEffect } from 'react';
import { useAulas, type UpdateAulaDTO } from '../hooks/useAulas';
import { useAuth } from '../context/AuthContext';
import { AiOutlineSchedule } from "react-icons/ai";


interface ModalEditarAulaProps {
    isOpen: boolean;
    onClose: () => void;
    aula: UpdateAulaDTO;
    dataInicial: Date;
    onAulaUpdated?: () => void;
}

export default function ModalEditarAula({ isOpen, onClose, aula, dataInicial, onAulaUpdated }: ModalEditarAulaProps) {
    const { user } = useAuth();
    const { updateAula, isUpdating, error, professores, fetchProfessores } = useAulas();

    const isCoordenador = user?.cargo === 'COORDENADOR';
    const isProfessor = user?.cargo === 'PROFESSOR';

    const [titulo, setTitulo] = useState('');
    const [local, setLocal] = useState('');
    const [descricao, setDescricao] = useState('');
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [professorId, setProfessorId] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Formatar data para yyyy-MM-dd
            const ano = dataInicial.getFullYear();
            const mes = String(dataInicial.getMonth() + 1).padStart(2, '0');
            const dia = String(dataInicial.getDate()).padStart(2, '0');
            setData(`${ano}-${mes}-${dia}`);

            // Preencher com hora atual ou vazio, vamos deixar 08:00 como padrão
            setHora('08:00');

            setTitulo('');
            setLocal('');
            setDescricao('');
            setProfessorId(isProfessor ? user.id : '');

            if (isCoordenador) {
                fetchProfessores();
            }
        }
    }, [isOpen, dataInicial, isProfessor, isCoordenador, user?.id, fetchProfessores]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Montar a string ISO "YYYY-MM-DDTHH:mm:00" e então new Date()
        // O Date assume o timezone local, e o toISOString converte para UTC 
        // compatível com o Prisma e o DTO
        const dateString = `${data}T${hora}:00`;
        const dateObj = new Date(dateString);

        const dto: UpdateAulaDTO = {
            id: aula.id,
            titulo,
            local,
            descricao,
            dataHora: dateObj.toISOString(),
            status: 'AGENDADA',
            professorId: professorId,
        };

        try {
            await updateAula(aula.id, dto);
            onAulaUpdated?.();
            onClose();
        } catch (err) {
            // Erro já tratado no hook, apenas evita o fechamento
        }
    };

    return (
        <div className="cal-modal-overlay flex items-center justify-center z-50 fixed inset-0 bg-black bg-opacity-50" onClick={onClose}>
            <div className="cal-modal w-full max-w-md bg-white rounded-xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Editar Aula</h3>
                    <button onClick={onClose} aria-label="Fechar" className="cursor-pointer text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">Título da Aula <span className='text-xs text-gray-500'>{titulo.length}/30</span></label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            className="w-full p-2 border text-black border-gray-300 rounded-md focus:ring-brand-purple focus:border-brand-purple outline-none"
                            placeholder="Ex: Treinamento Funcional"
                            maxLength={30}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1">Local <span className='text-xs text-gray-500'>{local.length}/50</span></label>
                        <input
                            type="text"
                            value={local}
                            onChange={(e) => setLocal(e.target.value)}
                            className="w-full p-2 border text-black border-gray-300 rounded-md focus:ring-brand-purple focus:border-brand-purple outline-none"
                            placeholder="Ex: Sala 1"
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-black mb-1'>Descrição <span className='text-xs text-gray-500'>{descricao.length}/140</span></label>
                        <textarea
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            className="w-full p-2 border text-black border-gray-300 rounded-md focus:ring-brand-purple focus:border-brand-purple outline-none"
                            placeholder="Ex: Treinamento Funcional"
                            maxLength={140}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-black mb-1">Data</label>
                            <input
                                type="date"
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                                className="w-full p-2 border text-black border-gray-300 rounded-md focus:ring-brand-purple focus:border-brand-purple outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-black mb-1">Horário</label>
                            <input
                                type="time"
                                value={hora}
                                onChange={(e) => setHora(e.target.value)}
                                className="w-full p-2 border text-black border-gray-300 rounded-md focus:ring-brand-purple focus:border-brand-purple outline-none"
                            />
                        </div>
                    </div>

                    {isCoordenador && (
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">Professor</label>
                            <select
                                value={professorId}
                                onChange={(e) => setProfessorId(e.target.value)}
                                className="w-full p-2 border text-black border-gray-300 rounded-md focus:ring-brand-purple focus:border-brand-purple outline-none bg-white"
                            >
                                <option value="" disabled>Selecione um professor</option>
                                {professores.map((prof) => (
                                    <option key={prof.id} value={prof.id}>{prof.nome}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="mt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-red-300 transition-colors font-medium"
                            disabled={isUpdating}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="cursor-pointer px-4 py-2 bg-brand-purple text-brand-white rounded-md hover:bg-brand-purple-hover transition-colors disabled:opacity-70 disabled:cursor-wait font-medium flex items-center justify-center min-w-[120px]"
                        >
                            {isUpdating ? <AiOutlineSchedule className="mr-2 animate-spin" /> : <AiOutlineSchedule className="mr-2" />}
                            Atualizar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
