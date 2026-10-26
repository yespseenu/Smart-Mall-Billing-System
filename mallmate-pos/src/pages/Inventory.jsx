
import { useMemo, useState } from 'react';


const categories = ['Electronics', 'Home', 'Fashion', 'Stationery'];

const money = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);

const emptyForm = {
  name: '',
  sku: '',
  category: 'Electronics',
  price: '',
  stock: '',
};

export default function Inventory({ products, setProducts }){

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term);

      const matchesCategory =
        category === 'All' || product.category === category;

      const matchesStock =
        stockFilter === 'All' ||
        (stockFilter === 'Low stock' &&
          product.stock > 0 &&
          product.stock <= 5) ||
        (stockFilter === 'Out of stock' && product.stock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, category, stockFilter]);

  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = products.filter(
    (p) => p.stock > 0 && p.stock <= 5
  ).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  }

  function saveProduct(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const name = form.name.trim();
    const sku = form.sku.trim().toUpperCase();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!name || !sku || form.price === '' || form.stock === '') {
      setError('Please complete every field.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError('Price must be greater than zero.');
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError('Stock must be a whole number of zero or more.');
      return;
    }

    const duplicateSku = products.some(
      (p) =>
        p.sku.toLowerCase() === sku.toLowerCase() &&
        p.id !== editingId
    );

    if (duplicateSku) {
      setError('This SKU already exists. Enter a unique SKU.');
      return;
    }

    const categoryIcons = {
  Electronics: 'bi-cpu',
  Home: 'bi-house',
  Fashion: 'bi-bag',
  Stationery: 'bi-journal',
};

const productData = {
  name,
  sku,
  category: form.category,
  price,
  stock,
  icon: categoryIcons[form.category] || 'bi-box-seam',
};

    if (editingId !== null) {
      setProducts((current) =>
        current.map((p) =>
          p.id === editingId ? { ...p, ...productData } : p
        )
      );
      setSuccess('Product updated successfully.');
    } else {
      setProducts((current) => [
        ...current,
        { id: Date.now(), ...productData },
      ]);
      setSuccess('Product added successfully.');
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  function deleteProduct(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}" from inventory?`
    );

    if (!confirmed) return;

    setProducts((current) => current.filter((p) => p.id !== product.id));
    setSuccess(`${product.name} deleted.`);
    setError('');
  }

  function adjustStock(product, amount) {
    setProducts((current) =>
      current.map((p) =>
        p.id === product.id
          ? { ...p, stock: Math.max(0, p.stock + amount) }
          : p
      )
    );
    setSuccess(`Stock updated for ${product.name}.`);
    setError('');
  }

  return (
    <div className="inventory-page">
      <div className="inventory-heading">
        <div>
          <h2>Product Inventory</h2>
          <p>Manage your products, pricing and stock levels.</p>
        </div>
        <button className="inventory-add-btn" onClick={openAddForm}>
          <i className="bi bi-plus-lg me-2" />
          Add Product
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      <div className="inventory-stats">
        <article className="inventory-stat">
          <div className="inventory-stat-icon blue">
            <i className="bi bi-box-seam" />
          </div>
          <div><span>Total Products</span><strong>{products.length}</strong></div>
        </article>
        <article className="inventory-stat">
          <div className="inventory-stat-icon green">
            <i className="bi bi-stack" />
          </div>
          <div><span>Total Units</span><strong>{totalUnits}</strong></div>
        </article>
        <article className="inventory-stat">
          <div className="inventory-stat-icon orange">
            <i className="bi bi-exclamation-triangle" />
          </div>
          <div><span>Low Stock</span><strong>{lowStock}</strong></div>
        </article>
        <article className="inventory-stat">
          <div className="inventory-stat-icon red">
            <i className="bi bi-x-circle" />
          </div>
          <div><span>Out of Stock</span><strong>{outOfStock}</strong></div>
        </article>
      </div>

      <div className="inventory-value-card">
        <div>
          <span>Estimated Inventory Value</span>
          <h3>{money(inventoryValue)}</h3>
          <p>Calculated from current price × available quantity.</p>
        </div>
        <i className="bi bi-currency-rupee" />
      </div>

      {showForm && (
        <section className="inventory-form-card">
          <div className="inventory-form-heading">
            <h3>{editingId !== null ? 'Edit Product' : 'Add New Product'}</h3>
            <button
              className="inventory-close-btn"
              type="button"
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              aria-label="Close form"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <form onSubmit={saveProduct}>
            <div className="inventory-form-grid">
              <div>
                <label htmlFor="inv-name">Product Name</label>
                <input
                  id="inv-name"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Wireless Mouse"
                  required
                />
              </div>
              <div>
                <label htmlFor="inv-sku">SKU</label>
                <input
                  id="inv-sku"
                  className="form-control"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g. ELEC-102"
                  required
                />
              </div>
              <div>
                <label htmlFor="inv-category">Category</label>
                <select
                  id="inv-category"
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="inv-price">Price (₹)</label>
                <input
                  id="inv-price"
                  className="form-control"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="inv-stock">Available Stock</label>
                <input
                  id="inv-stock"
                  className="form-control"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="inventory-form-actions">
              <button
                type="button"
                className="inventory-cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="inventory-add-btn">
                {editingId !== null ? 'Save Changes' : 'Save Product'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="inventory-table-card">
        <div className="inventory-table-heading">
          <div>
            <h3>Product List</h3>
            <p>{filteredProducts.length} products found</p>
          </div>
          <div className="inventory-filters">
            <input
              type="search"
              className="form-control"
              placeholder="Search name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search inventory"
            />
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select
              className="form-select"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              aria-label="Filter by stock"
            >
              <option value="All">All Stock</option>
              <option value="Low stock">Low Stock</option>
              <option value="Out of stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table inventory-table align-middle">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const status =
                  product.stock === 0
                    ? 'Out of stock'
                    : product.stock <= 5
                      ? 'Low stock'
                      : 'In stock';

                return (
                  <tr key={product.id}>
                    <td><strong>{product.name}</strong></td>
                    <td><span className="inventory-sku">{product.sku}</span></td>
                    <td>{product.category}</td>
                    <td>{money(product.price)}</td>
                    <td>
                      <div className="inventory-stock-control">
                        <button
                          onClick={() => adjustStock(product, -1)}
                          disabled={product.stock === 0}
                          aria-label={`Decrease stock for ${product.name}`}
                        >−</button>
                        <strong>{product.stock}</strong>
                        <button
                          onClick={() => adjustStock(product, 1)}
                          aria-label={`Increase stock for ${product.name}`}
                        >+</button>
                      </div>
                    </td>
                    <td>
                      <span className={`inventory-status ${status === 'In stock' ? 'status-in' : status === 'Low stock' ? 'status-low' : 'status-out'}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="inventory-row-actions">
                        <button
                          onClick={() => openEditForm(product)}
                          aria-label={`Edit ${product.name}`}
                          title="Edit product"
                        ><i className="bi bi-pencil-square" /></button>
                        <button
                          onClick={() => deleteProduct(product)}
                          aria-label={`Delete ${product.name}`}
                          title="Delete product"
                        ><i className="bi bi-trash3" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="inventory-no-results">
                    No products found. Try changing your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
