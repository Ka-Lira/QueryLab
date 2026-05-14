import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';

const GestionEspecies = ({ onClose }) => {
    const [especies, setEspecies] = useState([]);
    const [nombreComun, setNombreComun] = useState('');
    const [nombreCientifico, setNombreCientifico] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchEspecies = async () => {
        const { data } = await supabase.from('especies').select('*').order('nombre_comun');
        setEspecies(data || []);
    };

    useEffect(() => { fetchEspecies(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        await supabase.from('especies').insert({
            nombre_comun: nombreComun,
            nombre_cientifico: nombreCientifico
        });
        setNombreComun('');
        setNombreCientifico('');
        fetchEspecies();
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Especies</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleAdd} className="space-y-4 mb-8">
                    <input
                        className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-none px-4"
                        placeholder="Nombre común (Ej: Monarca)"
                        value={nombreComun}
                        onChange={(e) => setNombreComun(e.target.value)}
                        required
                    />
                    <input 
                        className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-none px-4"
                        placeholder="Nombre Científico"
                        value={nombreCientifico}
                        onChange={(e) => setNombreCientifico(e.target.value)}
                    />

                    <button className="w-full bg-cyan-500 py-3 rounded-xl font-bold text-white hover:bg-cyan-600 transition-colors">
                        {loading ? 'Añadiendo...' : '+ Añadir Especie'}
                    </button>

                </form>

                <div className="max-h-60 overflow-y-auto space-y-2">
                    {especies.map(esp => (
                        <div key={esp.id_especie} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex justify-between border border-slate-100 dark:border-slate-700">
                            <span className="font-semibold">{esp.nombre_comun}</span>
                            <span className="text-xs italic text-slate-500">{esp.nombre_cientifico}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default GestionEspecies;