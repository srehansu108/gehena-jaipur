import React, { useEffect, useState, useCallback } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';
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
import { heroApi } from '../../api/heroApi';

const EMPTY = {
  title: '',
  subtitle: '',
  description: '',
  cta: '',
  link: '',
  bgColor: 'from-pink-50/90 to-rose-50/90',
  accentColor: 'pink',
  isActive: true,
  startDate: '',
  endDate: '',
  image: null,
  imagePreview: '',
};

const HeroSlidesManager = ({ onBack }) => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSlides(await heroApi.getAll());
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load slides');
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

  const openEdit = (slide) => {
    setEditingId(slide._id);
    setForm({
      ...EMPTY,
      ...slide,
      startDate: slide.startDate?.slice(0, 10) || '',
      endDate: slide.endDate?.slice(0, 10) || '',
      image: null,
      imagePreview: slide.image?.url || '',
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
    if (!form.title.trim()) return 'Title is required';
    if (!form.subtitle.trim()) return 'Subtitle is required';
    if (!form.cta.trim()) return 'CTA text is required';
    if (!form.link.trim()) return 'Link is required';
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
    ['title', 'subtitle', 'description', 'cta', 'link', 'bgColor', 'accentColor'].forEach((k) =>
      fd.append(k, form[k] ?? '')
    );
    fd.append('isActive', String(form.isActive));
    if (form.startDate) fd.append('startDate', form.startDate);
    if (form.endDate) fd.append('endDate', form.endDate);
    if (form.image) fd.append('image', form.image);

    try {
      if (editingId) {
        const updated = await heroApi.update(editingId, fd);
        setSlides((prev) => prev.map((s) => (s._id === editingId ? updated : s)));
      } else {
        const created = await heroApi.create(fd);
        setSlides((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this slide? This cannot be undone.')) return;
    await heroApi.remove(id);
    setSlides((prev) => prev.filter((s) => s._id !== id));
  };

  const handleToggle = async (id) => {
    const updated = await heroApi.toggle(id);
    setSlides((prev) => prev.map((s) => (s._id === id ? updated : s)));
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(slides);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    const reordered = items.map((s, i) => ({ ...s, order: i }));
    setSlides(reordered);
    await heroApi.reorder(reordered.map(({ _id, order }) => ({ id: _id, order })));
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
            <h2 className="text-2xl font-bold text-slate-800">Hero Slides</h2>
            <p className="text-sm text-slate-500">
              Manage the homepage hero carousel — drag to reorder, toggle visibility
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
        >
          <Plus className="w-4 h-4" /> New Slide
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border-2 border-dashed rounded-xl">
          No slides yet. Click <strong>New Slide</strong> to add one.
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="slides">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {slides.map((slide, index) => (
                  <Draggable key={slide._id} draggableId={slide._id} index={index}>
                    {(p) => (
                      <div
                        ref={p.innerRef}
                        {...p.draggableProps}
                        className="flex items-center gap-4 bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                      >
                        <div {...p.dragHandleProps} className="cursor-grab text-slate-400">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <img
                          src={slide.image?.url}
                          alt={slide.title}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{slide.title}</p>
                          <p className="text-sm text-slate-500 truncate">{slide.subtitle}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            → {slide.link} · {slide.impressions || 0} views · {slide.clicks || 0} clicks
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            slide.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {slide.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleToggle(slide._id)}
                          title={slide.isActive ? 'Deactivate' : 'Activate'}
                          className="p-2 rounded-lg hover:bg-slate-100"
                        >
                          {slide.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEdit(slide)}
                          className="p-2 rounded-lg hover:bg-slate-100"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(slide._id)}
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
        <SlideModal
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
};

function SlideModal({ form, onChange, onSubmit, onClose, editing, saving, error }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editing ? 'Edit' : 'New'} Hero Slide</h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title *" name="title" value={form.title} onChange={onChange} />
          <Field label="Subtitle *" name="subtitle" value={form.subtitle} onChange={onChange} />
          <Field
            label="Description"
            name="description"
            value={form.description}
            onChange={onChange}
            className="md:col-span-2"
          />
          <Field label="CTA Text *" name="cta" value={form.cta} onChange={onChange} />
          <Field
            label="Link *"
            name="link"
            value={form.link}
            onChange={onChange}
            placeholder="/category/rings"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Accent Color</label>
            <select
              name="accentColor"
              value={form.accentColor}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              {['pink', 'rose', 'blush', 'gold', 'emerald', 'indigo'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Background Gradient Classes"
            name="bgColor"
            value={form.bgColor}
            onChange={onChange}
          />
          <Field
            label="Start Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onChange}
          />
          <Field
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={onChange}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Image {!editing && '*'}
            </label>
            <div className="flex items-center gap-4">
              {form.imagePreview && (
                <img
                  src={form.imagePreview}
                  alt="preview"
                  className="w-32 h-20 object-cover rounded-lg border"
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

          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={onChange}
              id="isActive"
            />
            <label htmlFor="isActive" className="text-sm text-slate-700">
              Active (visible on site)
            </label>
          </div>
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
            {editing ? 'Save Changes' : 'Create Slide'}
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

export default HeroSlidesManager;