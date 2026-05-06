import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        /* Validação senhas */
        if (password !== confirmPassword) {
            setMessage('❌ ¡Las contraseñas no coinciden!');
            return;
        }

        /* Validação simples, poderia adicionar mais "if's" em uma aplicação real */
        if (password.length < 6) {
            setMessage('❌ ¡La contraseña debe ser más larga!');
            return;
        }
        
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage('❌ Error: ' + error.message);
        } else {
            setMessage('✅ ¡Registro completado! Revisa tu correo electrónico para confirmar.');
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
                <h2 className='text-3xl font-bold text-center mb-2'>
                    Crear cuenta en{' '}
                    <span className='text-cyan-500'>QueryLab</span>
                </h2>
                <p className='text-center text-slate-500 dark:text-slate-400 text-sm mb-8'>
                    ¡Únete a este sencillo proyecto!
                </p>

                {/* Mensagem de feedback */}

                {message && (
                    <div className='mb-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm text-center'>
                        {message}
                    </div>
                )}

                <form onSubmit={handleRegister} className='space-y-5'>
                    <div>
                        <label className='block text-sm font-medium mb-2'>
                            E-mail
                        </label>
                        <input
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 ring-cyan-500 outline-none transition-all'
                            placeholder='tu@email.com'
                            required
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-2'>Contraseña</label>
                        <input
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 ring-cyan-500 outline-none transition-all'
                            placeholder='Contrasenha'
                            required
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium mb-2'>Confirmar Contraseña</label>
                        <input
                            type='password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className='w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 ring-cyan-500 outline-none transition-all'
                            placeholder='Repita la contraseña'
                            required
                        />
                    </div>

                    <button
                        disabled={loading}
                        className='w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50'
                    >
                        {loading ? 'Creando cuenta...' : 'Crear una cuenta'}
                    </button>
                </form>

                {/* Link para login */}
                <p className='text-center text-sm text-slate-500 dark:text-slate-400 mt-6'>
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className='text-cyan-500 hover:underline font-medium'>Acceso</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;