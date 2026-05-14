import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { HiOutlineX, HiOutlineTrash } from 'react-icons/hi';

const GestionLaboratorios = ({ onClose, userRole }) => {
    const [laboratorios, setLaboratorios] = useState([]);
    const [tab, setTab] = useState('labs'); // labs = 'investigaciones' | 'asociar'
    const [direcciones, setDirecciones] = useState([]);
    const [investigaciones, setInvestigaciones] = useState([]);
    const [ejemplares, setEjemplares] = useState([]);

    /* Form - novo laboratorio */
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [usarDireccionExistente, setUsarDireccionExistente] = useState(true);
    const [direccionSeleccionada, setDireccionSeleccionada] = useState('');

    /* campos - nueva direccion */
    const [calle, setCalle] = useState('');
    const [numero, setNumero] = useState('');
    const [piso, setPiso] = useState('');
    const [puerta, setPuerta] = useState('');
    const [codigo_postal, setCodigoPostal] = useState('');
    const [localidad, setLocalidad] = useState('');
    const [provincia, setProvincia] = useState('');

    /* Form - asociar investigación */
    const [asociarEjemplarId, setAsociarEjemplarId] = useState('');
    const [asociarLaboratorioId, setAsociarLaboratorioId] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [conclusiones, setConclusiones] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchLaboratorios = async () => {
        const { data, error } = await supabase
            .from('laboratorios')
            .select(`
                id_laboratorio, 
                nombre, 
                id_direccion, 
                direcciones (
                    id_direccion, 
                    calle, 
                    numero, 
                    piso, 
                    puerta, 
                    codigo_postal, 
                    localidad, 
                    provincia
                )
            `)
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error cargando laboratorios', error);
                setLaboratorios([]);
        } else {
            setLaboratorios(data || []);
        }
    };

    const fetchDirecciones = async () => {
        const { data, error } = await supabase
            .from('direcciones')
            .select('*')
            .order('localidad', { ascending: true });

        if (error) {
            console.error('Error cargando direcciones', error);
            setDirecciones([]);
        } else {
            setDirecciones(data || []);
        }
  };

    const fetchInvestigaciones = async () => {
        /* pegar investgaciones con join em ejemplares - y especie y laboratorio */
        const { data, error } = await supabase
            .from('investigaciones')
            .select(`
                    id_investigacion,
                    fecha_inicio,
                    fecha_fin,
                    conclusiones,
                    laboratorios (
                        id_laboratorio, 
                        nombre
                    ),
                    ejemplares (
                        id_ejemplar,
                        fecha_captura,
                        tamano,
                        especies (
                            id_especie, 
                            nombre_comun, 
                            nombre_cientifico
                        )
                    )
            `)
            .order('fecha_inicio', { ascending: false });

        if (error) {
            console.error('Error cargando investigaciones', error);
                setInvestigaciones([]);
        } else {
            setInvestigaciones(data || []);
        }
    };

    const fetchEjemplares = async () => {
        /* puxar ejemplar + especie */
        const { data, error } = await supabase
            .from('ejemplares')
            .select(`
                id_ejemplar, 
                fecha_captura,
                tamano, 
                especies (
                    id_especie, 
                    nombre_comun, 
                    nombre_cientifico
                )
            `)
            .order('fecha_captura', { ascending: false });
        
        if (error) {
            console.error('Error cargando ejemplares', error);
                setEjemplares([]);
        } else {
            setEjemplares(data || []);
        }
    };

    useEffect(() => {
        fetchLaboratorios();
        fetchDirecciones();
        fetchInvestigaciones();
        fetchEjemplares();
    }, []);

    /* criar laboratorio com opção de criar nova direccion */
    const handleCrearLaboratorio = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let idDireccionFinal = direccionSeleccionada || null;

            if (!usarDireccionExistente) {
                /* criar uma novoa direccion */
                const { data: nuevaDir, error: errDir } = await supabase
                    .from('direcciones')
                    .insert({
                        calle,
                        numero,
                        piso,
                        puerta,
                        codigo_postal,
                        localidad,
                        provincia
                    })
                    .select('id_direccion')
                    .single();

                if (errDir) throw errDir;
                idDireccionFinal = nuevaDir.id_direccion;
            }

            const payload = {
                nombre: nuevoNombre,
                id_direccion: idDireccionFinal
            };

            const { error: errLab } = await supabase
                .from('laboratorios')
                .insert(payload);
            
            if (errLab) throw errLab;

            /* reset form */
            setNuevoNombre('');
            setDireccionSeleccionada('');
            setCalle(''); 
            setNumero(''); 
            setPiso(''); 
            setPuerta(''); 
            setCodigoPostal(''); 
            setLocalidad(''); 
            setProvincia('');

            await fetchLaboratorios();
            await fetchDirecciones();
        } catch (err) {
            console.error('Error creando laboratorio', err);
                setError('No se pudo crear el laboratorio.');
        } finally {
            setLoading(false);
        }
    };

    const handleEliminarLaboratorio = async (id) => {
        if (!confirm('¿Eliminar laboratorio? Esta acción es irreversible.')) return;
        setLoading(true);
        try {
            const { error: err } = await supabase
                .from('laboratorios')
                .delete()
                .eq('id_laboratorio', id);

            if (err) throw err;
            await fetchLaboratorios();
        } catch (err) {
            console.error('Error eliminando laboratorio', err);
            setError('No se pudo eliminar el laboratorio.');
        } finally {
            setLoading(false);
        }
    };

    const handleAsociarInvestigacion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try{
            const payload = {
                id_ejemplar: asociarEjemplarId,
                id_laboratorio: asociarLaboratorioId,
                fecha_inicio: fechaInicio || null,
                fecha_fin: fechaFin || null,
                conclusiones: conclusiones || null
            };

            const { error: err } = await supabase
                .from('investigaciones')
                .insert(payload);

            if (err) throw err;

            /* reset */
            setAsociarEjemplarId('');
            setAsociarLaboratorioId('');
            setFechaInicio('');
            setFechaFin('');
            setConclusiones('');
            await fetchInvestigaciones();
        } catch (err) {
            console.error('Error asociando investigacion', err);
            setError('No se pudo crear la investigación.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 z-40" onClick={onClose}></div>

            <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                exit={{ y: 20, opacity: 0 }} 
                className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl p-6 z-50 ring-1 ring-slate-700">

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">🔬 Gestión de Laboratorios</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-2 rounded-full">
                                <HiOutlineX size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-6">
                        <button onClick={() => setTab('labs')} className={`px-4 py-2 rounded-2xl ${tab === 'labs' ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-900'}`}>Laboratorios</button>
                        <button onClick={() => setTab('investigaciones')} className={`px-4 py-2 rounded-2xl ${tab === 'investigaciones' ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-900'}`}>Investigaciones</button>
                        <button onClick={() => setTab('asociar')} className={`px-4 py-2 rounded-2xl ${tab === 'asociar' ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-900'}`}>+ Asociar</button>
                    </div>

                    {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

                    {/* area labs */}
                    {tab === 'labs' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {laboratorios.map(l => (
                                    <div key={l.id_laboratorio} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-700 flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold">{l.nombre}</div>
                                                <div className="text-sm text-slate-500">
                                                {l.direcciones ? `${l.direcciones.calle || ''} ${l.direcciones.numero || ''}, ${l.direcciones.localidad || ''} ${l.direcciones.provincia || ''}` : 'Dirección no definida'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {userRole === 'admin' && (
                                                <button className="text-red-400 hover:text-red-200 p-2" onClick={() => handleEliminarLaboratorio(l.id_laboratorio)}>
                                                    <HiOutlineTrash />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6">
                                <h4 className="font-semibold mb-2">+ Nuevo Laboratorio</h4>
                                <form onSubmit={handleCrearLaboratorio} className="space-y-3">
                                    <input 
                                        value={nuevoNombre} 
                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                        required 
                                        placeholder="Nombre del laboratorio" 
                                        className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900" 
                                    />
                                    <div className="flex items-center gap-3">
                                        <label className="inline-flex items-center gap-2">
                                            <input 
                                                type="radio" 
                                                checked={usarDireccionExistente} 
                                                onChange={() => setUsarDireccionExistente(true)} 
                                            />
                                            Seleccionar dirección existente
                                        </label>

                                        <label className="inline-flex items-center gap-2">
                                            <input 
                                                type="radio" 
                                                checked={!usarDireccionExistente} 
                                                onChange={() => setUsarDireccionExistente(false)} 
                                            />
                                            Crear nueva dirección
                                        </label>
                                    </div>

                                    {usarDireccionExistente ? (
                                        <select 
                                            value={direccionSeleccionada} 
                                            onChange={(e) => setDireccionSeleccionada(e.target.value)} 
                                            className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900"
                                        >
                                            <option value="">-- Selecciona dirección (opcional)</option>
                                            {direcciones.map(d => (
                                                <option key={d.id_direccion} value={d.id_direccion}>
                                                    {`${d.calle || ''} ${d.numero || ''} — ${d.localidad || ''} ${d.provincia || ''}`}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <input placeholder="Calle" 
                                                value={calle} 
                                                onChange={(e) => setCalle(e.target.value)} 
                                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900" 
                                            />

                                            <input 
                                                placeholder="Número" 
                                                value={numero} onChange={(e) => setNumero(e.target.value)} 
                                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900" 
                                            />

                                            <input 
                                                placeholder="Piso" 
                                                value={piso} 
                                                onChange={(e) => setPiso(e.target.value)} 
                                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900" 
                                            />

                                            <input 
                                                placeholder="Puerta" 
                                                value={puerta} onChange={(e) => setPuerta(e.target.value)} 
                                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900" 
                                            />

                                            <input 
                                                placeholder="Código Postal" 
                                                value={codigo_postal} onChange={(e) => setCodigoPostal(e.target.value)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900" 
                                            />

                                            <input 
                                                placeholder="Localidad" 
                                                value={localidad} onChange={(e) => setLocalidad(e.target.value)} 
                                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900" 
                                            />

                                            <input 
                                                placeholder="Provincia" 
                                                value={provincia} onChange={(e) => setProvincia(e.target.value)} 
                                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900" 
                                            />

                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <button type="submit" disabled={loading} className="bg-cyan-500 px-4 py-2 rounded-xl text-white font-bold">
                                            {loading ? 'Guardando...' : 'Crear laboratorio'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* TAB: INVESTIGACIONES */}
                    {tab === 'investigaciones' && (
                        <div className="space-y-4">
                            {investigaciones.length === 0 ? (
                                <div className="text-slate-500">No hay investigaciones registradas.</div>
                                ) : (
                                investigaciones.map(inv => (
                                    <div key={inv.id_investigacion} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-700">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold">{inv.ejemplares?.especies?.nombre_comun || 'Especie no identificada'}</div>
                                                <div className="text-sm text-slate-400">{inv.ejemplares?.especies?.nombre_cientifico || ''}</div>
                                                <div className="text-sm text-slate-500 mt-1">
                                                {inv.ejemplares ? `Ejemplar: ${inv.ejemplares.id_ejemplar}` : ''}
                                                </div>
                                                <div className="text-sm text-slate-500 mt-1">{inv.conclusiones ? inv.conclusiones : ''}</div>
                                            </div>
                                            <div className="text-sm text-slate-400 text-right">
                                                <div>{inv.laboratorios?.nombre || 'Laboratorio'}</div>
                                                <div>{inv.fecha_inicio ? inv.fecha_inicio : ''} - {inv.fecha_fin ? inv.fecha_fin : 'En curso'}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* TAB: ASOCIAR */}
                    {tab === 'asociar' && (
                        <div>
                            <form
                                onSubmit={handleAsociarInvestigacion}
                                className="space-y-3"
                            >
                                <select 
                                    value={asociarEjemplarId} 
                                    onChange={(e) => setAsociarEjemplarId(e.target.value)}
                                    required
                                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900"
                                >
                                    <option value="">-- Selecciona ejemplar</option>
                                    {ejemplares.map(ex => {
                                        const especie = ex.especies?.nombre_comun
                                            || ex.especies?.nombre_cientifico
                                            || 'Especie no identificada';
                                        const fecha = ex.fecha_captura
                                            ? new Date(ex.fecha_captura).toLocaleDateString()
                                            : 'Fecha desconocida';
                                        //  `(${ex.id_ejemplar})`
                                        const label = `${especie} — ${fecha}`;
                                        return (
                                            <option key={ex.id_ejemplar} value={ex.id_ejemplar}>
                                                {label}
                                            </option>
                                        );
                                    })}
                                </select>

                                <select 
                                    value={asociarLaboratorioId} 
                                    onChange={(e) => setAsociarLaboratorioId(e.target.value)} 
                                    required 
                                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900"
                                >
                                    <option value="">-- Selecciona laboratorio</option>
                                    {laboratorios.map(l => (
                                        <option key={l.id_laboratorio} value={l.id_laboratorio}>{l.nombre}</option>
                                    ))}
                                </select>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <input
                                        type="date" 
                                        value={fechaInicio} 
                                        onChange={(e) => setFechaInicio(e.target.value)} 
                                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900" 
                                    />
                                    <input 
                                        type="date" 
                                        value={fechaFin} 
                                        onChange={(e) => setFechaFin(e.target.value)} 
                                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900" 
                                    />
                                </div>

                                <textarea 
                                    value={conclusiones} 
                                    onChange={(e) => setConclusiones(e.target.value)}
                                    placeholder="Conclusiones (opcional)"
                                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900"
                                />

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-cyan-500 px-4 py-2 rounded-xl text-white font-bold"
                                    >
                                        {loading ? 'Guardando...' : 'Asociar ejemplar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                </motion.div>
        </div>
    );
};

export default GestionLaboratorios;