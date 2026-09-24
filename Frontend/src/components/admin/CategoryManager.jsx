import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  X,
  Upload,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { categoryApi } from '../../api/categoryApi';

const EMPTY = {
  name: '',
  slug: '',
  count: '',
  color: 'from-pink-500',
  hoverColor: 'hover:from-pink-600',
  isActive: true,
  showInGrid: true,
  image: null,
  imagePreview: '',
};

const COLOR_OPTIONS = [
  { label: 'Pink',    value: 'from-pink-500' },
  { label: 'Rose',    value: 'from-rose-500' },
  { label: 'Blush',   value: 'from-pink-400' },
  { label: 'Amber',   value: 'from-amber-500' },
  { label: 'Emerald', value: 'from-emerald-500' },
  { label: 'Indigo',  value: 'from-indigo-500' },
];

export default function CategoryManager({ onBack }) {
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
      const data = await categoryApi.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat._id);
    setForm({
      ...EMPTY,
      ...cat,
      image: null,
      imagePreview: cat.image?.url || '',
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
      setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!editingId && !form.image) return 'Image is required';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setSaving(true);
    setError('');

    const fd = new FormData();
    ['name', 'slug', 'count', 'color', 'hoverColor'].forEach((k) =>
      fd.append(k, form[k] ?? '')
    );
    fd.append('isActive', String(form.isActive));
    fd.append('showInGrid', String(form.showInGrid));
    if (form.image) fd.append('image', form.image);

    try {
      if (editingId) {
        const updated = await categoryApi.update(editingId, fd);
        setItems((prev) => prev.map((c) => (c._id === editingId ? updated : c)));
      } else {
        const created = await categoryApi.create(fd);
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
    if (!confirm('Delete this category? This cannot be undone.')) return;
    try {
      await categoryApi.remove(id);
      setItems((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      const updated = await categoryApi.toggle(id);
      setItems((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch (e) {
      alert(e?.response?.data?.message || 'Toggle failed');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const arr = Array.from(items);
    const [moved] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, moved);
    const reordered = arr.map((c, i) => ({ ...c, order: i }));
    setItems(reordered);
    try {
      await categoryApi.reorder(reordered.map(({ _id, order }) => ({ id: _id, order })));
    } catch (e) {
      console.error('Reorder failed:', e);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-pink-50 text-slate-600"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Categories</h2>
            <p className="text-sm text-slate-500">
              Manage homepage category grid — drag to reorder
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
        >
          <Plus className="w-4 h-4" /> New Category
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
          No categories yet. Click <strong>New Category</strong> to add one.
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {items.map((cat, index) => (
                  <Draggable key={cat._id} draggableId={cat._id} index={index}>
                    {(p) => (
                      <div
                        ref={p.innerRef}
                        {...p.draggableProps}
                        className="flex items-center gap-4 bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                      >
                        <div
                          {...p.dragHandleProps}
                          className="cursor-grab text-slate-400"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <img
                          src={cat.image?.url}
                          alt={cat.name}
                          className="w-20 h-14 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{cat.name}</p>
                          <p className="text-sm text-slate-500 truncate">
                            /{cat.slug} · {cat.count || 'no count'}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            cat.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleToggle(cat._id)}
                          title={cat.isActive ? 'Deactivate' : 'Activate'}
                          className="p-2 rounded-lg hover:bg-slate-100"
                        >
                          {cat.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-2 rounded-lg hover:bg-slate-100"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="p-2 rounded-lg hover:bg-red-50"
                        >
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
        <CategoryModal
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

function CategoryModal({ form, onChange, onSubmit, onClose, editing, saving, error }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editing ? 'Edit' : 'New'} Category</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name *" name="name" value={form.name} onChange={onChange} />
          <Field
            label="Slug (auto if empty)"
            name="slug"
            value={form.slug}
            onChange={onChange}
            placeholder="rings"
          />
          <Field
            label="Count Label"
            name="count"
            value={form.count}
            onChange={onChange}
            placeholder="500+ Designs"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Accent Color
            </label>
            <select
              name="color"
              value={form.color}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              {COLOR_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Image {!editing && '*'}
            </label>
            <div className="flex items-center gap-4">
              {form.imagePreview && (
                <img
                  src={form.imagePreview}
                  alt="preview"
                  className="w-28 h-20 object-cover rounded-lg border"
                />
              )}
              <label className="inline-flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg px-4 py-3 hover:bg-slate-50">
                <Upload className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Upload image</span>
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

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={onChange}
            />
            Active (visible on site)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="showInGrid"
              checked={form.showInGrid}
              onChange={onChange}
            />
            Show in homepage grid
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-500 text-white font-medium hover:shadow-lg disabled:opacity-60 inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editing ? 'Save Changes' : 'Create Category'}
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
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
      />
    </div>
  );
}