"use client";

import { useAuth } from "../context/AuthContext";
import { FaHandSparkles, FaShieldAlt } from "react-icons/fa";

export default function BoasVindas() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center bg-brand-gray-light rounded-2xl shadow-xl p-8 max-w-lg text-center border-t-4 border-brand-purple">
            <div className="bg-brand-purple/10 p-4 rounded-full mb-4">
                <FaHandSparkles className="text-4xl text-brand-purple" />
            </div>

            <h1 className="text-3xl font-bold text-brand-black mb-2">
                Bem-vindo(a), {user?.nome}!
            </h1>

            <p className="text-brand-text mb-6 text-black">
                Seu cadastro foi realizado com os seguintes dados:
                <br />
                <strong>Email:</strong> {user?.email}
                <br />
                <strong>Matrícula:</strong> {user?.matricula}
                <br />
                <strong>Cargo:</strong> {user?.cargo}
                <br />
                <strong>Curso:</strong> {user?.curso}
                <br />
                <strong>Telefone:</strong> {user?.telefone}
                <br />
                <span className="font-semibold text-red-700">Notou algo errado? Entre em contato no grupo do whatsapp da liga para corrigirmos!</span>
            </p>

            <div className="flex flex-col items-center p-5 bg-brand-gray-medium/50 rounded-xl border border-brand-gray-medium">
                <FaShieldAlt className="text-3xl text-brand-purple mb-3" />
                <p className="text-sm text-black text-brand-text font-medium leading-relaxed">
                    Fique tranquilo(a): <strong>seu acesso já está garantido!</strong>
                    <br />
                    No momento estamos construindo o nosso sistema. Logo traremos muitas novidades e funcionalidades incríveis para você.
                </p>
            </div>
        </div>
    );
}   