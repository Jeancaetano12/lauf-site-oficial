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
import roboImg from "../assets/img-robo-eng.png.png";
import roboChatImg from "../assets/img-robo-chat.png";
import roboTargetImg from "../assets/img-robo-target.png";

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

          <div className="flex justify-center items-center relative h-full min-h-[300px] md:min-h-[400px]">
            {/* brilho de fundo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-purple/30 blur-[100px] rounded-full w-[250px] h-[250px] md:w-[400px] md:h-[400px] z-0"></div>

            {/* imagem do robo */}
            <div className="relative z-10 flex items-center justify-center">
              <img
                src={roboImg}
                alt="Robô Engenharia LAUF"
                className="w-[18rem] md:w-[24rem] lg:w-120 object-contain drop-shadow-[0_0_30px_rgba(110,64,201,0.4)] transition-all duration-700 hover:scale-110 hover:-translate-y-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO SOBRE */}
      <section id="sobre" className="bg-brand-white min-h-screen flex items-center py-24 border-b border-brand-gray-medium">
        <div className="w-full max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
            <div className="w-full md:w-1/2">
              <h2 className="text-brand-purple font-semibold tracking-wide uppercase text-sm mb-2">Quem Somos</h2>
              <h3 className="text-4xl font-bold text-brand-black mb-6">Liderando a Inovação Maker na UNINASSAU</h3>
              <p className="text-brand-text text-lg leading-relaxed">
                A LAUF (Liga de Arduino Uninassau Fortaleza) nasceu da vontade de conectar alunos apaixonados por hardware e software. Nosso foco é preencher a lacuna entre a teoria acadêmica e a construção de soluções tecnológicas reais.
              </p>
            </div>
            <div className="w-full md:w-1/2 flex justify-center relative">
              {/* brilho de fundo opcional para combinar com os outros */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-purple/20 blur-[60px] rounded-full w-[120px] h-[120px] md:w-[180px] md:h-[180px] z-0"></div>
              <img
                src={roboTargetImg}
                alt="Robô Alvo LAUF"
                className="relative z-10 w-40 md:w-56 lg:w-[18rem] object-contain drop-shadow-[0_0_25px_rgba(110,64,201,0.3)] transition-transform duration-700 hover:scale-110 hover:-translate-y-3"
              />
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
            <p className="text-brand-text mt-4">O que desenvolvemos dentro da liga:</p>
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
          <div className="w-full flex justify-center items-center relative min-h-[300px]">
            {/* Efeito de brilho atrás do robô */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-purple/20 blur-[80px] rounded-full w-[200px] h-[200px] md:w-[300px] md:h-[300px] z-0"></div>

            {/* Imagem do robô chat */}
            <img
              src={roboChatImg}
              alt="Robô de Contato LAUF"
              className="relative z-10 w-56 md:w-[20rem] lg:w-[24rem] object-contain drop-shadow-[0_0_25px_rgba(110,64,201,0.3)] transition-transform duration-700 hover:scale-110 hover:-translate-y-3"
            />
          </div>
        </div>
      </section>

      <footer className="bg-brand-black text-brand-gray-medium py-6 border-t border-brand-gray-medium/10 text-center text-sm">
        <p>© {new Date().getFullYear()} Liga de Arduino UNINASSAU Fortaleza (LAUF). Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
