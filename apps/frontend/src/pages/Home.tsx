"use client";
import Header from "../components/Header";
import { GoCpu } from "react-icons/go";
import {
  FaRobot,
  FaCode,
  FaArrowRight,
  FaUsers,
  FaLightbulb,
  FaChalkboardTeacher,
  FaInstagram
} from "react-icons/fa";

export default function Home() {
  function scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <main className="min-h-screen">
      <Header />
      {/* SEÇÃO HERO */}
      <section id="inicio" className="bg-brand-black text-brand-white min-h-screen flex items-center pt-20 pb-12">
        <div className="w-full max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Inovando com <span className="text-brand-purple">Arduino</span> na Prática
            </h1>
            <p className="text-brand-gray-medium text-lg md:text-xl leading-relaxed max-w-lg">
              A Liga de Arduino da UNINASSAU é o espaço ideal para transformar teoria em projetos reais. Desenvolva habilidades em eletrônica, programação e robótica.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <button
                onClick={() => scrollTo('atividades')}
                className="bg-brand-purple hover:bg-brand-purple-hover text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 transition-all hover:scale-105"
              >
                Conheça nossos projetos <FaArrowRight />
              </button>
              <button
                onClick={() => scrollTo('sobre')}
                className="bg-transparent border-2 border-brand-gray-medium hover:border-brand-white text-white px-8 py-4 rounded-full font-semibold transition-all"
              >
                Saber mais
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center relative">
            <div className="absolute inset-0 bg-brand-purple/20 blur-[100px] rounded-full w-3/4 h-3/4 m-auto z-0"></div>
            <div className="relative z-10 bg-brand-black border border-brand-gray-medium/20 p-16 rounded-3xl shadow-2xl">
              <GoCpu className="text-[12rem] text-brand-purple" />
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO SOBRE */}
      <section id="sobre" className="bg-brand-white min-h-screen flex items-center py-24 border-b border-brand-gray-medium">
        <div className="w-full max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
            <div className="md:w-1/2">
              <h2 className="text-brand-purple font-semibold tracking-wide uppercase text-sm mb-2">Quem Somos</h2>
              <h3 className="text-4xl font-bold text-brand-black mb-6">Liderando a Inovação Maker na UNINASSAU</h3>
              <p className="text-brand-text text-lg leading-relaxed">
                A LAUF (Liga de Arduino Uninassau Fortaleza) nasceu da vontade de conectar alunos apaixonados por hardware e software. Nosso foco é preencher a lacuna entre a teoria acadêmica e a construção de soluções tecnológicas reais.
              </p>
            </div>
            <div className="md:w-1/2 bg-brand-gray-light p-8 rounded-3xl border border-brand-gray-medium">
              <p className="italic text-brand-text border-l-4 border-brand-purple pl-4">
                "Transformamos componentes eletrônicos em soluções inteligentes, um código por vez."
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-brand-gray-light border border-transparent hover:border-brand-purple/30 transition-all shadow-sm">
              <FaUsers className="text-3xl text-brand-purple mb-4" />
              <h4 className="text-xl font-bold text-brand-black mb-2">Comunidade Ativa</h4>
              <p className="text-brand-text text-sm leading-relaxed">
                Um ambiente colaborativo onde veteranos e calouros de engenharia trocam experiências e resolvem desafios juntos.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-brand-gray-light border border-transparent hover:border-brand-purple/30 transition-all shadow-sm">
              <FaChalkboardTeacher className="text-3xl text-brand-purple mb-4" />
              <h4 className="text-xl font-bold text-brand-black mb-2">Mentoria Técnica</h4>
              <p className="text-brand-text text-sm leading-relaxed">
                Suporte constante no desenvolvimento de lógica em C++, estruturação de circuitos e boas práticas de código limpo.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-brand-gray-light border border-transparent hover:border-brand-purple/30 transition-all shadow-sm">
              <FaLightbulb className="text-3xl text-brand-purple mb-4" />
              <h4 className="text-xl font-bold text-brand-black mb-2">Cultura Maker</h4>
              <p className="text-brand-text text-sm leading-relaxed">
                Estímulo total à criatividade, desde protótipos simples com sensores até projetos complexos de IoT e robótica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO ATIVIDADES */}
      <section id="atividades" className="bg-brand-gray-light min-h-screen flex items-center py-24">
        <div className="w-full max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-black">Nossas Atividades</h2>
            <p className="text-brand-text mt-4">O que desenvolvemos dentro da liga</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-white p-8 rounded-2xl shadow-sm border border-brand-gray-medium hover:border-brand-purple transition-all group">
              <div className="w-14 h-14 bg-brand-purple/10 rounded-xl mb-6 flex items-center justify-center group-hover:bg-brand-purple transition-colors">
                <GoCpu className="text-2xl text-brand-purple group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-3">Eletrônica</h3>
              <p className="text-brand-text leading-relaxed">Aprenda desde o funcionamento de resistores até a montagem de circuitos complexos.</p>
            </div>

            <div className="bg-brand-white p-8 rounded-2xl shadow-sm border border-brand-gray-medium hover:border-brand-purple transition-all group">
              <div className="w-14 h-14 bg-brand-purple/10 rounded-xl mb-6 flex items-center justify-center group-hover:bg-brand-purple transition-colors">
                <FaCode className="text-2xl text-brand-purple group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-3">Programação</h3>
              <p className="text-brand-text leading-relaxed">Desenvolva a lógica de programação utilizando C++ e outras linguagens focadas em hardware.</p>
            </div>

            <div className="bg-brand-white p-8 rounded-2xl shadow-sm border border-brand-gray-medium hover:border-brand-purple transition-all group">
              <div className="w-14 h-14 bg-brand-purple/10 rounded-xl mb-6 flex items-center justify-center group-hover:bg-brand-purple transition-colors">
                <FaRobot className="text-2xl text-brand-purple group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-3">Robótica</h3>
              <p className="text-brand-text leading-relaxed">Crie sistemas autônomos, braços robóticos e integre sensores mecânicos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO CONTATO */}
      <section id="contato" className="bg-brand-black text-brand-white min-h-screen flex items-center py-24 border-t border-brand-gray-medium/20">
        <div className="w-full max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-20 h-20 bg-brand-purple/20 rounded-full flex items-center justify-center mb-8 border border-brand-purple/30 hover:scale-110 transition-transform">
              <FaInstagram className="text-4xl text-brand-purple" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">Conecte-se com a LAUF</h2>
            <p className="text-brand-gray-medium text-lg leading-relaxed mb-10 max-w-lg">
              Quer fazer parte da liga, acompanhar a construção dos nossos projetos de perto ou tirar alguma dúvida? Nossa principal rede de comunicação é o Instagram. Segue a gente por lá!
            </p>

            <a
              href="https://www.instagram.com/lauf.for?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-purple hover:bg-brand-purple-hover text-white px-10 py-4 rounded-full font-semibold flex items-center gap-3 transition-all hover:scale-105 shadow-lg shadow-brand-purple/20"
            >
              <FaInstagram className="text-xl" />
              Acessar Instagram da LAUF
            </a>
          </div>
          <div className="w-full"></div>
        </div>
      </section>

      <footer className="bg-brand-black text-brand-gray-medium py-6 border-t border-brand-gray-medium/10 text-center text-sm">
        <p>© {new Date().getFullYear()} Liga de Arduino UNINASSAU Fortaleza (LAUF). Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
