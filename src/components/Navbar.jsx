import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { HiSun, HiMoon, HiMenu, HiX } from "react-icons/hi";
import { supabase } from "../lib/supabaseClient";

const Navbar = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    /* capturar usuario logado */
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        /* verificar seccion */
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        /* verificar alteração de login/logout */
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    /* logout */
    const handleLogout = async () => {
        await supabase.auth.signOut();
        alert("¡Hasta pronto!")
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/10 dark:bg-slate-900/50 backdrop-blur-md border-b border-white/20 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                        >
                            QueryLab
                        </motion.span>
                    </Link>

                    {/* menu desktop */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link to="/parte1" className="hover:text-cyan-400 transition-colors dark:text-slate-300">
                            Parte 1
                        </Link>
                        <Link to="/parte2" className="hover:text-cyan-400 transition-colors dark:text-slate-300">
                            Parte 2
                        </Link>
                        <Link to="/parte3" className="hover:text-cyan-400 transition-colors dark:text-slate-300">
                            SQL Playground
                        </Link>

                        {/* boton theme */}
                        <button 
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:ring-2 ring-cyan-400 transition-all"
                        >
                            {isDarkMode ? <HiSun size={20} /> : <HiMoon size={20} />}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="hidden sm:block text-sm dark:text-slate-300">
                                    Hola, {user.email.split('@')[0]}
                                </span>
                                <button 
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all text-sm"
                                >
                                    Salir
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white transition-all shadow-lg shadow-cyan-500/30">
                                Entrar
                            </Link>
                        )}
                    </div>

                    {/* boton mobile */}
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={toggleTheme} className="dark:text-yellow-400 text-slate-600">
                            {isDarkMode ? <HiSun size={24} /> : <HiMoon size={24} />}
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className="dark:text-white text-slate-900">
                            {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
                        </button>
                    </div>

                </div>
            </div>

            {/* menu mobile - desplegable */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-4"
                >
                    <Link to="/parte1" className="block text-slate-600 dark:text-slate-300">
                        Parte 1
                    </Link>
                    <Link to="/parte2" className="block text-slate-600 dark:text-slate-300">
                        Parte 2
                    </Link>
                    <Link to="/parte3" className="block text-slate-600 dark:text-slate-300">
                        SQL Playground
                    </Link>
                    <Link to="/login" className="block text-cyan-500 font-bold">
                        Entrar
                    </Link>
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;