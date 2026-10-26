
import { useMemo, useState } from 'react';

const categories = ['All', 'Electronics', 'Home', 'Fashion', 'Stationery'];

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);

export default function Billing({
  products,
  setProducts,
  onSaleCompleted,
}) {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customer, setCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        category === 'All' || product.category === category;

      const term = search.trim().toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Demo calculation: 5% GST after discount.
  // Replace this with the correct tax rate for each product in a real system.
  const discount = subtotal * (discountPercent / 100);
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * 0.05;
  const total = taxableAmount + tax;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product) {
    setError('');
    setReceipt(null);

    if (product.stock <= 0) {
      setError('This product is out of stock.');
      return;
    }

    const existing = cart.find((item) => item.id === product.id);

    if (existing && existing.quantity >= product.stock) {
      setError(`Only ${product.stock} units are available.`);
      return;
    }

    if (existing) {
      setCart((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart((current) => [...current, { ...product, quantity: 1 }]);
    }
  }

  function changeQuantity(id, change) {
    setError('');

    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;

          const product = products.find((p) => p.id === id);
          const quantity = item.quantity + change;

          if (quantity > product.stock) {
            setError(`Only ${product.stock} units are available.`);
            return item;
          }

          return { ...item, quantity };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((item) => item.id !== id));
    setError('');
  }

  function completeSale() {
    setError('');

    if (cart.length === 0) {
      setError('Add at least one product before checkout.');
      return;
    }

    // Keep a snapshot of this bill for the receipt.
    const completedBill = {
      id: `MM-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      customer: customer.trim() || 'Walk-in Customer',
      paymentMethod,
      items: cart.map((item) => ({ ...item })),
      subtotal,
      discount,
      tax,
      total,
    };
    onSaleCompleted?.(completedBill);

    setProducts((current) =>
      current.map((product) => {
        const soldItem = cart.find((item) => item.id === product.id);

        return soldItem
          ? { ...product, stock: product.stock - soldItem.quantity }
          : product;
      })
    );

    setReceipt(completedBill);
    setCart([]);
    setCustomer('');
    setDiscountPercent(0);
  }

  function startNewBill() {
    setReceipt(null);
    setError('');
  }

  if (receipt) {
    return (
      <div className="billing-page">
        <div className="billing-heading">
          <div>
            <h2>Sale Completed</h2>
            <p>Your demo receipt has been generated successfully.</p>
          </div>
          <button className="billing-primary-btn" onClick={startNewBill}>
            <i className="bi bi-plus-lg me-2" />
            New Bill
          </button>
        </div>

        <section className="receipt-card">
          <div className="receipt-success">
            <i className="bi bi-check-circle-fill" />
            <h3>Payment Recorded</h3>
            <p>This is a local demo transaction.</p>
          </div>

          <div className="receipt-brand">
            <h2><i className="bi bi-bag-check-fill me-2" />MallMate POS</h2>
            <p>Smart Retail Billing System</p>
          </div>

          <div className="receipt-meta">
            <span>Bill number</span>
            <strong>{receipt.id}</strong>
            <span>Date</span>
            <strong>
              {new Date(receipt.date).toLocaleString('en-IN')}
            </strong>
            <span>Customer</span>
            <strong>{receipt.customer}</strong>
            <span>Payment</span>
            <strong>{receipt.paymentMethod}</strong>
          </div>

          <div className="table-responsive">
            <table className="table receipt-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{money(item.price)}</td>
                    <td className="text-end">
                      {money(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="receipt-totals">
            <div><span>Subtotal</span><strong>{money(receipt.subtotal)}</strong></div>
            <div><span>Discount</span><strong>-{money(receipt.discount)}</strong></div>
            <div><span>Demo GST (5%)</span><strong>{money(receipt.tax)}</strong></div>
            <div className="receipt-grand-total">
              <span>Total Paid</span><strong>{money(receipt.total)}</strong>
            </div>
          </div>

          <p className="receipt-thanks">Thank you for shopping with us!</p>
          <button className="billing-secondary-btn w-100 mt-3" onClick={() => window.print()}>
            <i className="bi bi-printer me-2" />Print Receipt
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="billing-page">
      <div className="billing-heading">
        <div>
          <h2>POS Billing</h2>
          <p>Select products and create a customer bill.</p>
        </div>
        <div className="billing-live-status">
          <span /> Billing counter active
        </div>
      </div>

      {error && (
        <div className="alert alert-warning py-2" role="alert">
          <i className="bi bi-exclamation-circle me-2" />
          {error}
        </div>
      )}

      <div className="billing-layout">
        <section className="billing-catalog">
          <div className="billing-search">
            <i className="bi bi-search" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product name or SKU..."
              aria-label="Search products"
            />
            <span className="billing-shortcut">SEARCH</span>
          </div>

          <div className="billing-categories">
            {categories.map((item) => (
              <button
                key={item}
                className={`category-chip ${category === item ? 'selected' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="catalog-heading">
            <h3>Products</h3>
            <span>{filteredProducts.length} items</span>
          </div>

          <div className="billing-product-grid">
            {filteredProducts.map((product) => {
              const outOfStock = product.stock === 0;

              return (
                <article className="billing-product-card" key={product.id}>
                  <div className={`billing-product-icon product-tone-${product.id % 4}`}>
                    <i className={`bi ${product.icon}`} />
                  </div>
                  <span className="product-category">{product.category}</span>
                  <h4>{product.name}</h4>
                  <p>{product.sku}</p>
                  <div className="product-card-bottom">
                    <div>
                      <strong>{money(product.price)}</strong>
                      <small className={product.stock <= 5 ? 'stock-warning' : ''}>
                        {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
                      </small>
                    </div>
                    <button
                      className="add-product-btn"
                      onClick={() => addToCart(product)}
                      disabled={outOfStock}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <i className="bi bi-plus-lg" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="billing-empty">
              <i className="bi bi-search" />
              <p>No products match your search.</p>
            </div>
          )}
        </section>

        <aside className="billing-cart">
          <div className="cart-heading">
            <div className="cart-title-icon"><i className="bi bi-cart3" /></div>
            <div>
              <h3>Current Bill</h3>
              <p>{itemCount} items in cart</p>
            </div>
            <button
              className="clear-cart-btn"
              onClick={() => {
                setCart([]);
                setError('');
              }}
              disabled={cart.length === 0}
            >
              Clear
            </button>
          </div>

          <div className="cart-customer">
            <label htmlFor="customer-name">Customer name <span>(optional)</span></label>
            <div className="customer-input">
              <i className="bi bi-person" />
              <input
                id="customer-name"
                value={customer}
                onChange={(event) => setCustomer(event.target.value)}
                placeholder="Walk-in customer"
              />
            </div>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <div><i className="bi bi-cart2" /></div>
                <strong>Your cart is empty</strong>
                <p>Select a product to start a bill.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-symbol">
                    <i className={`bi ${item.icon}`} />
                  </div>
                  <div className="cart-item-info">
                    <strong>{item.name}</strong>
                    <small>{money(item.price)} each</small>
                    <div className="quantity-control">
                      <button
                        onClick={() => changeQuantity(item.id, -1)}
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        <i className="bi bi-dash" />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => changeQuantity(item.id, 1)}
                        disabled={item.quantity >= item.stock}
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        <i className="bi bi-plus" />
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-price">
                    <strong>{money(item.price * item.quantity)}</strong>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <i className="bi bi-trash3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-calculations">
            <div><span>Subtotal ({itemCount} items)</span><strong>{money(subtotal)}</strong></div>
            <div className="discount-row">
              <label htmlFor="discount">Discount (%)</label>
              <input
                id="discount"
                type="number"
                min="0"
                max="100"
                step="1"
                value={discountPercent}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setDiscountPercent(
                    Number.isFinite(value)
                      ? Math.min(100, Math.max(0, value))
                      : 0
                  );
                }}
              />
              <strong>-{money(discount)}</strong>
            </div>
            <div><span>Demo GST (5%)</span><strong>{money(tax)}</strong></div>
            <div className="cart-grand-total">
              <span>Total Amount</span><strong>{money(total)}</strong>
            </div>
            <p className="tax-note">
              <i className="bi bi-info-circle me-1" />
              Demo tax rate only. Actual GST depends on the product.
            </p>

            <label className="payment-label" htmlFor="payment-method">Payment method</label>
            <select
              id="payment-method"
              className="form-select payment-select"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
            </select>

            <button
              className="billing-checkout-btn"
              onClick={completeSale}
              disabled={cart.length === 0}
            >
              Complete Sale <i className="bi bi-arrow-right ms-2" />
            </button>
            <p className="checkout-note">
              <i className="bi bi-shield-check me-1" />
              Demo checkout — no real payment is processed.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
