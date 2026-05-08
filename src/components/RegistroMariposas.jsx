import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const RegistroMariposas = ({ onClose, onSuccess }) => {
    /* form principal */
    const [form, setForm] = useState({
        /* obrigatorios */
        fecha_captura: '',
        tipo: '',

        /* localizacao - opcionais */
        hora_captura: '',
        tamano: '',

        /* especie */
        id_especie: '',

        /* coleccionable */
        precio: '',
        comentarios: '',

        /* investigacion */
        fecha_inicio: '',
        fecha_fin: '',
        conclusiones: '',

        /* localizacao */
        latitud: '',
        longitud: '',
        description: '',
        provincia: '',
        pais: '',
    });

    /* datos auxiliares */
    const [especies, setEspecies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);
    const [sucesso, setSucesso] = useState(false);

    /* cargar especies para select */
    useEffect(() => {
        const fetchEspecies = async () => {
            const { data } = await supabase.from('especies').select('*');
            if (data) setEspecies(data);
        };
        fetchEspecies();
    }, []);

    /* funccion generica para atualizar campo */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                {/* header */}
                <div className="sticky top-0 bg-white dark:bg-slate-800 px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-2xl font-bold">🦋 Nuevo Ejemplar</h2>
                        <p className="text-slate-500 text-sm mt-1">Completa los datos del ejemplar capturado.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* corpo formulário */}
                <div className="px-8 py-6">
                    <p className="text-slate-400 italic text-center">Formulário em construção...</p>
                </div>
            </motion.div>
        </div> /* div principal */
    );
};

export default RegistroMariposas;