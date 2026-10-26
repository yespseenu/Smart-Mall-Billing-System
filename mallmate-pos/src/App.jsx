
import { useState } from 'react';
import Billing from './pages/Billing.jsx';
import Inventory from './pages/Inventory.jsx';
import { initialProducts } from './data/products.js';
import SalesHistory from './pages/SalesHistory.jsx';

// Shared currency formatter
function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
}

// Sidebar navigation
const navItems = [
  { label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
  { label: 'POS Billing', icon: 'bi-receipt' },
  { label: 'Products', icon: 'bi-box-seam' },
  { label: 'Sales History', icon: 'bi-clock-history' },
];

// Sidebar
function Sidebar({
  activePage,
  setActivePage,
  open,
  closeSidebar,
  lowStockCount,
}) {
  return (
    <>
      {open && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            <i className="bi bi-bag-check-fill" />
          </div>

          <div>
            <h5>MallMate</h5>
            <span>SMART RETAIL POS</span>
          </div>
        </div>

        <div className="nav-heading">WORKSPACE</div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`nav-link-custom ${
                activePage === item.label ? 'active' : ''
              }`}
              onClick={() => {
                setActivePage(item.label);
                closeSidebar();
              }}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>

              {item.label === 'Products' && lowStockCount > 0 && (
                <span className="nav-count">{lowStockCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="store-card">
            <i className="bi bi-shop" />

            <div>
              <strong>My Store</strong>
              <small>Main Branch</small>
            </div>

            <i className="bi bi-chevron-down ms-auto" />
          </div>

          <div className="sidebar-footer">
            <i className="bi bi-headset" />
            Help &amp; Support
          </div>
        </div>
      </aside>
    </>
  );
}

// Header
function Header({ activePage, onMenuClick }) {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="topbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <i className="bi bi-list" />
        </button>

        <div>
          <h4>{activePage}</h4>
          <p>Welcome back! Here's your store overview.</p>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="date-label">
          <i className="bi bi-calendar3" />
          <span>{currentDate}</span>
        </div>

        <button className="icon-btn" aria-label="Notifications">
          <i className="bi bi-bell" />
          <span className="notification-dot" />
        </button>

        <div className="user-profile">
          <div className="avatar">S</div>

          <div className="user-info">
            <strong>Store Admin</strong>
            <small>Administrator</small>
          </div>

          <i className="bi bi-chevron-down" />
        </div>
      </div>
    </header>
  );
}

// Dashboard statistic card
function StatCard({ stat }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span>{stat.title}</span>

        <div className={`stat-icon ${stat.color}`}>
          <i className={`bi ${stat.icon}`} />
        </div>
      </div>

      <h3>{stat.value}</h3>

      <div className="stat-caption">
        {stat.color === 'orange' ? (
          <i className="bi bi-exclamation-circle text-warning" />
        ) : stat.change.includes('%') ? (
          <i className="bi bi-arrow-up-right text-success" />
        ) : (
          <i className="bi bi-info-circle text-secondary" />
        )}

        <span>{stat.change}</span>

        {stat.change.includes('%') && (
          <span className="text-secondary"> vs last week</span>
        )}
      </div>
    </div>
  );
}

// Sales chart
function SalesChart({ chartData, weeklyTotal }) {
  const maxAmount = Math.max(
    ...chartData.map((item) => item.amount),
    0
  );

  const axisValues = [1, 0.75, 0.5, 0.25, 0];

  const highestDay = chartData.reduce(
    (highest, item) =>
      item.amount > highest.amount ? item : highest,
    { amount: 0, day: '' }
  );

  return (
    <section className="panel chart-panel">
      <div className="panel-header">
        <div>
          <h5>Sales Overview</h5>
          <p>Your sales performance over the last 7 days</p>
        </div>

        <span className="select-btn">Last 7 Days</span>
      </div>

      <div className="chart-summary">
        <h3>{formatCurrency(weeklyTotal)}</h3>

        <span className="growth-badge">
          {weeklyTotal > 0
            ? 'Total sales'
            : 'No sales recorded yet'}
        </span>
      </div>

      <div className="chart">
        <div className="chart-grid">
          {axisValues.map((ratio) => (
            <div className="grid-line" key={ratio}>
              <span>
                {formatCurrency(maxAmount * ratio)}
              </span>
              <div />
            </div>
          ))}
        </div>

        <div className="chart-bars">
          {chartData.map((item) => (
            <div className="chart-column" key={item.day}>
              <div className="bar-track">
                <div
                  className={`chart-bar ${
                    item.day === highestDay.day &&
                    item.amount > 0
                      ? 'highlight'
                      : ''
                  }`}
                  style={{ height: `${item.value}%` }}
                  title={`${item.day}: ${formatCurrency(item.amount)}`}
                />
              </div>

              <span>{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Recent transactions
function Transactions({ sales, onViewAll }) {
  const recentSales = sales.slice(0, 4);

  return (
    <section className="panel transactions-panel">
      <div className="panel-header">
        <div>
          <h5>Recent Transactions</h5>
          <p>Latest billing activity</p>
        </div>

        <button className="text-action" onClick={onViewAll}>
          View all
        </button>
      </div>

      <div className="table-responsive">
        <table className="table transaction-table align-middle">
          <thead>
            <tr>
              <th>INVOICE</th>
              <th>CUSTOMER</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {recentSales.map((sale, index) => (
              <tr key={sale.id ?? index}>
                <td>
                  <strong>{sale.id}</strong>

                  <small>
                    {sale.date &&
                    !Number.isNaN(new Date(sale.date).getTime())
                      ? new Date(sale.date).toLocaleTimeString(
                          'en-IN',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )
                      : '—'}
                  </small>
                </td>

                <td>{sale.customer || 'Walk-in Customer'}</td>

                <td className="amount">
                  {formatCurrency(sale.total)}
                </td>

                <td>
                  <span className="paid-badge">Paid</span>
                </td>
              </tr>
            ))}

            {recentSales.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No transactions yet. Complete your first bill!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Low stock alert
function LowStock({ products, onViewInventory }) {
  const lowStock = products.filter(
    (product) => Number(product.stock) <= 5
  );

  return (
    <section className="panel stock-panel">
      <div className="panel-header">
        <div>
          <h5>Low Stock Alert</h5>
          <p>Products that need restocking</p>
        </div>

        <span className="alert-count">
          {lowStock.length} items
        </span>
      </div>

      <div className="stock-list">
        {lowStock.length === 0 ? (
          <p className="text-secondary p-3">
            All products have sufficient stock.
          </p>
        ) : (
          lowStock.map((item) => (
            <div
              className="stock-item"
              key={item.id ?? item.sku ?? item.name}
            >
              <div className="product-symbol">
                <i className="bi bi-box-seam" />
              </div>

              <div className="stock-product">
                <strong>{item.name}</strong>
                <small>{item.sku}</small>
              </div>

              <div className="stock-quantity">
                <strong>{item.stock} left</strong>

                <div className="stock-track">
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(Number(item.stock) * 10, 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="restock-btn"
        onClick={onViewInventory}
      >
        View all inventory
        <i className="bi bi-arrow-right ms-2" />
      </button>
    </section>
  );
}

// Main App
export default function App() {
  const [sales, setSales] = useState([]);
  const [activePage, setActivePage] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState(initialProducts);

  // Today's date
  const today = new Date();

  // Check whether a sale happened today
  const isToday = (dateValue) => {
    if (!dateValue) return false;

    const date = new Date(dateValue);

    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // Today's sales
  const todaySales = sales.filter((sale) => isToday(sale.date));

  // Today's revenue
  const todayRevenue = todaySales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0
  );

  // Products with 5 or fewer items
  const lowStockProducts = products.filter(
    (product) => Number(product.stock) <= 5
  );

  // Sales for the last 7 calendar days
  const chartDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();

    date.setDate(date.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);

    const daySales = sales.filter((sale) => {
      const saleDate = new Date(sale.date);

      return (
        !Number.isNaN(saleDate.getTime()) &&
        saleDate.getFullYear() === date.getFullYear() &&
        saleDate.getMonth() === date.getMonth() &&
        saleDate.getDate() === date.getDate()
      );
    });

    const amount = daySales.reduce(
      (sum, sale) => sum + Number(sale.total || 0),
      0
    );

    return {
      day: date.toLocaleDateString('en-IN', {
        weekday: 'short',
      }),
      amount,
    };
  });

  // Total sales across the last 7 days
  const weeklyTotal = chartDays.reduce(
    (sum, day) => sum + day.amount,
    0
  );

  // Scale chart bars against the busiest day
  const maxDailySales = Math.max(
    ...chartDays.map((day) => day.amount),
    1
  );

  const chartData = chartDays.map((day) => ({
    ...day,
    value: (day.amount / maxDailySales) * 100,
  }));

  // Dynamic dashboard cards
  const dashboardStats = [
    {
      title: "Today's Sales",
      value: formatCurrency(todayRevenue),
      change: `${todaySales.length} bills today`,
      icon: 'bi-currency-rupee',
      color: 'blue',
    },
    {
      title: 'Total Bills',
      value: sales.length.toLocaleString('en-IN'),
      change: 'Completed transactions',
      icon: 'bi-receipt-cutoff',
      color: 'green',
    },
    {
      title: 'Total Products',
      value: products.length.toLocaleString('en-IN'),
      change: 'In inventory',
      icon: 'bi-box-seam',
      color: 'purple',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.length.toLocaleString('en-IN'),
      change: 'Needs attention',
      icon: 'bi-exclamation-triangle',
      color: 'orange',
    },
  ];

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
        lowStockCount={lowStockProducts.length}
      />

      <main className="main-content">
        <Header
          activePage={activePage}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {activePage === 'POS Billing' ? (
          <Billing
            products={products}
            setProducts={setProducts}
            onSaleCompleted={(sale) =>
              setSales((currentSales) => [sale, ...currentSales])
            }
          />
        ) : activePage === 'Products' ? (
          <Inventory
            products={products}
            setProducts={setProducts}
          />
        ) : activePage === 'Sales History' ? (
          <SalesHistory sales={sales} />
        ) : (
          <div className="dashboard-content">
            <div className="page-intro">
              <div>
                <h2>Store Dashboard</h2>
                <p>
                  Here's what's happening with your store today.
                </p>
              </div>

              <button
                className="primary-btn"
                onClick={() => setActivePage('POS Billing')}
              >
                <i className="bi bi-plus-lg me-2" />
                New Bill
              </button>
            </div>

            <div className="stats-grid">
              {dashboardStats.map((stat) => (
                <StatCard key={stat.title} stat={stat} />
              ))}
            </div>

            <div className="dashboard-grid">
              <SalesChart
                chartData={chartData}
                weeklyTotal={weeklyTotal}
              />

              <LowStock
                products={products}
                onViewInventory={() => setActivePage('Products')}
              />
            </div>

            <Transactions
              sales={sales}
              onViewAll={() => setActivePage('Sales History')}
            />

            <footer className="dashboard-footer">
              <span>© 2026 MallMate POS</span>
              <span>Smart Retail Management</span>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}
