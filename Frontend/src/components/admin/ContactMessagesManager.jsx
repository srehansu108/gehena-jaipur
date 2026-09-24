import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft, Loader2, Trash2, Mail, Phone, User, MessageSquare, Clock, CheckCircle,
} from 'lucide-react';
import { contactMessageApi } from '../../api/contactMessageApi';

const STATUS_COLORS = {
  new: 'bg-pink-100 text-pink-700',
  read: 'bg-blue-100 text-blue-700',
  replied: 'bg-green-100 text-green-700',
  archived: 'bg-slate-100 text-slate-600',
};

export default function ContactMessagesManager({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactMessageApi.getAll({ status: filter, limit: 50 });
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    const updated = await contactMessageApi.updateStatus(id, { status });
    setMessages((prev) => prev.map((m) => (m._id === id ? updated : m)));
    if (selected?._id === id) setSelected(updated);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    await contactMessageApi.remove(id);
    setMessages((prev) => prev.filter((m) => m._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-100">
      <div className="border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-pink-50 text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Contact Messages</h2>
            <p className="text-xs text-slate-500">Inquiries submitted via the contact form</p>
          </div>
        </div>

        <div className="flex gap-2">
          {['all', 'new', 'read', 'replied', 'archived'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === s
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white'
                  : 'text-slate-600 hover:bg-pink-50'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No messages yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-0 divide-x divide-slate-100">
          {/* List */}
          <div className="max-h-[70vh] overflow-y-auto">
            {messages.map((m) => (
              <button
                key={m._id}
                onClick={() => {
                  setSelected(m);
                  if (m.status === 'new') updateStatus(m._id, 'read');
                }}
                className={`w-full text-left p-4 border-b border-slate-100 hover:bg-pink-50/30 transition ${
                  selected?._id === m._id ? 'bg-pink-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-semibold text-slate-900 truncate">{m.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[m.status]}`}>
                    {m.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 truncate">{m.subject || m.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="p-6">
            {!selected ? (
              <div className="text-center text-slate-400 py-20">
                Select a message to read
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selected.name}</h3>
                    <p className="text-xs text-slate-500">
                      {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selected._id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-pink-500" /> {selected.email}
                  </p>
                  {selected.phone && (
                    <p className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-4 h-4 text-pink-500" /> {selected.phone}
                    </p>
                  )}
                  {selected.subject && (
                    <p className="flex items-center gap-2 text-slate-700">
                      <MessageSquare className="w-4 h-4 text-pink-500" /> {selected.subject}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-pink-500" /> Prefers:{' '}
                    {selected.preferredContact}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-800 whitespace-pre-wrap">
                  {selected.message}
                </div>

                <div className="flex flex-wrap gap-2">
                  {['new', 'read', 'replied', 'archived'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected._id, s)}
                      disabled={selected.status === s}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        selected.status === s
                          ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white cursor-default'
                          : 'border hover:bg-slate-50'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}