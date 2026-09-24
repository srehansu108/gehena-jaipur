import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Sparkles,
  Plus,
  Search,
  X,
  GripVertical,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import api from '../../services/api';

const PLACEHOLDER = '/images/products/placeholder.jpg';

export default function NewArrivalsManager({ onBack }) {
  const [featured, setFeatured] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pickerLoading, setPickerLoading] = useState(false);

  const loadFeatured = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/products/admin/products', { params: { limit: 100 } });
      const all = res.data?.data || [];
      const arrivals = all
        .filter((p) => p.isNewArrival)
        .sort((a, b) => (a.newArrivalOrder ?? 0) - (b.newArrivalOrder ?? 0));
      setFeatured(arrivals);
    } catch (e) {
      try {
        const res = await api.get('/products/new-arrivals', { params: { limit: 50 } });
        setFeatured(res.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load new arrivals');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  const loadPickerProducts = useCallback(async () => {
    setPickerLoading(true);
    try {
      const res = await api.get('/products/admin/products', {
        params: { limit: 100, sort: 'createdAt', order: 'desc' },
      });
      setAllProducts(res.data?.data || []);
    } catch (e) {
      console.error('Failed to load products for picker:', e);
    } finally {
      setPickerLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pickerOpen) loadPickerProducts();
  }, [pickerOpen, loadPickerProducts]);

  const toggleNewArrival = async (productId) => {
    try {
      const res = await api.patch(
        `/products/admin/products/${productId}/toggle-new-arrival`
      );
      return res.data?.data;
    } catch (e) {
      setError(e?.response?.data?.message || 'Toggle failed');
      return null;
    }
  };

  const handleAdd = async (product) => {
    if (featured.some((p) => p._id === product._id)) return;
    setSaving(true);
    const updated = await toggleNewArrival(product._id);
    setSaving(false);
    if (updated) setFeatured((prev) => [...prev, updated]);
  };

  const handleRemove = async (product) => {
    if (!confirm(`Remove "${product.name}" from new arrivals?`)) return;
    setSaving(true);
    const updated = await toggleNewArrival(product._id);
    setSaving(false);
    if (updated) setFeatured((prev) => prev.filter((p) => p._id !== product._id));
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const arr = Array.from(featured);
    const [moved] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, moved);

    const reordered = arr.map((p, i) => ({ ...p, newArrivalOrder: i }));
    setFeatured(reordered);

    try {
      await api.patch('/products/admin/products/reorder-new-arrivals', {
        order: reordered.map(({ _id, newArrivalOrder }) => ({
          id: _id,
          order: newArrivalOrder,
        })),
      });
    } catch (e) {
      console.error('Reorder failed:', e);
      setError('Reorder failed — reverting');
      loadFeatured();
    }
  };

  const filteredProducts = allProducts.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  const alreadyFeatured = (id) => featured.some((p) => p._id === id);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
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
            <h2 className="text-2xl font-bold text-slate-800">New Arrivals</h2>
            <p className="text-sm text-slate-500">
              Pick which products appear in the homepage New Arrivals section
            </p>
          </div>
        </div>
        <button
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        </div>
      ) : featured.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border-2 border-dashed rounded-xl">
          No new arrivals yet. Click <strong>Add Product</strong> to feature some.
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="new-arrivals">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {featured.map((product, index) => (
                  <Draggable
                    key={product._id}
                    draggableId={product._id}
                    index={index}
                  >
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

                        <span className="w-6 text-center font-mono text-sm text-slate-500">
                          #{index + 1}
                        </span>

                        <img
                          src={product.images?.[0] || PLACEHOLDER}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER;
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
                            {product.category} · ₹
                            {Number(product.price || 0).toLocaleString('en-IN')} ·{' '}
                            {product.sku || '—'}
                          </p>
                        </div>

                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            product.inStock
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>

                        <button
                          onClick={() => handleRemove(product)}
                          disabled={saving}
                          className="p-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                          title="Remove from new arrivals"
                        >
                          <X className="w-4 h-4 text-red-600" />
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

      {pickerOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Add Products to New Arrivals
                </h3>
                <p className="text-sm text-slate-500">Click a product to feature it</p>
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, SKU, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {pickerLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-slate-500">No products found.</div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => {
                    const isFeatured = alreadyFeatured(product._id);
                    return (
                      <button
                        key={product._id}
                        onClick={() => handleAdd(product)}
                        disabled={isFeatured || saving}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                          isFeatured
                            ? 'bg-pink-50 border-pink-200 opacity-60 cursor-not-allowed'
                            : 'hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <img
                          src={product.images?.[0] || PLACEHOLDER}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {product.category} · ₹
                            {Number(product.price || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                        {isFeatured ? (
                          <Sparkles className="w-4 h-4 text-pink-500" />
                        ) : (
                          <Plus className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setPickerOpen(false)}
                className="px-4 py-2 rounded-lg border hover:bg-slate-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}