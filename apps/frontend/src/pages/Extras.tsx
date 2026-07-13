"use client";
import { useAuth } from "../context/AuthContext";
import { BiLogOut } from "react-icons/bi";


export default function Extras() {
    const { logout } = useAuth()

    return (
        <div>
            <h1>Extras</h1>
            <button onClick={logout} className="px-6 py-3 bg-brand-purple rounded-lg font-medium text-white hover:bg-brand-purple/90 transition-colors">
                <BiLogOut /> Sair
            </button>
        </div>
    )
}