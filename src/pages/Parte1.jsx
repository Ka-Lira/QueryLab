import { motion, AnimatePresence } from 'framer-motion';
import modeloER from '../assets/mapa_simples.svg';
import { useState, useEffect, useRef } from 'react';

const Parte1 = () => {

    const [modalAberto, setModalAberto] = useState(false);
    /* criar accordion para enunciado original */
    const [enunciadoAberto, setEnunciadoAberto] = useState(false);

    /* adicionar opção de zoom no scroll e no click*/
    const [zoom, setZoom] = useState(1);
    const [posicao, setPosicao] = useState({ x: 0, y: 0 });
    const [arrastando, setArrastando] = useState(false);
    const [origem, setOrigem] = useState({ x: 0, y: 0 });
    const [moveu, setMoveu] = useState(false);

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
        setModalAberto(false);
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

        if (modalAberto) {
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
    }, [modalAberto]);

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
                                onClick={() => setModalAberto(true)}
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
            </div>

            <AnimatePresence>
                {modalAberto && (
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
                                src={modeloER}
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
        </>
    );
};

export default Parte1;