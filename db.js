/* ============================================================
   QuickBite — the dataset behind every lesson.
   A small fictional food-delivery app. 4 tables, ~50 orders.
   This same SQL seeds the in-browser database on every "Run".
   ============================================================ */

const SEED_SQL = `
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS customers;

-- ---------- categories ----------
CREATE TABLE categories (
  category_id   INTEGER PRIMARY KEY,
  category_name TEXT
);
INSERT INTO categories (category_id, category_name) VALUES
(1, 'Beverages'),
(2, 'Desserts'),
(3, 'Main Course'),
(4, 'Snacks'),
(5, 'Salads');

-- ---------- products (the menu) ----------
-- size is intentionally NULL for many items (good for NULL practice).
CREATE TABLE products (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT,
  category_id  INTEGER,
  price        REAL,
  size         TEXT
);
INSERT INTO products (product_id, product_name, category_id, price, size) VALUES
(101, 'Cappuccino',         1, 4.50, 'Medium'),
(102, 'Iced Latte',         1, 5.00, 'Large'),
(103, 'Green Tea',          1, 3.50, NULL),
(104, 'Mango Smoothie',     1, 6.00, 'Large'),
(201, 'Chocolate Brownie',  2, 4.00, NULL),
(202, 'Cheesecake Slice',   2, 5.50, NULL),
(203, 'Tiramisu',           2, 6.50, NULL),
(301, 'Margherita Pizza',   3, 9.00, 'Regular'),
(302, 'Chicken Burger',     3, 8.50, NULL),
(303, 'Veg Pasta',          3, 7.50, NULL),
(304, 'Paneer Wrap',        3, 6.50, NULL),
(401, 'French Fries',       4, 3.50, 'Medium'),
(402, 'Garlic Bread',       4, 4.00, NULL),
(501, 'Caesar Salad',       5, 6.00, NULL),
(502, 'Greek Salad',        5, 6.50, NULL);   -- never ordered (on purpose)

-- ---------- customers ----------
-- referred_by points to another customer_id (NULL = signed up on their own).
-- customers 11 & 12 have placed NO orders (on purpose).
CREATE TABLE customers (
  customer_id   INTEGER PRIMARY KEY,
  first_name    TEXT,
  last_name     TEXT,
  city          TEXT,
  signup_date   TEXT,
  referred_by   INTEGER
);
INSERT INTO customers (customer_id, first_name, last_name, city, signup_date, referred_by) VALUES
(1,  'Aarav',  'Sharma', 'Bengaluru', '2023-11-05', NULL),
(2,  'Priya',  'Nair',   'Mumbai',    '2023-12-01', 1),
(3,  'Rohan',  'Mehta',  'Delhi',     '2024-01-10', 1),
(4,  'Ananya', 'Iyer',   'Bengaluru', '2024-01-15', 2),
(5,  'Karan',  'Gupta',  'Pune',      '2024-02-02', NULL),
(6,  'Sara',   'Khan',   'Hyderabad', '2024-02-10', 3),
(7,  'Vikram', 'Singh',  'Delhi',     '2024-02-20', NULL),
(8,  'Meera',  'Reddy',  'Hyderabad', '2024-03-01', 5),
(9,  'Arjun',  'Patel',  'Mumbai',    '2024-03-05', 2),
(10, 'Diya',   'Joshi',  'Bengaluru', '2024-03-12', NULL),
(11, 'Kabir',  'Das',    'Pune',      '2024-03-20', 7),
(12, 'Tara',   'Bose',   'Kolkata',   '2024-03-25', NULL);

-- ---------- orders (one row per item ordered) ----------
-- revenue for a row = quantity * unit_price
CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER,
  product_id  INTEGER,
  quantity    INTEGER,
  unit_price  REAL,
  order_date  TEXT,
  order_time  TEXT
);
INSERT INTO orders (order_id, customer_id, product_id, quantity, unit_price, order_date, order_time) VALUES
(1,  1, 101, 2, 4.50, '2024-01-12', '09:15:00'),
(2,  1, 201, 1, 4.00, '2024-01-12', '09:15:00'),
(3,  2, 301, 1, 9.00, '2024-01-15', '13:05:00'),
(4,  3, 102, 3, 5.00, '2024-01-18', '17:40:00'),
(5,  2, 401, 2, 3.50, '2024-01-20', '12:30:00'),
(6,  4, 202, 1, 5.50, '2024-01-22', '16:10:00'),
(7,  1, 302, 1, 8.50, '2024-01-25', '19:20:00'),
(8,  3, 104, 2, 6.00, '2024-01-28', '11:00:00'),
(9,  5, 301, 2, 9.00, '2024-02-02', '13:30:00'),
(10, 2, 203, 1, 6.50, '2024-02-05', '20:00:00'),
(11, 6, 101, 1, 4.50, '2024-02-08', '08:45:00'),
(12, 4, 303, 2, 7.50, '2024-02-10', '18:15:00'),
(13, 1, 102, 1, 5.00, '2024-02-12', '10:20:00'),
(14, 7, 302, 1, 8.50, '2024-02-14', '19:45:00'),
(15, 5, 401, 6, 3.50, '2024-02-14', '12:10:00'),
(16, 3, 201, 2, 4.00, '2024-02-16', '15:30:00'),
(17, 6, 104, 1, 6.00, '2024-02-18', '11:50:00'),
(18, 2, 301, 1, 9.00, '2024-02-20', '13:00:00'),
(19, 8, 202, 1, 5.50, '2024-02-22', '16:40:00'),
(20, 4, 101, 3, 4.50, '2024-02-25', '09:30:00'),
(21, 9, 303, 1, 7.50, '2024-02-26', '18:50:00'),
(22, 1, 401, 4, 3.50, '2024-02-28', '12:45:00'),
(23, 5, 301, 1, 9.00, '2024-03-01', '13:20:00'),
(24, 10, 102, 2, 5.00, '2024-03-03', '17:10:00'),
(25, 6, 203, 1, 6.50, '2024-03-05', '20:15:00'),
(26, 2, 304, 2, 6.50, '2024-03-06', '12:55:00'),
(27, 3, 302, 1, 8.50, '2024-03-08', '19:30:00'),
(28, 7, 101, 2, 4.50, '2024-03-10', '08:30:00'),
(29, 8, 301, 3, 9.00, '2024-03-12', '13:45:00'),
(30, 1, 202, 1, 5.50, '2024-03-14', '16:00:00'),
(31, 9, 104, 2, 6.00, '2024-03-15', '11:20:00'),
(32, 5, 401, 2, 3.50, '2024-03-16', '12:35:00'),
(33, 4, 303, 1, 7.50, '2024-03-18', '18:40:00'),
(34, 10, 301, 1, 9.00, '2024-03-18', '13:10:00'),
(35, 6, 102, 1, 5.00, '2024-03-20', '10:05:00'),
(36, 2, 201, 3, 4.00, '2024-03-20', '15:15:00'),
(37, 3, 501, 1, 6.00, '2024-03-22', '12:25:00'),
(38, 1, 301, 2, 9.00, '2024-03-24', '13:55:00'),
(39, 8, 104, 1, 6.00, '2024-03-25', '11:40:00'),
(40, 5, 302, 1, 8.50, '2024-03-26', '19:10:00'),
(41, 9, 401, 7, 3.50, '2024-03-28', '12:00:00'),
(42, 10, 202, 2, 5.50, '2024-03-29', '16:30:00'),
(43, 1, 102, 1, 5.00, '2024-04-01', '10:10:00'),
(44, 2, 301, 2, 9.00, '2024-04-02', '13:35:00'),
(45, 3, 303, 1, 7.50, '2024-04-03', '18:25:00'),
(46, 5, 101, 3, 4.50, '2024-04-04', '09:00:00'),
(47, 6, 501, 1, 6.00, '2024-04-05', '12:40:00'),
(48, 4, 104, 2, 6.00, '2024-04-06', '11:15:00'),
(49, 8, 301, 1, 9.00, '2024-04-08', '13:50:00'),
(50, 1, 401, 2, 3.50, '2024-04-10', '12:20:00'),
(51, 7, 103, 1, 3.50, '2024-03-30', '15:00:00');
`;

if (typeof module !== 'undefined' && module.exports) { module.exports = { SEED_SQL }; }
if (typeof window !== 'undefined') { window.SEED_SQL = SEED_SQL; }
