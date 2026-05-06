import { motion } from "framer-motion";
import lyrinhaImg from "../assets/lyrinha-home.png";

const Home = () => {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden">
            
            {/* background 'tech' */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -z-10" />
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                
                {/* izquierda - texts */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                        Proyecto personal <br />
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                            QueryLab
                        </span>
                    </h1>
                    <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-lg">
                        Un proyecto universitario centrado en el análisis de datos, el modelado relacional y el fascinante mundo de las mariposas. ¡Explora nuestro entorno interactivo de SQL!
                    </p>

                    <div className="mt-10 flex gap-4">
                        <button className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl font-bold transition-all transform hover:scale-105 shadow-xl shadow-cyan-500/20">
                            Empezar ahora
                        </button>
                    </div>
                </motion.div>

                {/* derecha - mascota */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative flex justify-center"
                >
                    {/* back mascota */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl" />

                    <img
                        src={lyrinhaImg}
                        alt="Lyrinha mascota"
                        className="relative z-10 w-full max-w-[500px] drop-shadow-2xl animate-float"
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default Home;