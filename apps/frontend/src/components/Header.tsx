"use client";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import icone2 from "../assets/icone2.png";

export default function Header() {
    const [activeSection, setActiveSection] = useState('inicio');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['inicio', 'sobre', 'atividades', 'contato'];
            let current = 'inicio';

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= window.innerHeight / 2.5) {
                        current = section;
                    }
                }
            }
            setActiveSection(current);
        };

        if (location.pathname === '/') {
            window.addEventListener('scroll', handleScroll);
            handleScroll();
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    function handleNavClick(id: string) {
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: id } });
        } else {
            const scroll = document.getElementById(id);
            if (scroll) scroll.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Efeito para scrollar caso venha de outra página
    useEffect(() => {
        if (location.pathname === '/' && location.state?.scrollTo) {
            const id = location.state.scrollTo;
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            // Limpa o estado para não scrollar novamente em re-renders
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    return (
        <nav className="sticky top-0 z-50 bg-brand-white/90 backdrop-blur-md flex items-center justify-between px-8 py-2 border-b border-brand-gray-medium">
            <div className="cursor-pointer md:flex gap-2 content-normal items-center" onClick={() => handleNavClick('inicio')}>
                <img src={icone2} alt="Logo LAUF" className="object-contain" width={60} height={60} />
                <span className="font-bold text-xl text-brand-black">LAUF</span>
            </div>

            <div className="hidden md:flex gap-2 p-1 bg-brand-gray-light rounded-full border border-brand-gray-medium/60 shadow-inner">
                {['inicio', 'sobre', 'atividades', 'contato'].map((item) => (
                    <button
                        key={item}
                        onClick={() => handleNavClick(item)}
                        className={`capitalize font-medium px-6 py-2 rounded-full transition-all duration-300 ${activeSection === item
                            ? "bg-linear-to-r from-brand-purple to-brand-purple-hover text-white shadow-md shadow-brand-purple/20 scale-105"
                            : "text-brand-text hover:text-brand-purple hover:bg-brand-gray-medium"
                            }`}
                    >
                        {item === 'inicio' ? 'Início' : item}
                    </button>
                ))}
            </div>

            <Link 
                to="/login"
                className="bg-brand-purple text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-purple-hover transition-all hover:scale-105 shadow-md shadow-brand-purple/20"
            >
                Área do Membro
            </Link>
        </nav>
    );
}