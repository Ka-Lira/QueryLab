import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChevronDown, HiOutlineBeaker, HiOutlineTag, HiOutlineCubeTransparent } from 'react-icons/hi';

const MenuGestion = ({ 
    onManageEspecies, 
    onManageLaboratorios,
    onManageAsignarEspecie
}) => {
    const [abierto, setAbierto] = useState(false);

    return (
        <div className='relative z-30'>
            <button
                onClick={() => setAbierto(!abierto)}
                className='bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-2xl font-bold shadow-lg transition-all flex items-center gap-2 border border-slate-700'
            >
                <HiOutlineChevronDown className={`transition-transform ${abierto ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {abierto && (
                    <>
                        {/* Overlay invisible --- cerrar al clic fuera */}
                        <div className="fixed inset-0 z-10" onClick={() => setAbierto(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-40"
                        >
                            <div className="p-2">
                                <button
                                    onClick={() => {
                                        onManageEspecies(); 
                                        setAbierto(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-cyan-500 hover:text-white rounded-xl transition-colors"
                                >
                                    <HiOutlineTag className="text-lg" />
                                    Gestionar Especies
                                </button>

                                <button
                                    onClick={() => {
                                        onManageLaboratorios();
                                        setAbierto(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-cyan-500 hover:text-white rounded-xl transition-colors"
                                >
                                    <HiOutlineBeaker className="text-lg" />
                                    Gestionar laboratorios
                                </button>

                                <button
                                    onClick={() => {
                                        onManageAsignarEspecie?.();
                                        setAbierto(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-cyan-500 hover:text-white rounded-xl transition-colors"
                                    
                                >
                                    <HiOutlineCubeTransparent className="text-lg" />
                                    Asignar Especie
                                </button>

                                <button
                                    disabled
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed rounded-xl"
                                >
                                    <HiOutlineBeaker className="text-lg" />
                                    Habrá actualizaciones.
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MenuGestion;