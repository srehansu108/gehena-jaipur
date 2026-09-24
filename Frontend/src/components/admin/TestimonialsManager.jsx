import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, X, Upload, Loader2, ArrowLeft, Star,
} from 'lucide-react';
import { testimonialApi } from '../../api/testimonialApi';

const EMPTY = {
  name: '', location: '', rating: 5, text: '', piece: '', date: '',
  isActive: true, image: null, imagePreview: '',
};

export default function TestimonialsManager({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await testimonialApi.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditingId(t._id);
    setForm({
      ...EMPTY,
      ...t,
      image: null,
      imagePreview: t.image?.url || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file' && files[0]) {
      setForm((f) => ({
        ...f,
        image: files[0],
        imagePreview: URL.createObjectURL(files[0]),
      }));
    } else {
      setForm((f) => ({
        ...f,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.text.trim()) return 'Testimonial text is required';
    if (!form.rating || form.rating < 1) return 'Rating must be 1-5';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setSaving(true);
    setError('');

    const fd = new FormData();
    ['name', 'location', 'text', 'piece', 'date'].forEach((k) =>
      fd.append(k, form[k] ?? '')
    );
    fd.append('rating', String(form.rating));
    fd.append('isActive', String(form.isActive));
    if (form.image) fd.append('image', form.image);

    try {
      if (editingId) {
        const updated = await testimonialApi.update(editingId, fd);
        setItems((prev) => prev.map((t) => (t._id === editingId ? updated : t)));
      } else {
        const created = await testimonialApi.create(fd);
        setItems((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    await testimonialApi.remove(id);
    setItems((prev) => prev.filter((t) => t._id !== id));
  };

  const handleToggle = async (id) => {
    const updated = await testimonialApi.toggle(id);
    setItems((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const arr = Array.from(items);
    const [moved] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, moved);
    const reordered = arr.map((t, i) => ({ ...t, order: i }));
    setItems(reordered);
    await testimonialApi.reorder(reordered.map(({ _id, order }) => ({ id: _id, order })));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-pink-50 text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Testimonials</h2>
            <p className="text-sm text-slate-500">Manage customer reviews shown on the homepage</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
        >
          <Plus className="w-4 h-4" /> New Testimonial
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border-2 border-dashed rounded-xl">
          No testimonials yet. Click <strong>New Testimonial</strong> to add one.
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="testimonials">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {items.map((t, index) => (
                  <Draggable key={t._id} draggableId={t._id} index={index}>
                    {(p) => (
                      <div
                        ref={p.innerRef}
                        {...p.draggableProps}
                        className="flex items-center gap-4 bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                      >
                        <div {...p.dragHandleProps} className="cursor-grab text-slate-400">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        {t.image?.url ? (
                          <img
                            src={t.image.url}
                            alt={t.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-semibold">
                            {t.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{t.name}</p>
                          <p className="text-sm text-slate-500 truncate">
                            {t.location || 'No location'} · {t.piece || 'No piece'}
                          </p>
                          <div className="flex gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < t.rating ? 'fill-yellow-400 text-yellow-500' : 'text-slate-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            t.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button onClick={() => handleToggle(t._id)} className="p-2 rounded-lg hover:bg-slate-100">
                          {t.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-slate-100">
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>
                        <button onClick={() => handleDelete(t._id)} className="p-2 rounded-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {modalOpen && (
        <TestimonialModal
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
          editing={!!editingId}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}

function TestimonialModal({ form, onChange, onSubmit, onClose, editing, saving, error }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editing ? 'Edit' : 'New'} Testimonial</h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name *" name="name" value={form.name} onChange={onChange} />
          <Field label="Location" name="location" value={form.location} onChange={onChange} placeholder="Mumbai, India" />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rating *</label>
            <select
              name="rating"
              value={form.rating}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} ★</option>
              ))}
            </select>
          </div>

          <Field label="Piece" name="piece" value={form.piece} onChange={onChange} placeholder="Diamond Necklace" />

          <Field
            label="Date (free text)"
            name="date"
            value={form.date}
            onChange={onChange}
            placeholder="December 2024"
            className="md:col-span-2"
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Testimonial Text *</label>
            <textarea
              name="text"
              value={form.text}
              onChange={onChange}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
              placeholder="What the customer said..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Avatar (optional)</label>
            <div className="flex items-center gap-4">
              {form.imagePreview && (
                <img
                  src={form.imagePreview}
                  alt="preview"
                  className="w-16 h-16 rounded-full object-cover border"
                />
              )}
              <label className="inline-flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg px-4 py-3 hover:bg-slate-50">
                <Upload className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Upload avatar</span>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={onChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={onChange}
            />
            Active (visible on site)
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-500 text-white font-medium hover:shadow-lg disabled:opacity-60 inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editing ? 'Save Changes' : 'Create Testimonial'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', placeholder, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
      />
    </div>
  );
}