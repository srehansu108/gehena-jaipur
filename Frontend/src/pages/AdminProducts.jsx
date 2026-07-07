// src/pages/admin/AdminProducts.jsx
import { useState, useEffect, useRef } from 'react';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { 
  getAdminProducts, 
  deleteProduct, 
  createProduct, 
  updateProduct,
  bulkImportProducts,
  exportProductsCSV,
  exportProductsJSON,
  getCSVTemplate
} from '../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10000,
    total: 0,
    pages: 0
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState('csv');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    price: '',
    originalPrice: '',
    metal: '',
    inStock: true,
    stockCount: 0,
    description: '',
    images: [],
    tags: [],
    badgeType: '',
    discount: 0,
    sku: ''
  });

  const categories = [
    'rings', 'necklaces', 'earrings', 'bangles', 
    'pendants', 'bracelets', 'sets', 'mangalsutra'
  ];

  const metals = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold'];
  const badgeTypes = ['bestseller', 'new', 'sale', 'limited', 'exclusive'];

  // ✅ FETCH PRODUCTS
  const fetchProducts = async (page = 1, search = '', category = '') => {
    setLoading(true);
    try {
      const response = await getAdminProducts({
        page,
        limit: 10000,
        search: search.trim(),
        category
      });

      if (response.success) {
        setProducts(response.data || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 10000,
          total: 0,
          pages: 0
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2 || searchTerm.length === 0) {
        fetchProducts(1, searchTerm, selectedCategory);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // ✅ HANDLE CREATE PRODUCT
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stockCount: Number(formData.stockCount),
        discount: Number(formData.discount),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: formData.images.split(',').map(i => i.trim()).filter(Boolean)
      };

      const response = await createProduct(productData);
      if (response.success) {
        setShowAddModal(false);
        resetForm();
        fetchProducts(pagination.page, searchTerm, selectedCategory);
        alert('Product created successfully!');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    }
  };

  // ✅ HANDLE UPDATE PRODUCT
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stockCount: Number(formData.stockCount),
        discount: Number(formData.discount),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: formData.images.split(',').map(i => i.trim()).filter(Boolean)
      };

      const response = await updateProduct(selectedProduct._id, productData);
      if (response.success) {
        setShowEditModal(false);
        resetForm();
        fetchProducts(pagination.page, searchTerm, selectedCategory);
        alert('Product updated successfully!');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  // ✅ HANDLE DELETE PRODUCT
  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;
    
    try {
      const response = await deleteProduct(productId);
      if (response.success) {
        fetchProducts(pagination.page, searchTerm, selectedCategory);
        alert('Product deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  // ✅ EDIT PRODUCT - Populate form
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      metal: product.metal || '',
      inStock: product.inStock !== undefined ? product.inStock : true,
      stockCount: product.stockCount || 0,
      description: product.description || '',
      images: product.images ? product.images.join(', ') : '',
      tags: product.tags ? product.tags.join(', ') : '',
      badgeType: product.badgeType || '',
      discount: product.discount || 0,
      sku: product.sku || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      price: '',
      originalPrice: '',
      metal: '',
      inStock: true,
      stockCount: 0,
      description: '',
      images: [],
      tags: [],
      badgeType: '',
      discount: 0,
      sku: ''
    });
  };

  // ✅ BULK IMPORT HANDLERS
  const handleImport = async () => {
    if (!importData.trim()) {
      alert('Please paste product data or upload a file');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      let products = [];

      if (importFormat === 'csv') {
        // Parse CSV data
        const lines = importData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const product = {};
          headers.forEach((header, index) => {
            product[header] = values[index] || '';
          });
          products.push(product);
        }
      } else if (importFormat === 'json') {
        try {
          const jsonData = JSON.parse(importData);
          products = Array.isArray(jsonData) ? jsonData : jsonData.data || [jsonData];
        } catch (e) {
          alert('Invalid JSON format. Please check your data.');
          setImporting(false);
          return;
        }
      }

      if (products.length === 0) {
        alert('No valid products found in the data');
        setImporting(false);
        return;
      }

      const response = await bulkImportProducts(products);
      
      setImportResult({
        success: response.success,
        inserted: response.data?.inserted || 0,
        total: products.length,
        message: response.message
      });

      if (response.success) {
        fetchProducts(1, searchTerm, selectedCategory);
        setTimeout(() => {
          setShowImportModal(false);
          setImportData('');
          setImportResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: error.response?.data?.message || 'Import failed',
        error: error.message
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImportData(event.target.result);
    };
    reader.readAsText(file);
  };

  // ✅ EXPORT HANDLERS
  const handleExportCSV = async () => {
    try {
      const blob = await exportProductsCSV({ category: selectedCategory });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export products as CSV');
    }
  };

  const handleExportJSON = async () => {
    try {
      const response = await exportProductsJSON({ category: selectedCategory });
      const dataStr = JSON.stringify(response, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export products as JSON');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await getCSVTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product_import_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download error:', error);
      alert('Failed to download template');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">
            Manage your product inventory
            <span className="ml-2 text-sm text-indigo-600 font-medium">
              ({pagination.total} total products)
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Import/Export Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              onClick={() => setShowImportModal(true)}
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
              Import
            </button>
          </div>
          
          <div className="relative group">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Export
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 hidden group-hover:block z-10">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-t-lg text-sm"
              >
                📊 Export as CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-b-lg text-sm"
              >
                📄 Export as JSON
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name, category, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              fetchProducts(1, searchTerm, e.target.value);
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id || product.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-slate-100 relative">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <PhotoIcon className="h-12 w-12" />
                </div>
              )}
              {product.badgeType && (
                <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium uppercase
                  ${product.badgeType === 'bestseller' ? 'bg-yellow-500 text-white' :
                    product.badgeType === 'new' ? 'bg-green-500 text-white' :
                    product.badgeType === 'sale' ? 'bg-red-500 text-white' :
                    product.badgeType === 'limited' ? 'bg-purple-500 text-white' :
                    'bg-blue-500 text-white'}`}
                >
                  {product.badgeType}
                </span>
              )}
              {product.sku && (
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                  {product.sku}
                </span>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-500">{product.category}</span>
                    {product.metal && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-sm text-slate-500">{product.metal}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className="font-bold text-indigo-600">${product.price}</div>
                  {product.originalPrice && (
                    <div className="text-xs text-slate-400 line-through">
                      ${product.originalPrice}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${product.inStock && product.stockCount > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-600">
                  {product.inStock && product.stockCount > 0 
                    ? `${product.stockCount} in stock` 
                    : 'Out of stock'}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEditClick(product)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Product"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id || product.id, product.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Product"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <PhotoIcon className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchProducts(pagination.page - 1, searchTerm, selectedCategory)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-slate-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchProducts(pagination.page + 1, searchTerm, selectedCategory)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border border-slate-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ============ BULK IMPORT MODAL ============ */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-900">Bulk Import Products</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData('');
                  setImportResult(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Format Selection */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="csv"
                    checked={importFormat === 'csv'}
                    onChange={() => setImportFormat('csv')}
                    className="text-indigo-600"
                  />
                  CSV
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="json"
                    checked={importFormat === 'json'}
                    onChange={() => setImportFormat('json')}
                    className="text-indigo-600"
                  />
                  JSON
                </label>
              </div>

              {/* Template Download */}
              <div>
                <button
                  onClick={handleDownloadTemplate}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                  Download CSV Template
                </button>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Upload File (Optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={importFormat === 'csv' ? '.csv' : '.json'}
                  onChange={handleFileUpload}
                  className="w-full"
                />
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Paste {importFormat.toUpperCase()} Data
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows="10"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  placeholder={`Paste your ${importFormat.toUpperCase()} data here...`}
                />
              </div>

              {/* Import Result */}
              {importResult && (
                <div className={`p-4 rounded-lg ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-medium ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {importResult.success ? '✅ Import Successful!' : '❌ Import Failed'}
                  </p>
                  <p className="text-sm mt-1">
                    {importResult.message || `${importResult.inserted || 0} of ${importResult.total || 0} products imported`}
                  </p>
                  {importResult.error && (
                    <p className="text-sm text-red-600 mt-1">{importResult.error}</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData('');
                    setImportResult(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || !importData.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Import Products'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ ADD/EDIT MODALS ============ */}
      {/* Add/Edit modal code remains the same as before */}
      {showAddModal && (
        <ProductModal
          title="Add New Product"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateProduct}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          categories={categories}
          metals={metals}
          badgeTypes={badgeTypes}
          isEdit={false}
        />
      )}

      {showEditModal && (
        <ProductModal
          title="Edit Product"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateProduct}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
          }}
          categories={categories}
          metals={metals}
          badgeTypes={badgeTypes}
          isEdit={true}
        />
      )}
    </div>
  );
}

// ============ PRODUCT MODAL COMPONENT ============
function ProductModal({ 
  title, 
  formData, 
  setFormData, 
  onSubmit, 
  onClose, 
  categories, 
  metals, 
  badgeTypes,
  isEdit 
}) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory</label>
              <input type="text" name="subcategory" value={formData.subcategory} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price * ($)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Original Price ($)</label>
              <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} min="0" step="0.01"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metal</label>
              <select name="metal" value={formData.metal} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="">Select Metal</option>
                {metals.map(metal => <option key={metal} value={metal}>{metal}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Count</label>
              <input type="number" name="stockCount" value={formData.stockCount} onChange={handleChange} min="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Badge Type</label>
              <select name="badgeType" value={formData.badgeType} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="">None</option>
                {badgeTypes.map(badge => <option key={badge} value={badge}>{badge.charAt(0).toUpperCase() + badge.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Discount (%)</label>
              <input type="number" name="discount" value={formData.discount} onChange={handleChange} min="0" max="100"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleChange}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
              <label className="text-sm font-medium text-slate-700">In Stock</label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Image URLs (comma separated)</label>
              <input type="text" name="images" value={formData.images} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
              {isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}