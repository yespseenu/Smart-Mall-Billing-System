
import { useState } from 'react';

export default function SalesHistory({ sales = [] }) {
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const formatCurrency = (amount = 0) =>
    `₹${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const filteredSales = sales.filter((sale) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      String(sale.id ?? '').toLowerCase().includes(searchText) ||
      String(sale.customer || 'Walk-in Customer')
        .toLowerCase()
        .includes(searchText);

    const matchesPayment =
      paymentFilter === 'All' ||
      String(sale.paymentMethod || '').toLowerCase() ===
        paymentFilter.toLowerCase();

    return matchesSearch && matchesPayment;
  });

  const totalSales = sales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0
  );

  const averageBill = sales.length ? totalSales / sales.length : 0;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Sales History</h2>
          <p className="text-secondary mb-0">
            Review your completed sales and transactions.
          </p>
        </div>

        <span className="badge text-bg-success fs-6">
          {sales.length} Transactions
        </span>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-secondary mb-2">Total Sales</p>
              <h3 className="fw-bold mb-0">
                {formatCurrency(totalSales)}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-secondary mb-2">Completed Bills</p>
              <h3 className="fw-bold mb-0">{sales.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-secondary mb-2">Average Bill Value</p>
              <h3 className="fw-bold mb-0">
                {formatCurrency(averageBill)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <input
                type="search"
                className="form-control"
                placeholder="Search by invoice ID or customer..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={paymentFilter}
                onChange={(event) =>
                  setPaymentFilter(event.target.value)
                }
              >
                <option value="All">All Payment Methods</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale, index) => (
                  <tr key={sale.id ?? index}>
                    <td className="fw-semibold">
                      {String(sale.id ?? 'N/A')}
                    </td>

                    <td>
                      {sale.date
                        ? new Date(sale.date).toLocaleString('en-IN')
                        : '—'}
                    </td>

                    <td>{sale.customer || 'Walk-in Customer'}</td>

                    <td>{Array.isArray(sale.items) ? sale.items.length : 0}</td>

                    <td>{sale.paymentMethod || '—'}</td>

                    <td className="fw-semibold">
                      {formatCurrency(sale.total)}
                    </td>

                    <td>
                      <span className="badge text-bg-success">
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="mb-2">
                        <i className="bi bi-receipt fs-2 text-secondary" />
                      </div>

                      <h6 className="fw-semibold">
                        {sales.length === 0
                          ? 'No sales yet'
                          : 'No matching transactions'}
                      </h6>

                      <p className="text-secondary mb-0">
                        {sales.length === 0
                          ? 'Complete a bill in POS Billing to see it here.'
                          : 'Try a different search or payment filter.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
