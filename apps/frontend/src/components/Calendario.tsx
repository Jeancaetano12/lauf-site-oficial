import { useState, useMemo, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import type { DayCellContentArg } from '@fullcalendar/core';
import type { Aula } from '../hooks/useAulas';
import { useAuth } from '../context/AuthContext';
import '../styles/Calendario.css';

interface CalendarioProps {
    aulas: Aula[];
    onDayClick?: (aulas: Aula[], data: Date) => void;
}

const STATUS_COR: Record<Aula['status'], { borda: string; fundo: string; texto: string; hora: string }> = {
    AGENDADA: { borda: '#6b21a8', fundo: '#f3e8ff', texto: '#3b0764', hora: '#7c3aed' },
    CONCLUIDA: { borda: '#059669', fundo: '#d1fae5', texto: '#064e3b', hora: '#059669' },
    CANCELADA: { borda: '#dc2626', fundo: '#fee2e2', texto: '#7f1d1d', hora: '#dc2626' },
};

const MAX_CARDS_VISIVEIS = 2;

function toChave(data: string | Date): string {
    const d = new Date(data);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Calendario({ aulas, onDayClick }: CalendarioProps) {
    const [modalAulaInfo, setModalAulaInfo] = useState<{ data: Date; aulas: Aula[] } | null>(null);
    const cargoUsuario = useAuth().user.cargo;

    const aulasPorDia = useMemo(() =>
        aulas.reduce<Record<string, Aula[]>>((acc, aula) => {
            const chave = toChave(aula.dataHora);
            if (!acc[chave]) acc[chave] = [];
            acc[chave].push(aula);
            return acc;
        }, {}),
        [aulas]);

    const handleDateClick = useCallback((info: DateClickArg) => {
        const aulasNoDia = aulasPorDia[info.dateStr] ?? [];
        if (aulasNoDia.length === 0) return;
        setModalAulaInfo({ data: info.date, aulas: aulasNoDia });
        onDayClick?.(aulasNoDia, info.date);
    }, [aulasPorDia, onDayClick]);



    const renderDayCell = useCallback((info: DayCellContentArg) => {
        const aulasNoDia = aulasPorDia[toChave(info.date)] ?? [];
        const temAula = aulasNoDia.length > 0;
        const visiveis = aulasNoDia.slice(0, MAX_CARDS_VISIVEIS);
        const extras = aulasNoDia.length - MAX_CARDS_VISIVEIS;

        return (
            <div className={`cal-cell-inner ${temAula ? 'has-aula' : ''}`}>
                <span className="cal-day-number">{info.dayNumberText}</span>

                {temAula && (
                    <div className="cal-mini-cards">
                        {visiveis.map((aula) => {
                            const cor = STATUS_COR[aula.status];
                            return (
                                <div
                                    key={aula.id}
                                    className="cal-mini-card"
                                    style={{ borderLeftColor: cor.borda, backgroundColor: cor.fundo }}
                                >
                                    <span className="cal-mini-card-titulo" style={{ color: cor.texto }}>
                                        {aula.titulo}
                                    </span>
                                    <span className="cal-mini-card-hora" style={{ color: cor.hora }}>
                                        {new Date(aula.dataHora).toLocaleTimeString('pt-BR', {
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            );
                        })}
                        {extras > 0 && (
                            <span className="cal-mini-card-extra">+{extras} mais</span>
                        )}
                    </div>
                )}
            </div>
        );
    }, [aulasPorDia]);

    const fecharModal = useCallback(() => setModalAulaInfo(null), []);

    return (
        <div className="w-full p-2 md:p-4">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: '',
                    center: 'title',
                    right: '',
                }}
                footerToolbar={{
                    left: 'prev',
                    center: 'today',
                    right: 'next',
                }}
                locale="pt-br"
                buttonText={{ today: 'Hoje', prev: '‹ anterior', next: 'próximo ›' }}
                events={[]}
                dateClick={handleDateClick}
                dayCellContent={renderDayCell}
                aspectRatio={1.8}
                height="auto"
            />

            {modalAulaInfo && (
                <div className="cal-modal-overlay" onClick={fecharModal}>
                    <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cal-modal-header">
                            <h3>
                                {modalAulaInfo.data.toLocaleDateString('pt-BR', {
                                    weekday: 'long', day: 'numeric', month: 'long',
                                })}
                            </h3>
                            <button onClick={fecharModal} aria-label="Fechar">✕</button>
                        </div>
                        <div className="cal-modal-body">
                            {modalAulaInfo.aulas.map((aula) => {
                                const cor = STATUS_COR[aula.status];
                                return (
                                    <div
                                        key={aula.id}
                                        className="cal-modal-card"
                                        style={{ borderLeftColor: cor.borda }}
                                    >
                                        <div className="cal-modal-card-title">{aula.titulo}</div>
                                        <div className="cal-modal-card-meta">
                                            🕐&nbsp;{new Date(aula.dataHora).toLocaleTimeString('pt-BR', {
                                                hour: '2-digit', minute: '2-digit',
                                            })}
                                            &nbsp;·&nbsp;📍&nbsp;{aula.local}
                                            &nbsp;·&nbsp;👤&nbsp;{aula.professor.nome}
                                        </div>
                                        <span
                                            className="cal-modal-badge"
                                            style={{ backgroundColor: cor.borda }}
                                        >
                                            {aula.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}