import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient'

import modeloER from '../assets/mapa_simples.svg';
import mapaCompleto from '../assets/mapa_completo.svg';

import { useState, useEffect, useRef } from 'react';

import GestionAsignarEspecie from '../components/GestionAsignarEspecie';
import GestionLaboratorios from '../components/GestionLaboratorios';
import MenuGestion from '../components/MenuGestion';
import GestionEspecies from '../components/GestionEspecies';
import RegistroMariposas from '../components/RegistroMariposas';

const Parte1 = () => {
    /* aba gestionar especie */
    const [mostrarAsignarEspecie, setMostrarAsignarEspecie] = useState(false);
    /* button para especies */
    const [mostrarEspecies, setMostrarEspecies] = useState(false);
    /* button gestionar laboratorios */
    const [mostrarGestionLaboratorios, setMostrarGestionLaboratorios] = useState(false);

    const [modalConfig, setModalConfig] = useState({ aberto: false, imagem: null });
    /* criar accordion para enunciado original */
    const [enunciadoAberto, setEnunciadoAberto] = useState(false);

    /* adicionar opção de zoom no scroll e no click*/
    const [zoom, setZoom] = useState(1);
    const [posicao, setPosicao] = useState({ x: 0, y: 0 });
    const [arrastando, setArrastando] = useState(false);
    const [origem, setOrigem] = useState({ x: 0, y: 0 });
    const [moveu, setMoveu] = useState(false);

    /* importar página de registro */
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    /* FIM - importar página de registro */

    const handleZoomClick = (e) => {
        e.stopPropagation();
        if (moveu) return;
        setZoom(prev => prev === 1 ? 2.5 : 1);
        setPosicao({ x: 0, y: 0 });
    };

    const handleMouseDown = (e) => {
        setMoveu(false);
        if (zoom <= 1 ) return;
        setArrastando(true);
        setOrigem({ x: e.clientX - posicao.x, y: e.clientY - posicao.y });
    };
    
    const handleMouseMove = (e) => {
        setMoveu(true);
        if (!arrastando) return;
        setPosicao({ x: e.clientX - origem.x, y: e.clientY - origem.y });
    };

    const handleMouseUp = () => setArrastando(false);

    /* funcao para poder resetar o zoom ao fechar */
    const containerRef = useRef(null);
    const fecharModal = () => {
        setModalConfig({ aberto: false, imagem: null });
        setZoom(1);
        setPosicao({ x: 0, y: 0 });
    };

    /* travar scroll */
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onWheel = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setZoom(prev => Math.min(Math.max(prev - e.deltaY * 0.001, 1), 4));
        };

        if (modalConfig.aberto) {
            el.addEventListener('wheel', onWheel, { passive: false });

            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            el.removeEventListener('wheel', onWheel);

            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [modalConfig.aberto]);


    /* creacion de datos interativos */
    const [exemplares, setExemplares] = useState([]);
    const [userRole, setUserRole] = useState('usuario');
    const [loading, setLoading] = useState(true);

    /* puxar datos de BBDD */
    const fetchDados = async () => {
        setLoading(true);

        const { data: dataEx, error: errorEx } = await supabase
        .from('ejemplares')
        .select(`
            id_ejemplar,
            fecha_captura,
            tamano,
            especies (
                nombre_comun,
                nombre_cientifico
            ),
            localizaciones (
                description,
                provincia,
                pais
            ),
            coleccionables (
                id_ejemplar
            ),
            investigaciones (
                id_investigacion
            )            
        `)
        .order('fecha_captura', { ascending: false });

        if (errorEx) {
            console.error('Error cargando ejemplares: ', errorEx);
            setExemplares([]);
        } else {
            console.log('Ejemplares cargados:', dataEx);
            setExemplares(dataEx || []);
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: perfil } = await supabase
                .from('perfis')
                .select('role')
                .eq('id', user.id)
                .single();
            if (perfil) setUserRole(perfil.role);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchDados();
    }, []);

    return (
        <>
            <div className='pt-24 pb-12 px-6 max-w-6xl mx-auto'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='text-center mb-16'
                >
                    <h1 className='text-4xl md:text-5xl font-bold mb-4'>
                        Parte 1: <span className='text-cyan-500'>Diseño Entidad-Relación</span>
                    </h1>
                    <p className='text-slate-500 dark:text-slate-400 max-w-2xl mx-auto'>
                        Estudio de la biodiversidad de mariposas en la Comunidad de Madrid.
                        Transformación de requisitos de negocio en un modelo conceptual robusto.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Izquierda - enunciado */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className='bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700'
                    >
                        <h3 className='text-xl font-semibold mb-4 text-cyan-500'>El Desafío</h3>
                        <p className='text-slate-600 dark:text-slate-300 leading-relaxed mb-6'>
                            Se requiere diseñar una base de datos para investigadores que estudian mariposas.
                            <br></br>Es necesario registrar cada **ejemplar**, su **especie**, la **zona** de captura y la **colección** a la que pertenece.
                        </p>
                        <div className='space-y-4'>
                            <div className='p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl'>
                                <span className="font-bold text-cyan-500">Entidades Clave:</span>
                                <p className='text-sm mt-1'>Especie, Zona, Colección, Ejemplar.</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                <span className='font-bold text-cyan-500'>Relación Crítica:</span>
                                <p className='text-sm mt-1'>Un ejemplar pertenece a una especie y fue capturado en una zona específica.</p>
                            </div>
                        </div>

                        {/* Accordion enunciado */}
                        <div className='mt-6'>
                            <button
                                onClick={() => setEnunciadoAberto(prev => !prev)}
                                className='flex items-center gap-2 text-sm font-semibold text-cyan-500 hover:text-cyan-400 transition-colors'
                            >
                                {enunciadoAberto ? '▲ Ocultar Enunciado' : '▼ Ver Enunciado'}
                            </button>

                            <AnimatePresence>
                                {enunciadoAberto && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className='overflow-hidden'
                                    >
                                        <div className='mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-3'>
                                            <p>Un grupo de biólogos está realizando un estudio sobre las mariposas que pueblan su país de origen. Algunos de los ejemplares sometidos al estudio se incluirán en colecciones mientras que otros solamente serán observados.</p>
                                            <p>◼ Cada ejemplar de mariposa pertenecerá a una especie. Un ejemplar sólo podrá pertenecer a una única especie, mientras que a una misma especie podrán pertenecer varios ejemplares.</p>
                                            <p>◼ Cada especie pertenecerá a un género. Una especie sólo podrá pertenecer a un único género, mientras que a un mismo género podrán pertenecer varias especies.</p>
                                            <p>◼ Cada género pertenecerá a una familia. Un género sólo podrá pertenecer a una única familia, mientras que a una misma familia podrán pertenecer varios géneros.</p>
                                            <p>◼ Las mariposas serán capturadas por personas de las que se conoce: dni, nombre, apellidos, domicilio, provincia, móvil y correo electrónico.</p>
                                            <p>◼ Una persona solo podrá ser propietaria de una colección de mariposas. Las colecciones no se pueden transferir a otras personas.</p>
                                            <p>◼ Un ejemplar de mariposa sólo podrá pertenecer a una colección, pero una colección podrá estar formada por varios ejemplares.</p>
                                            <p>◼ Los ejemplares destinados a la investigación se estudian en laboratorios, pudiendo un mismo ejemplar ser estudiado en varios laboratorios a lo largo del tiempo.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Imagem derecha */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className='relative group'
                    >
                        <div className='absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000'>
                        </div>
                        <div className='relative bg-white dark:bg-slate-800 p-4 rounded-3xl'>
                            <img
                                src={modeloER}
                                alt='Modelo Entidad Relación'
                                className='rounded-2xl w-full h-auto shadow-sm'
                                onClick={() => setModalConfig({ aberto: true, imagem: modeloER })}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Seccion diccionario de datos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className='mt-20'
                >
                    <h2 className='text-3xl font-bold mb-8 text-center'>Diccionario Conceptual</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

                        {/* Entidad: especie */}
                        <div className='p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow'>
                            <h4 className='text-cyan-500 font-bold text-lg mb-2'>Especie</h4>
                            <p className='text-sm text-slate-600 dark:text-slate-400'>
                                Almacena el nombre científico y común. Es una entidad maestra ya que varios ejemplares pertenecen a la misma especie.
                            </p>
                        </div>

                        {/* Entidad: zona */}
                        <div className='p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow'>
                            <h4 className='text-cyan-500 font-bold text-lg mb-2'>Zona</h4>
                            <p className='text-sm text-slate-600 dark:text-slate-400'>
                                Define el lugar geográfico (parques, reservas). Crucial para el análisis de distribución biológica.
                            </p>
                        </div>

                        {/* Entidad: ejemplar */}
                        <div className='p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow'>
                            <h4 className='text-cyan-500 font-bold text-lg mb-2'>Ejemplar</h4>
                            <p className='text-sm text-slate-600 dark:text-slate-400'>
                                Representa cada individuo capturado. Contabiliza fecha, hora y coordenadas exactas de la muestra.
                            </p>
                        </div>

                        {/* Entidad: coleccion */}
                        <div className='p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow'>
                            <h4 className='text-cyan-500 font-bold text-lg mb-2'>Colección</h4>
                            <p className='text-sm text-slate-600 dark:text-slate-400'>
                                Organiza los ejemplares para su conservación. Cada colección tiene un responsable y una institución asociada.
                            </p>
                        </div>
                        
                    </div>
                </motion.div>

                {/* separador para a segunda etapa do trabalho */}
                <div className='relative py-20 flex flex-col items-center'>
                    <div className='absolute inset-0 flex items-center' aria-hidden="true">
                        <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>

                    <div className="relative bg-slate-50 dark:bg-slate-900 px-6">
                        <span className="text-sm font-bold tracking-widest uppercase text-slate-400">
                            "Si haces solo lo mínimo, serás mediocre para siempre"
                        </span>
                    </div>

                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-8 text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent italic"
                    >
                        Haciendo más que lo necesario.
                    </motion.h2>
                </div>

                <div className='grid grid-cols-1 gap-8 mb-20'>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className='bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700'
                    >
                        <div className='flex flex-col md:flex-row justify-between items-center mb-8 gap-4'>
                            <div>
                                <h3 className='text-2xl font-bold text-slate-800 dark:text-white'>
                                    Mapa Relacional Completo
                                </h3>
                                <p className="text-slate-500 text-sm">
                                    Versión extendida con todas las entidades y atributos adicionales.
                                </p>
                            </div>
                            <button
                                onClick={() => setModalConfig({ aberto: true, imagem: mapaCompleto })}
                                className='px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full font-bold transition-all flex items-center gap-2'
                            >
                                🔍 Expandir Mapa
                            </button>
                        </div>

                        <div 
                            className='relative rounded-2xl bg-slate-900 border-4 border-slate-900 overflow-hidden group cursor-pointer'
                            onClick={() => setModalConfig({ aberto: true, imagem: mapaCompleto })}
                        >
                            <img 
                                src={mapaCompleto}
                                alt="Modelo ER Completo"
                                className='w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity'
                            />

                            <div className='absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                                <span className='text-white font-bold bg-cyan-500 px-4 py-2 rounded-full shadow-lg'>
                                    Clic para analizar detalles
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className='mt-20'
                    >
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h2 className="text-3xl font-bold italic">
                                    Exploración de Campo
                                </h2>
                                <p className="text-slate-500 mt-2">
                                    Registros reales sincronizados con la base de datos.
                                </p>
                            </div>

                            {/* 
                                botton solo para investigadores/admins 
                                contenedor de botones con flex-row
                            */}
                            {(userRole === 'investigador' || userRole === 'admin') && (
                                <div className="flex items-center gap-2">
                                    <button
                                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
                                        onClick={() => setMostrarFormulario(true)}
                                    >
                                        <span>+</span> Registrar Nuevo Ejemplar
                                    </button>

                                    {/* Menú en cascada */}
                                    <MenuGestion 
                                        onManageEspecies={() => setMostrarEspecies(true)}
                                        onManageLaboratorios={() => setMostrarGestionLaboratorios(true)}
                                        onManageAsignarEspecie={() => setMostrarAsignarEspecie(true)}
                                    />

                                </div>
                            )}
                            
                        </div>

                        {loading ? (
                            <div className='bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700'>
                                <p className="text-slate-400 italic">
                                    Cargando registros...
                                </p>
                            </div>
                        ) : exemplares.length === 0 ? (
                            <div className='bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700'>
                                <p className="text-slate-400 italic">
                                    No hay registros aún. Sé el primero en contribuir.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {exemplares.map((ex) => {

                                    const tieneInvestigacion = Array.isArray(ex.investigaciones)
                                        ? ex.investigaciones.length > 0
                                        : !!ex.investigaciones?.id_investigacion;
                                    
                                    const tieneColeccion = Array.isArray(ex.coleccionables)
                                        ? ex.coleccionables.length > 0
                                        : !!ex.coleccionables?.id_ejemplar;

                                    const tipo = tieneInvestigacion
                                        ? 'Investigación'
                                        : tieneColeccion
                                            ? 'Colección'
                                            : 'Observación';
                                    return (

                                    <motion.div
                                        key={ex.id_ejemplar}
                                        whileHover={{ y: -5 }}
                                        className='bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm'
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-500 text-xs font-bold rounded-full uppercase">
                                                {tipo}
                                            </span>
                                            <span className="text-slate-400 text-xs">
                                                {new Date(ex.fecha_captura).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h4 className='text-xl font-bold mb-1'>
                                            {ex.especies?.nombre_comun || 'Especie no identificada'}
                                        </h4>

                                        <p className='text-sm italic text-slate-500 mb-4'>
                                            {ex.especies?.nombre_cientifico || 'Species ignota'}
                                        </p>

                                        <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
                                            <span>📍</span> {ex.localizaciones?.description || 'Ubicación no especificada'}, {ex.localizaciones?.provincia || 'Sin provincia'}
                                        </div>
                                    </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div> {/* div principal */}

            <AnimatePresence>
                {modalConfig.aberto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
                        onClick={fecharModal}
                    >
                        {/* close button */}
                        <button
                            className='absolute top-5 right-5 text-white bg-white/20 hover:bg-white/40 rounded-full w-10 h-10 flex items-center justify-center text-xl transition-all'
                            onClick={fecharModal}
                        >
                            ✕
                        </button>

                        {/* indicador zoom */}
                        <div className='absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm'>
                            {zoom === 1 ? '🔍 Clica para zoom · Scroll para ajustar' : `🔍 ${Math.round(zoom * 100)}% · Clica para resetar`}
                        </div>

                        {/* imagem grande */}
                        <div 
                            className='relative overflow-hidden rounded-2xl shadow-2xl'
                            style={{ 
                                width: '90vw',
                                maxWidth: '1200px',
                                height: '85vh',
                                cursor: zoom > 1 ? (arrastando ? 'grabbing' : 'grab') : 'zoom-in'
                            }}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onClick={(e) => e.stopPropagation()}
                            ref={containerRef}
                        >
                            <motion.img
                                src={modalConfig.imagem}
                                alt="Modelo Entidad Relación"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                onClick={handleZoomClick}
                                onMouseDown={handleMouseDown}
                                draggable={false}
                                style={{
                                    transform: `scale(${zoom}) translate(${posicao.x / zoom}px, ${posicao.y / zoom}px)`,
                                    transformOrigin: 'center center',
                                    transition: arrastando ? 'none' : 'transform 0.3s ease',
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    userSelect: 'none',
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* formulário cadastro mariposas */}
            <AnimatePresence>
                {mostrarFormulario && (
                    <RegistroMariposas
                        onClose={() => setMostrarFormulario(false)}
                        onSuccess={() => {
                            setMostrarFormulario(false);
                            fetchDados();
                        }}
                    />
                )}
                {mostrarEspecies && <GestionEspecies onClose={() => setMostrarEspecies(false)} />}
            </AnimatePresence>
            {/* FIM - formulário cadastro mariposas */}

            {/* gestion laboratorios */}
            <AnimatePresence>
                {mostrarGestionLaboratorios && (
                    <GestionLaboratorios
                        onClose={() => setMostrarGestionLaboratorios(false)}
                        userRole={userRole}
                    />
                )}
            </AnimatePresence>

            {/* gestion especies */}
            <AnimatePresence>
                {mostrarAsignarEspecie && (
                    <GestionAsignarEspecie 
                        onClose={() => setMostrarAsignarEspecie(false)} 
                        userRole={userRole} 
                    />
                )}
            </AnimatePresence>
           
            
        </>
    );
};

export default Parte1;