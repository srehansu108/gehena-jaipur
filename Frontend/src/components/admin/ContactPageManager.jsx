import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft, Save, Loader2, Plus, Trash2, RotateCcw, ChevronDown, ChevronRight, X,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { contactPageApi } from '../../api/contactPageApi';

const ICON_NAMES = [
  'MapPin', 'Phone', 'Mail', 'Clock', 'Send', 'MessageSquare', 'User', 'Building2',
  'Globe', 'Facebook', 'Instagram', 'Twitter', 'Youtube', 'CheckCircle', 'AlertCircle',
  'Headphones', 'Shield', 'Truck', 'Star', 'ExternalLink', 'Navigation', 'Heart',
];

const iconByName = (name) => Icons[name] || Icons.MapPin;

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
        value={value || 'MapPin'}
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

function ItemList({ title, items = [], onChange, renderItem, createEmpty }) {
  const add = () => onChange([...items, { ...createEmpty(), order: items.length }]);
  const remove = (i) =>
    onChange(items.filter((_, idx) => idx !== i).map((it, idx) => ({ ...it, order: idx })));
  const update = (i, patch) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
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
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30">↓</button>
              <button type="button" onClick={() => remove(i)}
                className="p-1 rounded hover:bg-red-100 text-red-600">
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

export default function ContactPageManager({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await contactPageApi.getAdmin());
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
    try {
      const updated = await contactPageApi.save(data);
      setData(updated);
      setSuccessMsg('✅ Saved');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all Contact Page content to defaults?')) return;
    try {
      setData(await contactPageApi.reset());
      setSuccessMsg('Reset to defaults');
      setTimeout(() => setSuccessMsg(''), 2500);
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
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 rounded-t-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-pink-50 text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Contact Page Editor</h2>
            <p className="text-xs text-slate-500">Edit every section of the Contact page</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {successMsg && (
            <span className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">{successMsg}</span>
          )}
          <button onClick={handleReset}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-sm hover:bg-slate-50">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Page
          </button>
        </div>
      </div>

      {error && <div className="mx-4 mt-4 bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}

      <div className="p-4 space-y-4">
        {/* HERO */}
        <Section title="Hero Section">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Badge" value={data.hero?.badge} onChange={(v) => patch('hero.badge', v)} />
            <TextField label="Title" value={data.hero?.title} onChange={(v) => patch('hero.title', v)} />
            <TextField label="Highlight" value={data.hero?.highlight} onChange={(v) => patch('hero.highlight', v)} />
            <div className="md:col-span-2">
              <TextField label="Description" textarea rows={3}
                value={data.hero?.description} onChange={(v) => patch('hero.description', v)} />
            </div>
          </div>
        </Section>

        {/* CONTACT CARDS */}
        <Section title="Contact Cards" subtitle="Visit / Call / Email / Hours">
          <ItemList
            title="Contact Card"
            items={data.contactCards || []}
            onChange={(v) => patch('contactCards', v)}
            createEmpty={() => ({
              icon: 'MapPin', title: '', details: [''], action: '', actionLink: '', order: 0,
            })}
            renderItem={(item, update) => (
              <>
                <IconPicker value={item.icon} onChange={(v) => update({ icon: v })} />
                <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Details (one line per row)</label>
                  <div className="space-y-2">
                    {(item.details || []).map((d, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={d}
                          onChange={(e) => {
                            const next = [...(item.details || [])];
                            next[i] = e.target.value;
                            update({ details: next });
                          }}
                          className="flex-1 border rounded-lg px-3 py-2 text-sm"
                        />
                        <button type="button"
                          onClick={() => update({ details: item.details.filter((_, idx) => idx !== i) })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button"
                      onClick={() => update({ details: [...(item.details || []), ''] })}
                      className="text-sm text-pink-600 hover:text-pink-700 font-medium">
                      + Add detail line
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Action Label" value={item.action} onChange={(v) => update({ action: v })} />
                  <TextField label="Action Link" value={item.actionLink} onChange={(v) => update({ actionLink: v })} />
                </div>
              </>
            )}
          />
        </Section>

        {/* QUICK ASSISTANCE */}
        <Section title="Quick Assistance Panel" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Panel Title" value={data.quickAssistance?.title}
              onChange={(v) => patch('quickAssistance.title', v)} />
            <TextField label="Phone" value={data.quickAssistance?.phone}
              onChange={(v) => patch('quickAssistance.phone', v)} />
            <TextField label="Email" value={data.quickAssistance?.email}
              onChange={(v) => patch('quickAssistance.email', v)} />
            <TextField label="Working Hours" value={data.quickAssistance?.hours}
              onChange={(v) => patch('quickAssistance.hours', v)} />
          </div>
        </Section>

        {/* SOCIAL */}
        <Section title="Social Media Links" defaultOpen={false}>
          <TextField label="Panel Title" value={data.social?.title}
            onChange={(v) => patch('social.title', v)} />
          <ItemList
            title="Social Link"
            items={data.social?.links || []}
            onChange={(v) => patch('social.links', v)}
            createEmpty={() => ({ icon: 'Instagram', label: '', url: '#', order: 0 })}
            renderItem={(item, update) => (
              <>
                <IconPicker value={item.icon} onChange={(v) => update({ icon: v })} />
                <TextField label="Label" value={item.label} onChange={(v) => update({ label: v })} />
                <TextField label="URL" value={item.url} onChange={(v) => update({ url: v })} />
              </>
            )}
          />
        </Section>

        {/* TRUST BADGES */}
        <Section title="Trust Badges" defaultOpen={false}>
          <TextField label="Panel Title" value={data.trustBadges?.title}
            onChange={(v) => patch('trustBadges.title', v)} />
          <ItemList
            title="Trust Badge"
            items={data.trustBadges?.badges || []}
            onChange={(v) => patch('trustBadges.badges', v)}
            createEmpty={() => ({ icon: 'Shield', text: '', order: 0 })}
            renderItem={(item, update) => (
              <>
                <IconPicker value={item.icon} onChange={(v) => update({ icon: v })} />
                <TextField label="Text" value={item.text} onChange={(v) => update({ text: v })} />
              </>
            )}
          />
        </Section>

        {/* MAP */}
        <Section title="Map Section" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Badge" value={data.map?.badge} onChange={(v) => patch('map.badge', v)} />
            <TextField label="Title" value={data.map?.title} onChange={(v) => patch('map.title', v)} />
            <TextField label="Highlight" value={data.map?.highlight} onChange={(v) => patch('map.highlight', v)} />
            <TextField label="Pin Label" value={data.map?.pinLabel} onChange={(v) => patch('map.pinLabel', v)} />
            <TextField label="Phone" value={data.map?.phone} onChange={(v) => patch('map.phone', v)} />
            <TextField label="Hours" value={data.map?.hours} onChange={(v) => patch('map.hours', v)} />
            <div className="md:col-span-2">
              <TextField label="Address" textarea rows={2} value={data.map?.address}
                onChange={(v) => patch('map.address', v)} />
            </div>
            <div className="md:col-span-2">
              <TextField label="Google Maps iframe src" textarea rows={3} value={data.map?.iframeUrl}
                onChange={(v) => patch('map.iframeUrl', v)}
                placeholder="Paste the src URL from Google Maps → Share → Embed" />
            </div>
            <div className="md:col-span-2">
              <TextField label="External map link (Open in Maps)" value={data.map?.externalLink}
                onChange={(v) => patch('map.externalLink', v)} />
            </div>
          </div>
        </Section>

        {/* STORE LOCATIONS */}
        <Section title="Store Locations" defaultOpen={false}>
          <ItemList
            title="Store"
            items={data.storeLocations || []}
            onChange={(v) => patch('storeLocations', v)}
            createEmpty={() => ({
              name: '', address: '', phone: '', timings: '', mapLink: '', isMain: false, order: 0,
            })}
            renderItem={(item, update) => (
              <>
                <TextField label="Name" value={item.name} onChange={(v) => update({ name: v })} />
                <TextField label="Address" textarea rows={2} value={item.address}
                  onChange={(v) => update({ address: v })} />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Phone" value={item.phone} onChange={(v) => update({ phone: v })} />
                  <TextField label="Timings" value={item.timings} onChange={(v) => update({ timings: v })} />
                </div>
                <TextField label="Map Link" value={item.mapLink} onChange={(v) => update({ mapLink: v })} />
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={!!item.isMain}
                    onChange={(e) => update({ isMain: e.target.checked })} />
                  Mark as Main Store
                </label>
              </>
            )}
          />
        </Section>

        {/* FAQS */}
        <Section title="FAQs" defaultOpen={false}>
          <ItemList
            title="FAQ"
            items={data.faqs || []}
            onChange={(v) => patch('faqs', v)}
            createEmpty={() => ({ question: '', answer: '', order: 0 })}
            renderItem={(item, update) => (
              <>
                <TextField label="Question" value={item.question} onChange={(v) => update({ question: v })} />
                <TextField label="Answer" textarea rows={3} value={item.answer}
                  onChange={(v) => update({ answer: v })} />
              </>
            )}
          />
        </Section>

        {/* CTA */}
        <Section title="CTA Section" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Title" value={data.cta?.title} onChange={(v) => patch('cta.title', v)} />
            <TextField label="Highlight" value={data.cta?.highlight} onChange={(v) => patch('cta.highlight', v)} />
            <TextField label="Title suffix" value={data.cta?.titleSuffix}
              onChange={(v) => patch('cta.titleSuffix', v)} />
            <div className="md:col-span-2">
              <TextField label="Description" textarea rows={2} value={data.cta?.description}
                onChange={(v) => patch('cta.description', v)} />
            </div>
            <TextField label="Primary button label" value={data.cta?.primaryBtn?.label}
              onChange={(v) => patch('cta.primaryBtn', { ...data.cta.primaryBtn, label: v })} />
            <TextField label="Primary button link" value={data.cta?.primaryBtn?.link}
              onChange={(v) => patch('cta.primaryBtn', { ...data.cta.primaryBtn, link: v })} />
            <TextField label="Secondary button label" value={data.cta?.secondaryBtn?.label}
              onChange={(v) => patch('cta.secondaryBtn', { ...data.cta.secondaryBtn, label: v })} />
            <TextField label="Secondary button link" value={data.cta?.secondaryBtn?.link}
              onChange={(v) => patch('cta.secondaryBtn', { ...data.cta.secondaryBtn, link: v })} />
          </div>
        </Section>

        <div className="flex justify-end pt-2 pb-4">
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Page
          </button>
        </div>
      </div>
    </div>
  );
}