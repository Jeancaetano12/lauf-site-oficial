import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// Icones
import { GoHome } from "react-icons/go";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { GrUserSettings } from "react-icons/gr";
import { RiShieldUserLine } from "react-icons/ri";
import { GoGear } from "react-icons/go";


export default function HubLayout() {
  const location = useLocation();
  const isCoordenador = useAuth().user?.cargo;
  const navItems = isCoordenador === "COORDENADOR"
    ? [
      { name: "Início", path: "/hub", icon: <GoHome color="black" /> },
      { name: "Aulas", path: "/aulas", icon: <IoCalendarNumberOutline color="black" /> },
      { name: "Perfil", path: "/perfil", icon: <GrUserSettings color="black" /> },
      { name: "Solicitações", path: "/solicitacoes", icon: <RiShieldUserLine color="black" /> },
      { name: "Configurações", path: "/configuracoes", icon: <GoGear color="black" /> }
    ]
    : [
      { name: "Início", path: "/hub", icon: <GoHome color="black" /> },
      { name: "Aulas", path: "/aulas", icon: <IoCalendarNumberOutline color="black" /> },
      { name: "Perfil", path: "/perfil", icon: <GrUserSettings color="black" /> },
      { name: "Configurações", path: "/configuracoes", icon: <GoGear color="black" /> }
    ]


  return (
    // Container principal: ocupa a tela toda (h-screen) e esconde barras de rolagem globais
    <div className="flex h-screen bg-brand-black text-brand-white overflow-hidden font-sans transition-colors duration-300">

      {/* =========================================
          SIDEBAR (DESKTOP)
          Fica escondida no mobile (hidden) e aparece a partir da tela md (md:flex)
      ========================================= */}
      <aside className="hidden md:flex flex-col w-64 border-r border-brand-gray-text/10 bg-brand-white p-6 shadow-sm z-10">
        <div className="mb-8 font-bold text-2xl text-brand-purple tracking-tight">
          LAUF HUB
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                  ? "bg-brand-purple text-brand-white shadow-md shadow-brand-purple/20"
                  : "hover:bg-brand-purple/10 text-brand-black hover:text-brand-purple"
                  }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* =========================================
          ÁREA PRINCIPAL DE CONTEÚDO
      ========================================= */}
      <main className="flex-1 flex flex-col relative overflow-y-auto w-full">
        {/* No mobile, colocamos um padding-bottom (pb-24) para o conteúdo não ficar escondido atrás da bottom bar */}
        <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8 w-full max-w-7xl">
          {/* O Outlet renderiza o componente da rota atual (ex: LaufHub, Calendario) */}
          <Outlet />
        </div>
      </main>

      {/* =========================================
          BOTTOM NAVIGATION BAR (MOBILE)
          Fica fixa na base (fixed bottom-0), escondida no desktop (md:hidden)
          Usa backdrop-blur (glassmorphism) para um visual moderno
      ========================================= */}
      <nav className="md:hidden fixed bottom-0 w-full border-t border-brand-gray-text/10 bg-brand-white/90 backdrop-blur-lg flex justify-around items-center p-2 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${isActive
                ? "text-brand-purple scale-110"
                : "text-brand-gray-medium hover:text-brand-white"
                }`}
            >
              {/* O icone sobe um pouco e ganha um fundo se estiver ativo (micro-interação) */}
              <div className={`flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-brand-purple/20 p-2 rounded-xl mb-1' : 'mb-1'}`}>
                <span className="text-2xl leading-none">{item.icon}</span>
              </div>
              {isActive && <span className="text-[10px] font-bold tracking-wide">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
