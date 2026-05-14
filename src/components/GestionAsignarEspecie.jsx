// src/components/GestionAsignarEspecie.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { HiOutlineX, HiOutlinePencil } from 'react-icons/hi';

const GestionAsignarEspecie = ({ onClose, userRole }) => {
  const [ejemplares, setEjemplares] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null); // { id_ejemplar, current_especie_id }

  // fetch ejemplares + join especies
  const fetchEjemplares = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ejemplares')
      .select(`
        id_ejemplar,
        fecha_captura,
        tamano,
        id_especie,
        especies ( id_especie, nombre_comun, nombre_cientifico )
      `)
      .order('fecha_captura', { ascending: false });

    if (error) {
      console.error('Error cargando ejemplares', error);
      setEjemplares([]);
    } else {
      setEjemplares(data || []);
    }
    setLoading(false);
  };

  const fetchEspecies = async () => {
    const { data, error } = await supabase
      .from('especies')
      .select('id_especie, nombre_comun, nombre_cientifico')
      .order('nombre_comun', { ascending: true });

    if (error) {
      console.error('Error cargando especies', error);
      setEspecies([]);
    } else {
      setEspecies(data || []);
    }
  };

  useEffect(() => {
    fetchEjemplares();
    fetchEspecies();
  }, []);

  const openEditModal = (ej) => {
    setError('');
    setEditItem({
      id_ejemplar: ej.id_ejemplar,
      current_especie_id: ej.id_especie || '',
      label: `${ej.especies?.nombre_comun || 'Especie no identificada'} — ${ej.fecha_captura ? new Date(ej.fecha_captura).toLocaleDateString() : 'Fecha desconocida'}`
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    setSavingId(editItem.id_ejemplar);
    setError('');

    console.log('[DEBUG] editItem antes de guardar:', editItem);

    try{
      const especieValue = editItem.current_especie_id === '' || editItem.current_especie_id == null
        ? null
        : editItem.current_especie_id;

      console.log('[DEBUG] payload ->', { id_especie: especieValue, id_ejemplar: editItem.id_ejemplar });

      const { data, error } = await supabase
        .from('ejemplares')
        .update({ id_especie: especieValue })
        .eq('id_ejemplar', editItem.id_ejemplar)
        .select();
      
      console.log('[DEBUG] supabase response:', { data, error });

      if (error) {
        throw error;
      }

      await fetchEjemplares();
      setEditItem(null);
    } catch (err) {
      console.error('Error actualizando especie', err);
      setError(err.message || 'No se pudo actualizar la especie. Revisa la consola/network y las policies.');
    } finally {
      setSavingId(null);
    }
  };

  const filtered = ejemplares.filter(ex => {
    const especieText = ex.especies?.nombre_comun || ex.especies?.nombre_cientifico || '';
    const fechaText = ex.fecha_captura ? new Date(ex.fecha_captura).toLocaleDateString() : '';
    const combined = `${especieText} ${fechaText} ${ex.id_ejemplar}`.toLowerCase();
    return combined.includes(filter.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 z-40" onClick={onClose}></div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl p-6 z-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">🔁 Asignar/Editar Especie a Ejemplares</h3>
          <div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-2 rounded-full">
              <HiOutlineX size={20} />
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-3 items-center">
          <input placeholder="Buscar por especie, fecha o id..." value={filter} onChange={(e) => setFilter(e.target.value)} className="flex-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-900" />
          <button onClick={() => { setFilter(''); fetchEjemplares(); }} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-900">Limpiar</button>
        </div>

        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}

        <div className="max-h-72 overflow-y-auto space-y-3 mb-6">
          {loading ? (
            <div className="text-slate-500 italic">Cargando ejemplares...</div>
          ) : filtered.length === 0 ? (
            <div className="text-slate-500 italic">No hay ejemplares que coincidan.</div>
          ) : (
            filtered.map(ex => (
              <div key={ex.id_ejemplar} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex justify-between items-center border dark:border-slate-700">
                <div>
                  <div className="font-semibold">
                    {ex.especies?.nombre_comun || ex.especies?.nombre_cientifico || 'Especie no identificada'}
                  </div>
                  <div className="text-sm text-slate-500">
                    {ex.fecha_captura ? new Date(ex.fecha_captura).toLocaleDateString() : 'Fecha desconocida'}
                    <span className="ml-3 text-xs text-slate-400">ID: {ex.id_ejemplar}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(userRole === 'investigador' || userRole === 'admin') ? (
                    <button className="px-3 py-2 bg-cyan-500 text-white rounded-xl flex items-center gap-2" onClick={() => openEditModal(ex)}>
                      <HiOutlinePencil /> Editar
                    </button>
                  ) : (
                    <div className="text-sm text-slate-400">Sin permiso</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal interno de edición */}
        <AnimateEditModal
          editItem={editItem}
          especies={especies}
          onClose={() => setEditItem(null)}
          onChange={(changes) => setEditItem(prev => ({ ...prev, ...changes }))}
          onSave={handleSave}
          savingId={savingId}
        />
      </motion.div>
    </div>
  );
};

export default GestionAsignarEspecie;

/* Componente interno para el modal de edición */
const AnimateEditModal = ({ editItem, especies, onClose, onChange, onSave, savingId }) => {
  if (!editItem) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="mt-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-700"
    >
      <form onSubmit={onSave} className="space-y-3">
        <div className="text-sm text-slate-500">Ejemplar: <span className="font-semibold">{editItem.label}</span></div>

        <label className="text-sm block">Selecciona especie</label>
        <select
          value={editItem.current_especie_id ?? ''}
          onChange={(e) => onChange({ current_especie_id: e.target.value === '' ? null : e.target.value })}
          className="w-full p-3 rounded-xl bg-white dark:bg-slate-800"
        >
          <option value="">-- Sin especie (dejar vacío) --</option>
          {especies.map(sp => (
            <option key={sp.id_especie} value={sp.id_especie}>
              {sp.nombre_comun || sp.nombre_cientifico || sp.id_especie}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700">Cancelar</button>
          <button type="submit" disabled={savingId !== null} className="px-4 py-2 rounded-xl bg-cyan-500 text-white">
            {savingId ? 'Guardando...' : 'Guardar cambio'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};