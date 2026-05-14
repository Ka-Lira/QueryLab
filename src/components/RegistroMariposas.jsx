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

    /* funccion submit - enviar ao BDD // errors*/
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro(null);    

        try {
            /* criar localização - se preenchida */
            let id_localizacion = null;
            if (form.provincia || form.pais || form.latitud || form.longitud) {
                const { data: loc, error: errLoc } = await supabase
                    .from('localizaciones')
                    .insert({
                        latitud: form.latitud || null,
                        longitud: form.longitud || null,
                        description: form.description || null,
                        provincia: form.provincia || null,
                        pais: form.pais || null,
                    })
                    .select()
                    .single();

                if (errLoc) throw new Error('Error al guardar localización: ' + errLoc.message);
                id_localizacion = loc.id_localizacion;
            }

            /* criar exemplar principal */
            const { data: ejemplar, error: errEj } = await supabase
                .from('ejemplares')
                .insert({
                    id_especie: form.id_especie || null,
                    fecha_captura: form.fecha_captura,
                    hora_captura: form.hora_captura || null,
                    tamano: form.tamano || null,
                    id_localizacion: id_localizacion,
                })
                .select()
                .single();

            if (errEj) throw new Error('Error al guardar Ejemplar: ' + errEj.message);

            const id_ejemplar = ejemplar.id_ejemplar;
            console.log('ID do ejemplar criado:', id_ejemplar);

            /* datos específicos por tipo */
            if (form.tipo.trim().toLowerCase() === 'coleccion') {
                const { error: errCol } = await supabase
                    .from('coleccionables')
                    .insert({
                        id_ejemplar,
                        precio: form.precio || null,
                        comentarios: form.comentarios || null,
                    });
                if (errCol) throw new Error('Error al guardar coleccionable: ' + errCol.message);
            }

            if (form.tipo.trim().toLowerCase() === 'investigacion') {
                const { error: errInv } = await supabase
                    .from('investigaciones')
                    .insert({
                        id_ejemplar,
                        fecha_inicio: form.fecha_inicio || null,
                        fecha_fin: form.fecha_fin || null,
                        conclusiones: form.conclusiones || null,
                    });
                if (errInv) throw new Error('Error al guardar investigación ' + errInv.message);
            }

            /* registrar captura (pessoa -> exemplar) */
           try{
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: persona } = await supabase
                        .from('personas')
                        .select('id_persona')
                        .eq('email', user.email)
                        .single();
                    
                    if (persona?.id_persona) {
                        await supabase.from('capturas').insert({
                            id_persona: persona.id_persona,
                            id_ejemplar: id_ejemplar,
                            fecha: form.fecha_captura,
                            hora: form.hora_captura || null,
                        });
                    }
                }
            } catch (capturaErr) {
                console.warn('Captura no registrada (persona no encontrada):', capturaErr.message);
            }

            /* teste // debugar */
            console.log('INSERT COLECCIONABLE', {
                id_ejemplar,
                precio: form.precio,
                comentarios: form.comentarios,
            });

        } catch (error) {
            setErro(error.message || 'Error al guardar el ejemplar');
        } finally {
            setLoading(false);
        }
    };
    /* fim - enviar ao BDD */

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
                <form onSubmit={handleSubmit} className="space-y-8 px-8 py-6">

                    {/* Seccao 1, obrigatorios */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-500 mb-4">
                            Datos Básicos
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            <div className="md:col-span-2">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                                    Tipo de Ejemplar *
                                </label>
                                <select
                                    name="tipo"
                                    value={form.tipo}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value="">Selecciona un tipo...</option>
                                    <option value="coleccion">Colección</option>
                                    <option value="investigacion">Investigación</option>
                                    <option value="observacion">Observación</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                                    Fecha de Captura *
                                </label>
                                <input
                                    type="date"
                                    name="fecha_captura"
                                    value={form.fecha_captura}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                                    Especie
                                </label>
                                <select
                                    name="id_especie"
                                    value={form.id_especie}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value="">Sin especie asignada</option>
                                    {especies.map(esp => (
                                        <option key={esp.id_especie} value={esp.id_especie}>
                                            {esp.nombre_comun} — {esp.nombre_cientifico}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>
                    </div> {/* fim seccao 1 */}

                    {/* seccao 2 - localizacao */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-500 mb-4">
                            Localización <span className="text-slate-400 normal-case font-normal">(opcional)</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            <div>
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Hora de Captura</label>
                                <input 
                                    type="time" 
                                    name="hora_captura" 
                                    value={form.hora_captura} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Tamaño</label>
                                <input 
                                    type="text" 
                                    name="tamano" 
                                    value={form.tamano} 
                                    onChange={handleChange} 
                                    placeholder="Ej: 4.5cm"
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Provincia</label>
                                <input 
                                type="text" 
                                name="provincia" 
                                value={form.provincia} 
                                onChange={handleChange} 
                                placeholder="Ej: Madrid"
                                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">País</label>
                                <input 
                                    type="text" 
                                    name="pais" 
                                    value={form.pais} 
                                    onChange={handleChange} 
                                    placeholder="Ej: España"
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Latitud</label>
                                <input 
                                    type="number" 
                                    step="any" 
                                    name="latitud" 
                                    value={form.latitud} 
                                    onChange={handleChange} 
                                    placeholder="Ej: 40.4168"
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Longitud</label>
                                <input 
                                    type="number" 
                                    step="any" 
                                    name="longitud" 
                                    value={form.longitud} 
                                    onChange={handleChange} 
                                    placeholder="Ej: -3.7038"
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Descripción del lugar</label>
                                <input 
                                    type="text" 
                                    name="description" 
                                    value={form.description} 
                                    onChange={handleChange} 
                                    placeholder="Ej: Parque Natural de Peñalara"
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                        </div>
                    </div> {/* fim seccao 2 */}

                    {/* seccao 3 - campos condicionais */}
                    <AnimatePresence>
                        {form.tipo === 'coleccion' && (
                            <motion.div
                                key="coleccion"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-500 mb-4">
                                    Datos de Colección
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Precio (€)</label>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            name="precio" 
                                            value={form.precio} 
                                            onChange={handleChange} 
                                            placeholder="Ej: 12.50"
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Comentarios</label>
                                        <textarea 
                                            name="comentarios" 
                                            value={form.comentarios} 
                                            onChange={handleChange} 
                                            rows={3} placeholder="Observaciones sobre el ejemplar..."
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {form.tipo === 'investigacion' && (
                            <motion.div
                                key="investigacion"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-500 mb-4">
                                    Datos de Invesigación
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Fecha Inicio</label>
                                        <input 
                                            type="date" 
                                            name="fecha_inicio" 
                                            value={form.fecha_inicio} 
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Fecha Fin</label>
                                        <input 
                                            type="date" 
                                            name="fecha_fin" 
                                            value={form.fecha_fin} 
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Conclusiones</label>
                                        <textarea 
                                            name="conclusiones" 
                                            value={form.conclusiones} 
                                            onChange={handleChange} 
                                            rows={3} placeholder="Conclusiones del estudio..."
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                                        />
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence> {/* fim seccao 3 */}

                    {/* Errors y button */}
                    {erro && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm">
                            {erro}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/20 transition-all"
                    >
                        {loading ? 'Guardando...' : '🦋 Registrar Ejemplar'}
                    </button>
                </form>

            </motion.div>
        </div> /* FIM - div principal */
    );
};

export default RegistroMariposas;