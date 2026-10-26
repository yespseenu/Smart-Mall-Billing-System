# Smart-Mall-Billing-System
Product billing, cart management, checkout, inventory tracking, and sales dashboard.
MallMate POS
MallMate POS is a React-based demo point-of-sale (POS) and inventory
management application for a small retail store. It brings product
management, billing, sales history, and a sales dashboard together in
one interface.
Project status: Demo application. Sales and inventory changes are
currently held in React state and are not saved permanently.
Refreshing the browser resets the current session's sales and stock
changes.

Features
- Dashboard
  - Today's sales revenue and bill count
  - Total number of products
  - Low-stock product count
  - Seven-day sales overview
  - Recent transactions
- POS Billing
  - Search products by name or SKU
  - Filter products by category
  - Add products to a cart and change quantities
  - Enter an optional customer name
  - Apply a percentage discount
  - Calculate a demo 5% GST
  - Select UPI, cash, or card as the payment method
  - Generate and print a demo receipt
- Inventory
  - View and manage products
  - Share product state with POS Billing
  - Update stock when a sale is completed
- Sales History
  - View completed bills recorded during the current session
- Responsive navigation
  - Dashboard, POS Billing, Products, and Sales History sections
Technology Stack
- React
- JavaScript (ES modules)
- Vite (development server/build tool, if used by the project setup)
- Bootstrap utility classes and Bootstrap Icons (for interface
  styling/icons)
Getting Started
1. Install dependencies
Open a terminal in the project folder and run:
npm install
2. Start the development server
npm run dev
Open the local URL printed in the terminal by Vite.
3. Build for production
npm run build
To preview a production build locally:
npm run preview
Main Project Structure
The following is the structure referenced by the current application
code. Other files may exist in your project.
src/
├── App.jsx
├── data/
│   └── products.js
└── pages/
    ├── Billing.jsx
    ├── Inventory.jsx
    └── SalesHistory.jsx
- src/App.jsx --- application navigation, shared React state,
  dashboard statistics, chart, recent transactions, and low-stock
  alerts.
- src/data/products.js --- initial product data.
- src/pages/Billing.jsx --- product catalog, cart, checkout
  calculations, stock updates, and demo receipt.
- src/pages/Inventory.jsx --- product inventory interface.
- src/pages/SalesHistory.jsx --- completed sales list.
How the Main Flow Works
1. The app initializes the product list from initialProducts.
2. POS Billing receives the shared products state and its setter.
3. When a sale is completed, Billing creates a bill object and calls
   onSaleCompleted.
4. App.jsx adds the bill to the sales state.
5. Billing decreases the stock quantities of the sold products.
6. The Dashboard calculates its sales cards, recent transactions,
   chart, and low-stock alerts from the current React state.
Current Limitations
- No persistent storage yet: refreshing the page resets session
  sales and stock edits.
- Demo tax calculation: the checkout uses a fixed 5% GST example.
  It is not a tax-compliance calculation.
- Demo payments: selecting UPI, cash, or card records the chosen
  method only; no real payment is processed.
- Sales comparison: the dashboard currently shows the total for
  the last seven calendar days, not a verified growth percentage
  against a previous period.
- Session-only sales history: completed bills are available while
  the current app session is running.
Planned Improvements
- Add localStorage persistence for products and sales.
- Validate dashboard totals and date handling with additional tests.
- Add edit/delete and restocking workflows where required.
- Improve receipt and sales-history reporting.
- Add automated tests for billing totals, discounts, stock changes,
  and date-based dashboard calculations.
Development Notes
- Keep product data shared between Inventory and POS Billing through
  React state.
- Store sale dates in a consistent format, such as
  new Date().toISOString(), and format them for display separately.
- Test the full flow by completing a bill, checking the stock
  reduction, and verifying that the dashboard and Sales History
  update.
Built as a retail POS demo project with React.
