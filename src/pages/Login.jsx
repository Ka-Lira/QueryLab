import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert('Erro ao entrar: ' + error.message);
        } else {
            alert('Bem-Vindo ao QueryLab!')
            navigate('/');
            /* REDIRECIONAMENTOOOOO para home */
        }
        setLoading(false);
    };

    return (
        <div className='min-h-screen flex items-center justify-center px-4'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700'
            >
                <h2 className='text-3xl font-bold text-center mb-8">Entrar no <span className="text-cyan-500'>
                    Entrar no <span className='text-cyan-500'>QueryLab</span>
                </h2>

                <form onSubmit={handleLogin} className='space-y-6'>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            E-mail
                        </label>
                        <input
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 ring-cyan-500 outline-none transition-all'
                            placeholder='su@email.com'
                            required
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-2'>
                            Contraseña
                        </label>
                        <input 
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 ring-cyan-500 outline-none transition-all'
                            placeholder='••••••••'
                            required
                        />
                    </div>

                    <button
                        disabled={loading}
                        className='w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50'
                        >
                            {loading ? 'Cargando...' : 'Acceso'}
                        </button>
                </form>

                <p className='text-center text-sm text-slate-500 dark:text-slate-400 mt-6'>
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" className="text-cyan-500 hover:underline font-medium">
                        Registro
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;