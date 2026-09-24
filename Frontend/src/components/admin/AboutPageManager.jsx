import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft, Save, Loader2, Plus, Trash2, Upload, X, RotateCcw, ChevronDown, ChevronRight,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { aboutPageApi } from '../../api/aboutPageApi';

// Available icons (subset — safe list)
const ICON_NAMES = [
  'Gem', 'Shield', 'Heart', 'Sparkles', 'Crown', 'Award',
  'BadgeCheck', 'Truck', 'Users', 'Star', 'Leaf', 'Globe',
  'Clock', 'MapPin', 'Phone', 'Mail', 'Instagram', 'Facebook',
  'Twitter', 'Youtube', 'Quote', 'Gem',
];

const iconByName = (name) => Icons[name] || Icons.Gem;

// ─────────────────────────────────────────────────────────────
// Reusable collapsible section
// ─────────────────────────────────────────────────────────────
function Section({ title, subtitle, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition"
      >
        <div className="text-left">
          <p className="font-semibold text-slate-800">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

function TextField({ label, value, onChange, placeholder = '', textarea = false, rows = 3 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none text-sm"
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none text-sm"
        />
      )}
    </div>
  );
}

function IconPicker({ value, onChange }) {
  const Icon = iconByName(value);
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <select
        value={value || 'Gem'}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border rounded-lg px-3 py-2 text-sm"
      >
        {ICON_NAMES.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Simple image uploader that returns { url, publicId }
// ─────────────────────────────────────────────────────────────
function ImageUploader({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFile = async (file) => {
    setUploading(true);
    try {
      const { url, publicId } = await aboutPageApi.uploadImage(file);
      onChange({ url, publicId });
    } catch (err) {
      alert('Upload failed: ' + (err?.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const applyUrl = () => {
    if (!urlInput.trim()) return;
    onChange({ url: urlInput.trim(), publicId: null });
    setUrlInput('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="flex items-start gap-4">
        {value?.url && (
          <img
            src={value.url}
            alt="preview"
            className="w-24 h-24 object-cover rounded-lg border"
          />
        )}
        <div className="flex-1 space-y-2">
          <label className="inline-flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg px-4 py-2 hover:bg-slate-50 text-sm">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-slate-500" />
            )}
            <span>{uploading ? 'Uploading...' : 'Upload image'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Or paste image URL"
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={applyUrl}
              className="px-3 py-2 rounded-lg border text-sm hover:bg-slate-50"
            >
              Use
            </button>
          </div>

          {value?.url && (
            <button
              type="button"
              onClick={() => onChange({ url: '', publicId: null })}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Generic item list editor (used for Heritage, Values, Features, Milestones, Team, Certifications)
// ─────────────────────────────────────────────────────────────
function ItemList({ title, items = [], onChange, renderItem, createEmpty }) {
  const add = () => {
    const next = [...items, { ...createEmpty(), order: items.length }];
    onChange(next);
  };
  const remove = (i) => {
    const next = items.filter((_, idx) => idx !== i).map((it, idx) => ({ ...it, order: idx }));
    onChange(next);
  };
  const update = (i, patch) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange(next);
  };
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((it, idx) => ({ ...it, order: idx })));
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">#{i + 1}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1 rounded hover:bg-red-100 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {renderItem(item, (patch) => update(i, patch))}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed rounded-lg text-slate-600 hover:bg-slate-50 hover:text-pink-600 transition text-sm"
      >
        <Plus className="w-4 h-4" /> Add {title}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Manager
// ─────────────────────────────────────────────────────────────
export default function AboutPageManager({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const doc = await aboutPageApi.getAdmin();
      setData(doc);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const patch = (path, value) => {
    setData((prev) => {
      const next = structuredClone(prev);
      const parts = path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const updated = await aboutPageApi.save(data);
      setData(updated);
      setSuccessMsg('✅ Saved successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all About Page content to defaults? This cannot be undone.')) return;
    try {
      const doc = await aboutPageApi.reset();
      setData(doc);
      setSuccessMsg('Reset to defaults');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed');
    }
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 rounded-t-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-pink-50 text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">About Page Editor</h2>
            <p className="text-xs text-slate-500">Edit every section of the About page</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {successMsg && (
            <span className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
              {successMsg}
            </span>
          )}
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-sm hover:bg-slate-50"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Page
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>
      )}

      {/* Sections */}
      <div className="p-4 space-y-4">
        {/* HERO */}
        <Section title="Hero Section" subtitle="Top banner — title, badge, description">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Badge" value={data.hero?.badge} onChange={(v) => patch('hero.badge', v)} />
            <TextField label="Title (first part)" value={data.hero?.title} onChange={(v) => patch('hero.title', v)} />
            <TextField label="Highlight (colored)" value={data.hero?.highlight} onChange={(v) => patch('hero.highlight', v)} />
            <TextField label="Title suffix (after highlight)" value={data.hero?.titleSuffix} onChange={(v) => patch('hero.titleSuffix', v)} />
            <div className="md:col-span-2">
              <TextField
                label="Description"
                textarea
                rows={3}
                value={data.hero?.description}
                onChange={(v) => patch('hero.description', v)}
              />
            </div>
          </div>
        </Section>

        {/* MUSE */}
        <Section title="Muse Section" subtitle="Image, story, and stat">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Badge" value={data.muse?.badge} onChange={(v) => patch('muse.badge', v)} />
            <TextField label="Title (first part)" value={data.muse?.title} onChange={(v) => patch('muse.title', v)} />
            <TextField label="Highlight (colored)" value={data.muse?.highlight} onChange={(v) => patch('muse.highlight', v)} />
            <TextField label="Stat number" value={data.muse?.statNumber} onChange={(v) => patch('muse.statNumber', v)} />
            <TextField label="Stat label" value={data.muse?.statLabel} onChange={(v) => patch('muse.statLabel', v)} />
          </div>

          <ImageUploader
            label="Muse Image"
            value={data.muse?.image}
            onChange={(v) => patch('muse.image', { ...data.muse.image, ...v })}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Paragraphs</p>
            {(data.muse?.paragraphs || []).map((p, i) => (
              <div key={i} className="flex gap-2">
                <textarea
                  rows={3}
                  value={p}
                  onChange={(e) => {
                    const next = [...data.muse.paragraphs];
                    next[i] = e.target.value;
                    patch('muse.paragraphs', next);
                  }}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = data.muse.paragraphs.filter((_, idx) => idx !== i);
                    patch('muse.paragraphs', next);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => patch('muse.paragraphs', [...(data.muse.paragraphs || []), ''])}
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              + Add paragraph
            </button>
          </div>
        </Section>

        {/* HERITAGE */}
        <Section title="Heritage Cards" subtitle="3-column cards on the About page">
          <ItemList
            title="Heritage Card"
            items={data.heritage || []}
            onChange={(v) => patch('heritage', v)}
            createEmpty={() => ({ icon: 'Gem', title: '', description: '', order: 0 })}
            renderItem={(item, update) => (
              <>
                <IconPicker value={item.icon} onChange={(v) => update({ icon: v })} />
                <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <TextField label="Description" textarea rows={2} value={item.description} onChange={(v) => update({ description: v })} />
              </>
            )}
          />
        </Section>

        {/* VALUES */}
        <Section title="Our Values" subtitle="4-column value cards">
          <ItemList
            title="Value"
            items={data.values || []}
            onChange={(v) => patch('values', v)}
            createEmpty={() => ({ icon: 'Gem', title: '', description: '', order: 0 })}
            renderItem={(item, update) => (
              <>
                <IconPicker value={item.icon} onChange={(v) => update({ icon: v })} />
                <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <TextField label="Description" textarea rows={2} value={item.description} onChange={(v) => update({ description: v })} />
              </>
            )}
          />
        </Section>

        {/* MILESTONES */}
        <Section title="Milestones" subtitle="Journey timeline cards">
          <ItemList
            title="Milestone"
            items={data.milestones || []}
            onChange={(v) => patch('milestones', v)}
            createEmpty={() => ({ year: '', title: '', description: '', order: 0 })}
            renderItem={(item, update) => (
              <>
                <TextField label="Year" value={item.year} onChange={(v) => update({ year: v })} />
                <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <TextField label="Description" textarea rows={2} value={item.description} onChange={(v) => update({ description: v })} />
              </>
            )}
          />
        </Section>

        {/* TEAM */}
        <Section title="Team Members" subtitle="Artisans and leadership" defaultOpen={false}>
          <ItemList
            title="Team Member"
            items={data.team || []}
            onChange={(v) => patch('team', v)}
            createEmpty={() => ({ name: '', role: '', description: '', image: { url: '', publicId: null }, order: 0 })}
            renderItem={(item, update) => (
              <>
                <TextField label="Name" value={item.name} onChange={(v) => update({ name: v })} />
                <TextField label="Role" value={item.role} onChange={(v) => update({ role: v })} />
                <TextField label="Description" textarea rows={2} value={item.description} onChange={(v) => update({ description: v })} />
                <ImageUploader
                  label="Photo"
                  value={item.image}
                  onChange={(v) => update({ image: { ...item.image, ...v } })}
                />
              </>
            )}
          />
        </Section>

        {/* FEATURES (Why Choose Us) */}
        <Section title="Why Choose Us Features" defaultOpen={false}>
          <ItemList
            title="Feature"
            items={data.features || []}
            onChange={(v) => patch('features', v)}
            createEmpty={() => ({ icon: 'Gem', title: '', description: '', order: 0 })}
            renderItem={(item, update) => (
              <>
                <IconPicker value={item.icon} onChange={(v) => update({ icon: v })} />
                <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                <TextField label="Description" textarea rows={2} value={item.description} onChange={(v) => update({ description: v })} />
              </>
            )}
          />
        </Section>

        {/* CERTIFICATIONS */}
        <Section title="Certifications" defaultOpen={false}>
          <ItemList
            title="Certification"
            items={data.certifications || []}
            onChange={(v) => patch('certifications', v)}
            createEmpty={() => ({ icon: 'BadgeCheck', label: '', order: 0 })}
            renderItem={(item, update) => (
              <>
                <IconPicker value={item.icon} onChange={(v) => update({ icon: v })} />
                <TextField label="Label" value={item.label} onChange={(v) => update({ label: v })} />
              </>
            )}
          />
        </Section>

        {/* CTA */}
        <Section title="CTA Section" subtitle="Bottom call-to-action" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Title (first part)" value={data.cta?.title} onChange={(v) => patch('cta.title', v)} />
            <TextField label="Highlight (colored)" value={data.cta?.highlight} onChange={(v) => patch('cta.highlight', v)} />
            <TextField label="Title suffix" value={data.cta?.titleSuffix} onChange={(v) => patch('cta.titleSuffix', v)} />
            <div className="md:col-span-2">
              <TextField
                label="Description"
                textarea
                rows={2}
                value={data.cta?.description}
                onChange={(v) => patch('cta.description', v)}
              />
            </div>
            <TextField label="Primary button label" value={data.cta?.primaryBtn?.label} onChange={(v) => patch('cta.primaryBtn', { ...data.cta.primaryBtn, label: v })} />
            <TextField label="Primary button link" value={data.cta?.primaryBtn?.link} onChange={(v) => patch('cta.primaryBtn', { ...data.cta.primaryBtn, link: v })} />
            <TextField label="Secondary button label" value={data.cta?.secondaryBtn?.label} onChange={(v) => patch('cta.secondaryBtn', { ...data.cta.secondaryBtn, label: v })} />
            <TextField label="Secondary button link" value={data.cta?.secondaryBtn?.link} onChange={(v) => patch('cta.secondaryBtn', { ...data.cta.secondaryBtn, link: v })} />
          </div>
        </Section>

        {/* Bottom save */}
        <div className="flex justify-end pt-2 pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Page
          </button>
        </div>
      </div>
    </div>
  );
}