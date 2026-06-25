/* ============================================================
   LESSONS — the full QuickBite SQL course.
   Each lesson: { id, title, body(HTML), examples[], exercises[] }
   examples:  { label, sql, note? }
   exercises: { prompt, solution, hint?, orderMatters? }
   ============================================================ */

const LESSONS = [

/* =========================================================================
   MODULE 0 — START HERE
   ========================================================================= */
{
  id: "intro",
  title: "Start here",
  blurb: "What SQL is, and the dataset you'll query.",
  lessons: [
    {
      id: "what-is-sql",
      title: "What is SQL (and a database)?",
      body: `
        <p>A <strong>database</strong> is just a set of tables. A <strong>table</strong> is a grid: columns are the fields (like "price"), rows are the records (one row = one thing). If you've ever used a spreadsheet, you already know what a table looks like.</p>
        <p><strong>SQL</strong> (say it "sequel" or "S-Q-L") is the language you use to <em>ask the database questions</em>. You don't tell it <em>how</em> to find the answer step by step — you describe <em>what</em> you want, and the database figures out the rest.</p>
        <p>Almost every query you'll ever write starts with one word: <code>SELECT</code> — "select these columns from this table." That's it. Everything else in this course is just adding filters, math, grouping, and combining tables on top of that one idea.</p>
        <div class="callout tip"><strong>How this site works:</strong> Every lesson has runnable examples and a "Your turn" box. Type a query, press <strong>Run</strong> (or Ctrl/Cmd+Enter), and you'll see the real result table. For exercises, the site checks your answer against the correct result and tells you if it matches. Nothing you type can break anything — the database resets itself on every run.</div>
      `,
      examples: [
        { label: "Your very first query — show everything in the customers table", sql: "SELECT *\nFROM customers;", note: "The * means \"all columns\". Run it to meet the 12 customers you'll be working with." }
      ],
      exercises: [
        { prompt: "Show every column and every row from the products table.", solution: "SELECT * FROM products;", hint: "Use SELECT * FROM <table name>;", orderMatters: false }
      ]
    },
    {
      id: "the-dataset",
      title: "Meet the dataset: QuickBite",
      body: `
        <p>Everything you query in this course comes from <strong>QuickBite</strong>, a small (fictional) food-delivery app. There are four tables. Click <strong>Tables</strong> in the top bar any time to inspect them.</p>
        <p><strong>customers</strong> — people who use the app.<br>
        Columns: <code>customer_id</code>, <code>first_name</code>, <code>last_name</code>, <code>city</code>, <code>signup_date</code>, <code>referred_by</code> (the id of the customer who referred them, or empty).</p>
        <p><strong>categories</strong> — menu sections.<br>
        Columns: <code>category_id</code>, <code>category_name</code> (Beverages, Desserts, Main Course, Snacks, Salads).</p>
        <p><strong>products</strong> — the menu items.<br>
        Columns: <code>product_id</code>, <code>product_name</code>, <code>category_id</code>, <code>price</code>, <code>size</code> (often empty).</p>
        <p><strong>orders</strong> — the heart of the data. One row = one item someone ordered.<br>
        Columns: <code>order_id</code>, <code>customer_id</code>, <code>product_id</code>, <code>quantity</code>, <code>unit_price</code>, <code>order_date</code>, <code>order_time</code>.</p>
        <div class="callout tip"><strong>The key idea — how tables connect.</strong> The same id appears in more than one table. An <code>orders</code> row stores a <code>customer_id</code> and a <code>product_id</code>; to get the customer's name or the product's name you look those ids up in <code>customers</code> / <code>products</code>. That look-up is called a <strong>join</strong> (Module 5). For now, just notice the shared columns: <code>customer_id</code> links orders↔customers, <code>product_id</code> links orders↔products, and <code>category_id</code> links products↔categories.</div>
        <p>Money in this dataset works like this: a single order row's revenue is <code>quantity &times; unit_price</code>. You'll compute that constantly.</p>
      `,
      examples: [
        { label: "Peek at the menu (products)", sql: "SELECT *\nFROM products;" },
        { label: "Peek at orders — notice it stores ids, not names", sql: "SELECT *\nFROM orders\nLIMIT 10;", note: "To turn product_id into a product name, you'll join to products later." },
        { label: "Peek at categories", sql: "SELECT *\nFROM categories;" }
      ],
      exercises: [
        { prompt: "Show all rows from the categories table.", solution: "SELECT * FROM categories;", hint: "Same pattern as before.", orderMatters: false }
      ]
    }
  ]
},

/* =========================================================================
   MODULE 1 — SELECT BASICS
   ========================================================================= */
{
  id: "select-basics",
  title: "1 · SELECT basics",
  blurb: "Choose columns, rename, sort, limit, and do math.",
  lessons: [
    {
      id: "select-columns",
      title: "Selecting columns",
      body: `
        <p><code>SELECT *</code> returns every column. Most of the time you only want a few, so you <em>list the column names</em> instead, separated by commas. This is faster to read and faster for the database.</p>
        <p>Pattern:</p>
        <p><code>SELECT column_a, column_b<br>FROM table_name;</code></p>
        <p>The order you list columns is the order they appear in the result. So you control the layout, not the table.</p>
      `,
      examples: [
        { label: "All columns (the wide view)", sql: "SELECT *\nFROM customers;" },
        { label: "Just the columns you care about", sql: "SELECT first_name, city\nFROM customers;", note: "Two columns, in the order you asked for them." },
        { label: "From orders: who bought how much of what", sql: "SELECT customer_id, product_id, quantity\nFROM orders\nLIMIT 5;" }
      ],
      exercises: [
        { prompt: "From customers, return only first_name and last_name (in that order).", solution: "SELECT first_name, last_name FROM customers;", hint: "List the two columns separated by a comma.", orderMatters: false }
      ]
    },
    {
      id: "aliases",
      title: "Renaming columns with AS (aliases)",
      body: `
        <p>An <strong>alias</strong> is a temporary nickname for a column in the output. You give it with the keyword <code>AS</code>. The underlying data doesn't change — only the header you see does. This is mostly used to make calculated columns (next lesson) readable.</p>
        <p>Pattern: <code>SELECT column AS nickname FROM table;</code></p>
        <p>If your nickname has a space, wrap it in double quotes: <code>AS "Full Name"</code>. The word <code>AS</code> is optional in most databases (you can write <code>price p</code>) but spelling it out is clearer.</p>
      `,
      examples: [
        { label: "Rename a column in the output", sql: "SELECT first_name AS name, city AS lives_in\nFROM customers;", note: "Headers now read 'name' and 'lives_in'." },
        { label: "Alias with a space (needs quotes)", sql: "SELECT product_name AS \"Item Name\", price AS \"Price (USD)\"\nFROM products;" }
      ],
      exercises: [
        { prompt: "From products, show product_name aliased as item and price aliased as cost.", solution: "SELECT product_name AS item, price AS cost FROM products;", hint: "Use AS after each column.", orderMatters: false }
      ]
    },
    {
      id: "calculated",
      title: "Calculated columns (do math in SELECT)",
      body: `
        <p>You can create brand-new columns by doing arithmetic on existing ones, right inside <code>SELECT</code>. Use <code>+</code> <code>-</code> <code>*</code> <code>/</code>. Always give the result an alias so the header makes sense.</p>
        <p>The classic one in this dataset: revenue of an order row is quantity times unit price.</p>
        <p><code>SELECT quantity * unit_price AS revenue FROM orders;</code></p>
        <p>The new column is computed per row — the database multiplies the two values on each row to make the third.</p>
      `,
      examples: [
        { label: "Revenue per order row", sql: "SELECT customer_id,\n       quantity,\n       unit_price,\n       quantity * unit_price AS revenue\nFROM orders\nLIMIT 8;", note: "revenue is calculated; it isn't stored anywhere." }
      ],
      exercises: [
        { prompt: "From orders, return product_id, quantity, unit_price, and a calculated column called line_total equal to quantity multiplied by unit_price.", solution: "SELECT product_id, quantity, unit_price, quantity * unit_price AS line_total FROM orders;", hint: "quantity * unit_price AS line_total", orderMatters: false }
      ]
    },
    {
      id: "round",
      title: "ROUND — tidy up decimals",
      body: `
        <p>Math often produces long decimals. <code>ROUND(value, places)</code> rounds a number to the number of decimal places you give. Money usually wants 2.</p>
        <p>Pattern: <code>ROUND(quantity * unit_price, 2)</code> → e.g. 13.5 instead of 13.500000001.</p>
        <p>You wrap <code>ROUND(...)</code> around any number expression. Leave off the second argument to round to a whole number.</p>
      `,
      examples: [
        { label: "Round revenue to 2 decimals", sql: "SELECT customer_id,\n       ROUND(quantity * unit_price, 2) AS revenue\nFROM orders\nLIMIT 8;" },
        { label: "Round to a whole number", sql: "SELECT product_name,\n       ROUND(price, 0) AS price_rounded\nFROM products;" }
      ],
      exercises: [
        { prompt: "From orders, return order_id and a column revenue = quantity * unit_price, rounded to 1 decimal place.", solution: "SELECT order_id, ROUND(quantity * unit_price, 1) AS revenue FROM orders;", hint: "Wrap the multiplication in ROUND(..., 1).", orderMatters: false }
      ]
    },
    {
      id: "distinct",
      title: "DISTINCT — unique values only",
      body: `
        <p><code>SELECT DISTINCT</code> removes duplicate rows from the result, leaving one of each. Great for answering "what are the unique values in this column?"</p>
        <p>Pattern: <code>SELECT DISTINCT city FROM customers;</code> → each city once, even though several customers share a city.</p>
        <p>If you list multiple columns, DISTINCT applies to the whole combination (unique <em>rows</em>, not unique values per column).</p>
      `,
      examples: [
        { label: "Every city our customers live in, once each", sql: "SELECT DISTINCT city\nFROM customers;" },
        { label: "Without DISTINCT you'd see repeats", sql: "SELECT city\nFROM customers;", note: "Compare this to the example above — same column, duplicates included." },
        { label: "Unique combinations of (customer_id, product_id) that were ordered", sql: "SELECT DISTINCT customer_id, product_id\nFROM orders;" }
      ],
      exercises: [
        { prompt: "Return the distinct list of product_id values that appear in the orders table.", solution: "SELECT DISTINCT product_id FROM orders;", hint: "SELECT DISTINCT product_id ...", orderMatters: false }
      ]
    },
    {
      id: "limit",
      title: "LIMIT — only the first N rows",
      body: `
        <p><code>LIMIT n</code> returns at most <em>n</em> rows. It's the easiest way to take a quick look at a big table without printing everything, and it's essential for "top 10" style questions (combined with sorting, next).</p>
        <p>Pattern: <code>SELECT * FROM orders LIMIT 5;</code></p>
        <div class="callout dialect"><strong>Dialect note:</strong> SQLite (this site) and most databases use <code>LIMIT</code>. SQL Server uses <code>SELECT TOP 5 ...</code> instead. Same idea, different keyword.</div>
      `,
      examples: [
        { label: "First 5 orders", sql: "SELECT *\nFROM orders\nLIMIT 5;" }
      ],
      exercises: [
        { prompt: "Return the first 3 rows of the customers table (all columns).", solution: "SELECT * FROM customers LIMIT 3;", hint: "Add LIMIT 3 to the end.", orderMatters: true }
      ]
    },
    {
      id: "order-by",
      title: "ORDER BY — sorting results",
      body: `
        <p><code>ORDER BY</code> sorts the rows. Add <code>DESC</code> for high-to-low (descending); the default is <code>ASC</code>, low-to-high. Text sorts alphabetically; numbers numerically; dates chronologically.</p>
        <p>Sort by several columns by separating them with commas — the first column is the primary sort, the next breaks ties, and so on.</p>
        <p><code>ORDER BY order_date DESC, order_time DESC</code> → newest day first, and within a day the latest time first.</p>
        <p><strong>Top-N trick:</strong> <code>ORDER BY ... DESC</code> then <code>LIMIT n</code> gives you the top n of anything (most expensive products, biggest orders, etc.).</p>
      `,
      examples: [
        { label: "Cheapest products first", sql: "SELECT product_name, price\nFROM products\nORDER BY price ASC;" },
        { label: "Most expensive 3 products (sort + limit)", sql: "SELECT product_name, price\nFROM products\nORDER BY price DESC\nLIMIT 3;" },
        { label: "Newest orders first, ties broken by time", sql: "SELECT order_id, order_date, order_time\nFROM orders\nORDER BY order_date DESC, order_time DESC\nLIMIT 5;" }
      ],
      exercises: [
        { prompt: "Return the 5 most expensive products: show product_name and price, highest price first.", solution: "SELECT product_name, price FROM products ORDER BY price DESC LIMIT 5;", hint: "ORDER BY price DESC, then LIMIT 5.", orderMatters: true }
      ]
    }
  ]
},

/* =========================================================================
   MODULE 2 — FILTERING (WHERE)
   ========================================================================= */
{
  id: "filtering",
  title: "2 · Filtering with WHERE",
  blurb: "Keep only the rows you want.",
  lessons: [
    {
      id: "where-basics",
      title: "WHERE and comparison operators",
      body: `
        <p><code>WHERE</code> keeps only rows that match a condition. It goes after <code>FROM</code> and before <code>ORDER BY</code>.</p>
        <p>Comparison operators: <code>=</code> (equals), <code>!=</code> or <code>&lt;&gt;</code> (not equal), <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>.</p>
        <p><code>SELECT * FROM products WHERE price &gt; 6;</code> → only products costing more than 6.</p>
        <div class="callout tip"><strong>Text needs single quotes:</strong> <code>WHERE city = 'Mumbai'</code>. Numbers don't: <code>WHERE price &gt; 6</code>. Use single quotes for text values, never double.</div>
      `,
      examples: [
        { label: "Customers in Bengaluru", sql: "SELECT first_name, city\nFROM customers\nWHERE city = 'Bengaluru';" },
        { label: "Products costing more than 6", sql: "SELECT product_name, price\nFROM products\nWHERE price > 6;" },
        { label: "Everything that is NOT a main course (category 3)", sql: "SELECT product_name, category_id\nFROM products\nWHERE category_id != 3;" }
      ],
      exercises: [
        { prompt: "From orders, return all columns where the quantity is greater than 2.", solution: "SELECT * FROM orders WHERE quantity > 2;", hint: "WHERE quantity > 2", orderMatters: false }
      ]
    },
    {
      id: "and-or-not",
      title: "Combining conditions: AND, OR, NOT",
      body: `
        <p>Chain conditions with <code>AND</code> (both must be true) and <code>OR</code> (either is enough). <code>NOT</code> flips a condition.</p>
        <p><code>WHERE price &gt; 5 AND category_id = 3</code> → main courses over 5.<br>
        <code>WHERE city = 'Delhi' OR city = 'Pune'</code> → in either city.</p>
        <div class="callout warn"><strong>Use parentheses when you mix AND and OR.</strong> <code>WHERE a OR b AND c</code> is read as <code>a OR (b AND c)</code> — probably not what you meant. Be explicit: <code>WHERE (a OR b) AND c</code>.</div>
      `,
      examples: [
        { label: "Main courses (category 3) over 7", sql: "SELECT product_name, price, category_id\nFROM products\nWHERE category_id = 3 AND price > 7;" },
        { label: "Customers in Delhi or Pune", sql: "SELECT first_name, city\nFROM customers\nWHERE city = 'Delhi' OR city = 'Pune';" },
        { label: "Parentheses change the meaning", sql: "SELECT product_name, price, category_id\nFROM products\nWHERE (category_id = 1 OR category_id = 2) AND price > 5;", note: "Beverages or desserts, AND over 5." }
      ],
      exercises: [
        { prompt: "From orders, return rows where quantity is at least 2 AND unit_price is below 5. Return all columns.", solution: "SELECT * FROM orders WHERE quantity >= 2 AND unit_price < 5;", hint: "Combine two conditions with AND.", orderMatters: false }
      ]
    },
    {
      id: "in",
      title: "IN and NOT IN — match a list",
      body: `
        <p>When you'd otherwise write <code>x = 1 OR x = 2 OR x = 3</code>, use <code>IN</code> instead: <code>WHERE x IN (1, 2, 3)</code>. Cleaner and identical in meaning. <code>NOT IN</code> excludes a list.</p>
        <p>Works for text too: <code>WHERE city IN ('Delhi', 'Pune')</code>.</p>
      `,
      examples: [
        { label: "Orders for a set of products", sql: "SELECT order_id, product_id, quantity\nFROM orders\nWHERE product_id IN (101, 102, 104);" },
        { label: "Customers NOT in the big metros", sql: "SELECT first_name, city\nFROM customers\nWHERE city NOT IN ('Mumbai', 'Delhi', 'Bengaluru');" }
      ],
      exercises: [
        { prompt: "From products, return product_name and category_id for products in categories 2, 4, or 5.", solution: "SELECT product_name, category_id FROM products WHERE category_id IN (2, 4, 5);", hint: "WHERE category_id IN (2, 4, 5)", orderMatters: false }
      ]
    },
    {
      id: "between",
      title: "BETWEEN — ranges (and dates)",
      body: `
        <p><code>BETWEEN a AND b</code> matches values from <em>a</em> to <em>b</em>, <strong>inclusive of both ends</strong>. It's shorthand for <code>x &gt;= a AND x &lt;= b</code>.</p>
        <p>It works for numbers and for dates. Dates are written as text in the form <code>'YYYY-MM-DD'</code>.</p>
        <p><code>WHERE order_date BETWEEN '2024-02-01' AND '2024-02-29'</code> → all of February 2024.</p>
      `,
      examples: [
        { label: "Products priced 4 to 6", sql: "SELECT product_name, price\nFROM products\nWHERE price BETWEEN 4 AND 6;" },
        { label: "All orders in February 2024", sql: "SELECT order_id, order_date\nFROM orders\nWHERE order_date BETWEEN '2024-02-01' AND '2024-02-29'\nORDER BY order_date;" }
      ],
      exercises: [
        { prompt: "Return order_id and order_date for orders placed between 2024-03-01 and 2024-03-15 (inclusive).", solution: "SELECT order_id, order_date FROM orders WHERE order_date BETWEEN '2024-03-01' AND '2024-03-15';", hint: "BETWEEN '2024-03-01' AND '2024-03-15'", orderMatters: false }
      ]
    },
    {
      id: "like",
      title: "LIKE — pattern matching on text",
      body: `
        <p><code>LIKE</code> matches text patterns using two wildcards:</p>
        <ul>
          <li><code>%</code> = any number of characters (including none)</li>
          <li><code>_</code> = exactly one character</li>
        </ul>
        <p>So <code>'A%'</code> = starts with A; <code>'%a'</code> = ends with a; <code>'%an%'</code> = contains "an" anywhere.</p>
        <div class="callout tip"><strong>Case sensitivity:</strong> to match regardless of capitals, lowercase the column first: <code>WHERE LOWER(first_name) LIKE 'a%'</code>. (In SQLite, LIKE is already case-insensitive for plain ASCII letters, but using LOWER is a habit that works everywhere.)</div>
      `,
      examples: [
        { label: "Names that start with A", sql: "SELECT first_name\nFROM customers\nWHERE first_name LIKE 'A%';", note: "Matches Aarav, Ananya, Arjun." },
        { label: "Names containing 'ar' anywhere", sql: "SELECT first_name\nFROM customers\nWHERE LOWER(first_name) LIKE '%ar%';" },
        { label: "Products with 'Salad' in the name", sql: "SELECT product_name\nFROM products\nWHERE product_name LIKE '%Salad%';" }
      ],
      exercises: [
        { prompt: "You think a customer's name starts with 'Ro'. Return first_name for all customers whose first_name starts with 'Ro'.", solution: "SELECT first_name FROM customers WHERE first_name LIKE 'Ro%';", hint: "LIKE 'Ro%'", orderMatters: false }
      ]
    },
    {
      id: "null-checks",
      title: "IS NULL / IS NOT NULL",
      body: `
        <p><code>NULL</code> means "no value / unknown" — an empty cell. It is <em>not</em> zero and not an empty string. Because NULL is "unknown", you can't test it with <code>=</code>. <code>WHERE size = NULL</code> never matches anything. Instead use:</p>
        <ul>
          <li><code>IS NULL</code> — the cell is empty</li>
          <li><code>IS NOT NULL</code> — the cell has a value</li>
        </ul>
        <p>In QuickBite, many products have an empty <code>size</code>, and some customers have an empty <code>referred_by</code>.</p>
      `,
      examples: [
        { label: "Products with no size recorded", sql: "SELECT product_name, size\nFROM products\nWHERE size IS NULL;" },
        { label: "Products that DO have a size", sql: "SELECT product_name, size\nFROM products\nWHERE size IS NOT NULL;" },
        { label: "Customers who weren't referred by anyone", sql: "SELECT first_name, referred_by\nFROM customers\nWHERE referred_by IS NULL;" }
      ],
      exercises: [
        { prompt: "Return first_name for every customer who WAS referred by someone (referred_by is not empty).", solution: "SELECT first_name FROM customers WHERE referred_by IS NOT NULL;", hint: "Use IS NOT NULL.", orderMatters: false }
      ]
    }
  ]
},

/* =========================================================================
   MODULE 3 — NULLS & CONDITIONAL LOGIC
   ========================================================================= */
{
  id: "conditional",
  title: "3 · Cleaning data & CASE logic",
  blurb: "Replace empty values and create categories with IF/THEN logic.",
  lessons: [
    {
      id: "ifnull",
      title: "IFNULL / COALESCE — replace empty values",
      body: `
        <p>When a column has NULLs, you often want to show a friendly substitute instead of a blank. <code>IFNULL(column, replacement)</code> returns the column's value, or the replacement when it's NULL.</p>
        <p><code>IFNULL(size, 'no size')</code> → shows the size, or the words "no size" when empty.</p>
        <div class="callout dialect"><strong>Dialect note:</strong> <code>COALESCE(a, b, c, ...)</code> does the same thing and is the standard, portable version — it returns the first non-NULL value in the list. The PDF you started from used BigQuery's <code>IFNULL</code>; SQLite supports both. Prefer <code>COALESCE</code> when you want it to work on any database.</div>
      `,
      examples: [
        { label: "Show a placeholder for missing sizes", sql: "SELECT product_id,\n       size,\n       IFNULL(size, 'no size') AS cleaned_size\nFROM products;" },
        { label: "COALESCE does the same thing", sql: "SELECT first_name,\n       COALESCE(referred_by, 0) AS referrer_id\nFROM customers;", note: "Empty referred_by becomes 0." }
      ],
      exercises: [
        { prompt: "From products, return product_name and a column display_size that shows the size, or the text 'One Size' when size is empty.", solution: "SELECT product_name, IFNULL(size, 'One Size') AS display_size FROM products;", hint: "IFNULL(size, 'One Size')", orderMatters: false }
      ]
    },
    {
      id: "trim",
      title: "TRIM and empty strings",
      body: `
        <p>An <strong>empty string</strong> <code>''</code> is different from NULL — it's a value, just with zero characters. Messy data sometimes has spaces that look empty. <code>TRIM(text)</code> removes leading and trailing spaces, so you can detect truly-empty text with <code>TRIM(col) = ''</code>.</p>
        <p>Related string helpers you'll use: <code>UPPER()</code>, <code>LOWER()</code>, <code>LENGTH()</code>, and joining text with <code>||</code> (e.g. <code>first_name || ' ' || last_name</code>).</p>
        <div class="callout dialect"><strong>Dialect note:</strong> SQLite joins text with the <code>||</code> operator. BigQuery/MySQL also have a <code>CONCAT(a, b)</code> function. Both produce "glued together" text.</div>
      `,
      examples: [
        { label: "Build a full name by joining text", sql: "SELECT first_name || ' ' || last_name AS full_name,\n       UPPER(city) AS city_upper,\n       LENGTH(first_name) AS name_length\nFROM customers;" },
        { label: "Find rows where size is blank after trimming", sql: "SELECT product_name, size\nFROM products\nWHERE TRIM(IFNULL(size, '')) = '';", note: "Treats NULL and blank-spaces as empty." }
      ],
      exercises: [
        { prompt: "Return a single column full_name that combines first_name, a space, and last_name for every customer.", solution: "SELECT first_name || ' ' || last_name AS full_name FROM customers;", hint: "Use || to glue: first_name || ' ' || last_name", orderMatters: false }
      ]
    },
    {
      id: "case",
      title: "CASE WHEN — if / then / else logic",
      body: `
        <p><code>CASE</code> lets you create a column based on conditions — exactly like IF/THEN/ELSE. The database checks each <code>WHEN</code> in order and uses the first one that's true; <code>ELSE</code> is the fallback.</p>
        <p>Shape:</p>
        <p><code>CASE<br>&nbsp;&nbsp;WHEN condition1 THEN result1<br>&nbsp;&nbsp;WHEN condition2 THEN result2<br>&nbsp;&nbsp;ELSE result3<br>END AS new_column</code></p>
        <p>This is how you turn numbers into buckets/labels — "High / Medium / Low", "Cheap / Premium", etc.</p>
      `,
      examples: [
        { label: "Two-way label: high vs low quantity", sql: "SELECT order_id,\n       quantity,\n       CASE WHEN quantity > 3 THEN 'High qty'\n            ELSE 'Low qty'\n       END AS qty_bucket\nFROM orders\nLIMIT 10;" },
        { label: "Three-way buckets", sql: "SELECT order_id,\n       quantity,\n       CASE WHEN quantity > 5 THEN 'High'\n            WHEN quantity BETWEEN 2 AND 5 THEN 'Medium'\n            ELSE 'Low'\n       END AS qty_bucket\nFROM orders\nLIMIT 12;", note: "Conditions are checked top to bottom; first match wins." }
      ],
      exercises: [
        { prompt: "From products, return product_name, price, and a column price_tier that is 'Premium' when price >= 7, otherwise 'Standard'.", solution: "SELECT product_name, price, CASE WHEN price >= 7 THEN 'Premium' ELSE 'Standard' END AS price_tier FROM products;", hint: "CASE WHEN price >= 7 THEN 'Premium' ELSE 'Standard' END", orderMatters: false }
      ]
    }
  ]
},

/* =========================================================================
   MODULE 4 — AGGREGATIONS
   ========================================================================= */
{
  id: "aggregation",
  title: "4 · Aggregating & grouping",
  blurb: "Summarize many rows into totals, averages, and counts.",
  lessons: [
    {
      id: "agg-functions",
      title: "Aggregate functions: SUM, AVG, MIN, MAX",
      body: `
        <p>Aggregate functions collapse many rows into a single summary number:</p>
        <ul>
          <li><code>SUM(x)</code> — total</li>
          <li><code>AVG(x)</code> — average</li>
          <li><code>MIN(x)</code> / <code>MAX(x)</code> — smallest / largest</li>
        </ul>
        <p>Without <code>GROUP BY</code> (next lesson), they summarize the <em>entire</em> table into one row. NULLs are ignored by these functions.</p>
        <p><code>SELECT SUM(quantity * unit_price) AS total_revenue FROM orders;</code> → one number: revenue across all orders.</p>
      `,
      examples: [
        { label: "Whole-business summary in one row", sql: "SELECT ROUND(SUM(quantity * unit_price), 2) AS total_revenue,\n       ROUND(AVG(quantity), 2) AS avg_qty,\n       MIN(quantity) AS min_qty,\n       MAX(unit_price) AS max_price\nFROM orders;" }
      ],
      exercises: [
        { prompt: "Return one row with the average price of all products aliased as avg_price (round to 2 decimals).", solution: "SELECT ROUND(AVG(price), 2) AS avg_price FROM products;", hint: "ROUND(AVG(price), 2)", orderMatters: false }
      ]
    },
    {
      id: "count",
      title: "COUNT — counting rows and distinct values",
      body: `
        <p><code>COUNT</code> tells you how many. Three flavors that mean different things:</p>
        <ul>
          <li><code>COUNT(*)</code> — number of rows (counts everything, including NULLs)</li>
          <li><code>COUNT(column)</code> — number of rows where that column is <em>not</em> NULL</li>
          <li><code>COUNT(DISTINCT column)</code> — number of <em>unique</em> non-NULL values</li>
        </ul>
        <p>Example: <code>COUNT(*)</code> over orders = total order rows. <code>COUNT(DISTINCT customer_id)</code> = how many different customers ordered.</p>
      `,
      examples: [
        { label: "The three counts side by side", sql: "SELECT COUNT(*) AS total_rows,\n       COUNT(referred_by) AS rows_with_referrer,\n       COUNT(DISTINCT city) AS unique_cities\nFROM customers;", note: "total_rows = 12, but rows_with_referrer is lower because some referred_by are NULL." },
        { label: "How many distinct products were ever ordered", sql: "SELECT COUNT(DISTINCT product_id) AS products_sold\nFROM orders;" }
      ],
      exercises: [
        { prompt: "From orders, return total_orders = the number of rows, and unique_customers = the number of distinct customer_id values.", solution: "SELECT COUNT(*) AS total_orders, COUNT(DISTINCT customer_id) AS unique_customers FROM orders;", hint: "COUNT(*) and COUNT(DISTINCT customer_id)", orderMatters: false }
      ]
    },
    {
      id: "group-by",
      title: "GROUP BY — summarize per category",
      body: `
        <p>Aggregates get powerful with <code>GROUP BY</code>. It splits rows into groups that share a value, then computes the aggregate <em>for each group</em>. "Total revenue per product", "orders per customer", "average price per category" — all GROUP BY.</p>
        <p>The rule: every column in your <code>SELECT</code> must either be inside an aggregate function, or be listed in <code>GROUP BY</code>. (You group by the labels, and aggregate the numbers.)</p>
        <p><code>SELECT product_id, SUM(quantity * unit_price) AS revenue<br>FROM orders<br>GROUP BY product_id;</code> → one row per product, with its total revenue.</p>
        <div class="callout tip"><strong>Shortcut:</strong> you can <code>GROUP BY 1</code> and <code>ORDER BY 2</code> — the numbers refer to the 1st, 2nd, ... column in your SELECT list. Handy, and used a lot in practice.</div>
      `,
      examples: [
        { label: "Revenue per product", sql: "SELECT product_id,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM orders\nGROUP BY product_id\nORDER BY revenue DESC;" },
        { label: "Orders per day, plus average order value", sql: "SELECT order_date,\n       COUNT(*) AS total_orders,\n       ROUND(AVG(quantity * unit_price), 2) AS avg_order_value\nFROM orders\nGROUP BY order_date\nORDER BY order_date;", note: "GROUP BY the date label; COUNT and AVG summarize each day." }
      ],
      exercises: [
        { prompt: "Return customer_id and order_count (number of order rows) for each customer, using the orders table.", solution: "SELECT customer_id, COUNT(*) AS order_count FROM orders GROUP BY customer_id;", hint: "GROUP BY customer_id, and COUNT(*) per group.", orderMatters: false }
      ]
    },
    {
      id: "having",
      title: "HAVING — filter the groups",
      body: `
        <p><code>WHERE</code> filters individual rows <em>before</em> grouping. To filter the <em>groups</em> themselves — e.g. "only products with revenue over 50" — you need <code>HAVING</code>, because the total doesn't exist until after grouping.</p>
        <p>Mental model of the order things happen: <code>WHERE</code> (pick rows) → <code>GROUP BY</code> (form groups) → <code>HAVING</code> (pick groups) → <code>ORDER BY</code> (sort).</p>
        <p><code>... GROUP BY product_id HAVING SUM(quantity * unit_price) &gt; 50</code></p>
      `,
      examples: [
        { label: "Products whose total revenue exceeds 50", sql: "SELECT product_id,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM orders\nGROUP BY product_id\nHAVING SUM(quantity * unit_price) > 50\nORDER BY revenue DESC;" },
        { label: "WHERE + HAVING together: 2024 only, then big spenders", sql: "SELECT customer_id,\n       ROUND(SUM(quantity * unit_price), 2) AS spend\nFROM orders\nWHERE order_date BETWEEN '2024-01-01' AND '2024-12-31'\nGROUP BY customer_id\nHAVING SUM(quantity * unit_price) > 40\nORDER BY spend DESC;", note: "WHERE trims rows first; HAVING trims the resulting groups." }
      ],
      exercises: [
        { prompt: "Return customer_id and order_count for customers who have placed MORE THAN 4 orders.", solution: "SELECT customer_id, COUNT(*) AS order_count FROM orders GROUP BY customer_id HAVING COUNT(*) > 4;", hint: "Add HAVING COUNT(*) > 4 after GROUP BY.", orderMatters: false }
      ]
    }
  ]
},

/* =========================================================================
   MODULE 5 — JOINS
   ========================================================================= */
{
  id: "joins",
  title: "5 · Joins (combining tables)",
  blurb: "Pull names, categories, and details from related tables — every join type.",
  lessons: [
    {
      id: "join-intro",
      title: "Why joins exist + INNER JOIN",
      body: `
        <p>Data is split across tables on purpose (so you don't repeat a customer's name on every order). To answer "what is the <em>name</em> of the product in each order?" you must look the <code>product_id</code> up in the <code>products</code> table. That look-up is a <strong>JOIN</strong>.</p>
        <p>You join by stating which column matches which: <code>ON orders.product_id = products.product_id</code>. Give each table a short alias (<code>orders o</code>, <code>products p</code>) so you can write <code>o.quantity</code>, <code>p.product_name</code>.</p>
        <p><strong>INNER JOIN</strong> keeps only rows that have a match on <em>both</em> sides. If an order pointed to a product that didn't exist, it would be dropped (and vice-versa).</p>
        <p><code>SELECT o.order_id, p.product_name<br>FROM orders o<br>INNER JOIN products p ON o.product_id = p.product_id;</code></p>
      `,
      examples: [
        { label: "Turn product_id into a product name", sql: "SELECT o.order_id,\n       p.product_name,\n       o.quantity\nFROM orders o\nINNER JOIN products p ON o.product_id = p.product_id\nLIMIT 10;" },
        { label: "Product with its category name (join products → categories)", sql: "SELECT p.product_name,\n       c.category_name\nFROM products p\nINNER JOIN categories c ON p.category_id = c.category_id;" }
      ],
      exercises: [
        { prompt: "Join orders to customers and return o.order_id and c.first_name for the first 10 matched rows. Use aliases o and c.", solution: "SELECT o.order_id, c.first_name FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id LIMIT 10;", hint: "ON o.customer_id = c.customer_id", orderMatters: true }
      ]
    },
    {
      id: "left-join",
      title: "LEFT JOIN — keep everything on the left",
      body: `
        <p><strong>LEFT JOIN</strong> keeps <em>all</em> rows from the left (first) table, and attaches matching right-table data where it exists. Where there's no match, the right-side columns come back as NULL.</p>
        <p>This is how you answer "show all products, including ones that never sold" — you start from products on the left, and orders may or may not match.</p>
        <p><code>FROM products p<br>LEFT JOIN orders o ON o.product_id = p.product_id</code> → every product appears, even Greek Salad with no orders (its order columns are NULL).</p>
      `,
      examples: [
        { label: "All products + revenue, including unsold ones", sql: "SELECT p.product_name,\n       IFNULL(ROUND(SUM(o.quantity * o.unit_price), 2), 0) AS revenue\nFROM products p\nLEFT JOIN orders o ON o.product_id = p.product_id\nGROUP BY p.product_name\nORDER BY revenue DESC;", note: "Greek Salad and Garlic Bread show 0 — INNER JOIN would have hidden them." }
      ],
      exercises: [
        { prompt: "Using a LEFT JOIN from customers to orders, return c.first_name and a count of orders per customer (alias order_count). Customers with no orders should show 0. Hint: COUNT(o.order_id) returns 0 for unmatched rows.", solution: "SELECT c.first_name, COUNT(o.order_id) AS order_count FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id GROUP BY c.first_name;", hint: "Start FROM customers c LEFT JOIN orders o; COUNT(o.order_id) is 0 when there's no match.", orderMatters: false }
      ]
    },
    {
      id: "anti-join",
      title: "Finding non-matches (the LEFT JOIN ... IS NULL trick)",
      body: `
        <p>A very common business question: "which customers have <em>never</em> ordered?" The trick: <code>LEFT JOIN</code> to orders, then keep only the rows where the order side came back NULL — those are the ones with no match.</p>
        <p><code>FROM customers c<br>LEFT JOIN orders o ON o.customer_id = c.customer_id<br>WHERE o.customer_id IS NULL</code></p>
        <p>This pattern (an "anti-join") works for any "things in A with nothing in B" question.</p>
      `,
      examples: [
        { label: "Customers who have never placed an order", sql: "SELECT c.customer_id, c.first_name, c.last_name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.customer_id IS NULL;", note: "Returns Kabir and Tara." }
      ],
      exercises: [
        { prompt: "Find products that have never been ordered. Return p.product_name. (LEFT JOIN products to orders and keep the unmatched ones.)", solution: "SELECT p.product_name FROM products p LEFT JOIN orders o ON o.product_id = p.product_id WHERE o.product_id IS NULL;", hint: "WHERE o.product_id IS NULL keeps products with no matching order.", orderMatters: false }
      ]
    },
    {
      id: "right-full-join",
      title: "RIGHT JOIN & FULL OUTER JOIN",
      body: `
        <p><strong>RIGHT JOIN</strong> is the mirror of LEFT JOIN: it keeps all rows from the <em>right</em> table. In fact <code>A RIGHT JOIN B</code> gives the same rows as <code>B LEFT JOIN A</code> — it's just a matter of which table you wrote first. Most people stick to LEFT JOIN for consistency, but you'll see RIGHT JOIN in the wild, so know what it does.</p>
        <p><strong>FULL OUTER JOIN</strong> keeps <em>everything from both</em> tables: matched rows are joined, and unmatched rows from either side appear with NULLs on the missing side. It's "LEFT + RIGHT combined."</p>
        <div class="callout dialect"><strong>Dialect note:</strong> RIGHT and FULL OUTER JOIN work in this SQLite engine (and in PostgreSQL, SQL Server, Oracle, BigQuery). Older MySQL lacked FULL OUTER JOIN — people emulated it with a LEFT JOIN <code>UNION</code> a RIGHT JOIN.</div>
      `,
      examples: [
        { label: "RIGHT JOIN: all customers, even those with no orders", sql: "SELECT c.first_name,\n       COUNT(o.order_id) AS orders\nFROM orders o\nRIGHT JOIN customers c ON c.customer_id = o.customer_id\nGROUP BY c.first_name\nORDER BY orders;", note: "Same result as customers LEFT JOIN orders — Kabir & Tara show 0." },
        { label: "FULL OUTER JOIN: all products and all order rows", sql: "SELECT p.product_name,\n       o.order_id\nFROM products p\nFULL OUTER JOIN orders o ON o.product_id = p.product_id\nORDER BY p.product_name\nLIMIT 15;", note: "Unsold products appear with a NULL order_id; if any order lacked a product it would appear with a NULL product_name." }
      ],
      exercises: [
        { prompt: "Rewrite this as a RIGHT JOIN that keeps every product: return p.product_name and COUNT(o.order_id) AS times_ordered, grouped by product_name. (Put orders first, products second.)", solution: "SELECT p.product_name, COUNT(o.order_id) AS times_ordered FROM orders o RIGHT JOIN products p ON p.product_id = o.product_id GROUP BY p.product_name;", hint: "FROM orders o RIGHT JOIN products p ON ...", orderMatters: false }
      ]
    },
    {
      id: "cross-self-join",
      title: "CROSS JOIN & SELF JOIN",
      body: `
        <p><strong>CROSS JOIN</strong> pairs every row of one table with every row of another — all combinations (a "Cartesian product"). No <code>ON</code> clause. Useful for generating combinations, like every category × every size option. Be careful: 100 rows × 100 rows = 10,000 rows.</p>
        <p><strong>SELF JOIN</strong> is a table joined to <em>itself</em>, using two different aliases. QuickBite's <code>customers.referred_by</code> points to another customer's id — so to show "who referred whom" you join customers to customers.</p>
        <p><code>FROM customers c<br>JOIN customers r ON c.referred_by = r.customer_id</code> → <code>c</code> is the new customer, <code>r</code> is their referrer.</p>
      `,
      examples: [
        { label: "CROSS JOIN: every category paired with Veg/Non-Veg", sql: "SELECT cat.category_name,\n       diet.label AS diet\nFROM categories cat\nCROSS JOIN (SELECT 'Veg' AS label UNION SELECT 'Non-Veg') diet\nORDER BY cat.category_name;", note: "5 categories × 2 labels = 10 rows (all combinations)." },
        { label: "SELF JOIN: who referred whom", sql: "SELECT c.first_name AS customer,\n       r.first_name AS referred_by\nFROM customers c\nJOIN customers r ON c.referred_by = r.customer_id\nORDER BY referred_by;", note: "Only customers who were referred appear (an INNER self-join)." }
      ],
      exercises: [
        { prompt: "Using a SELF JOIN on customers, return two columns: the new customer's first_name (alias new_customer) and their referrer's first_name (alias referrer). Match c.referred_by to r.customer_id.", solution: "SELECT c.first_name AS new_customer, r.first_name AS referrer FROM customers c JOIN customers r ON c.referred_by = r.customer_id;", hint: "Join customers c to customers r ON c.referred_by = r.customer_id.", orderMatters: false }
      ]
    },
    {
      id: "multi-join",
      title: "Joining 3+ tables",
      body: `
        <p>You can chain joins to pull from several tables at once. Each <code>JOIN ... ON ...</code> connects the next table to one already in the query. To get, for every order, the <em>customer name</em>, the <em>product name</em>, and the <em>category</em>, you join orders → customers → products → categories.</p>
        <p>Read it top to bottom: start with the fact table (orders), then attach each dimension by its id.</p>
      `,
      examples: [
        { label: "Order detail with names from three other tables", sql: "SELECT o.order_id,\n       c.first_name AS customer,\n       p.product_name,\n       cat.category_name,\n       o.quantity * o.unit_price AS revenue\nFROM orders o\nJOIN customers c  ON c.customer_id  = o.customer_id\nJOIN products p   ON p.product_id   = o.product_id\nJOIN categories cat ON cat.category_id = p.category_id\nORDER BY o.order_id\nLIMIT 12;" },
        { label: "Revenue per category (orders → products → categories)", sql: "SELECT cat.category_name,\n       ROUND(SUM(o.quantity * o.unit_price), 2) AS revenue\nFROM orders o\nJOIN products p     ON p.product_id   = o.product_id\nJOIN categories cat ON cat.category_id = p.category_id\nGROUP BY cat.category_name\nORDER BY revenue DESC;" }
      ],
      exercises: [
        { prompt: "Return category_name and total revenue (alias revenue, rounded to 2) per category, but ONLY for the 'Beverages' and 'Desserts' categories. Join orders → products → categories.", solution: "SELECT cat.category_name, ROUND(SUM(o.quantity * o.unit_price), 2) AS revenue FROM orders o JOIN products p ON p.product_id = o.product_id JOIN categories cat ON cat.category_id = p.category_id WHERE cat.category_name IN ('Beverages','Desserts') GROUP BY cat.category_name;", hint: "Add WHERE cat.category_name IN ('Beverages','Desserts') and GROUP BY category_name.", orderMatters: false }
      ]
    },
    {
      id: "set-operators",
      title: "UNION, INTERSECT, EXCEPT — stacking results",
      body: `
        <p>Joins glue tables <em>side by side</em> (more columns). <strong>Set operators</strong> stack query results <em>on top of each other</em> (more rows). The two queries must return the same number of columns, of compatible types.</p>
        <ul>
          <li><code>UNION</code> — combine and remove duplicates</li>
          <li><code>UNION ALL</code> — combine and keep duplicates (faster; use when you don't need dedup)</li>
          <li><code>INTERSECT</code> — only rows that appear in <em>both</em> results</li>
          <li><code>EXCEPT</code> — rows in the first result that are <em>not</em> in the second</li>
        </ul>
      `,
      examples: [
        { label: "UNION: cities that appear, once each", sql: "SELECT city FROM customers WHERE referred_by IS NULL\nUNION\nSELECT city FROM customers WHERE referred_by IS NOT NULL;", note: "UNION drops duplicate city values; UNION ALL would keep them." },
        { label: "INTERSECT: customers who ordered in BOTH Feb and Mar", sql: "SELECT customer_id FROM orders WHERE order_date BETWEEN '2024-02-01' AND '2024-02-29'\nINTERSECT\nSELECT customer_id FROM orders WHERE order_date BETWEEN '2024-03-01' AND '2024-03-31';" },
        { label: "EXCEPT: ordered in Feb but NOT in Mar", sql: "SELECT customer_id FROM orders WHERE order_date BETWEEN '2024-02-01' AND '2024-02-29'\nEXCEPT\nSELECT customer_id FROM orders WHERE order_date BETWEEN '2024-03-01' AND '2024-03-31';" }
      ],
      exercises: [
        { prompt: "Return a single deduplicated column customer_id that includes anyone who ordered in January OR April 2024. Use UNION of two SELECTs on the orders table.", solution: "SELECT customer_id FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31' UNION SELECT customer_id FROM orders WHERE order_date BETWEEN '2024-04-01' AND '2024-04-30';", hint: "Two SELECTs joined by UNION; each filters its month.", orderMatters: false }
      ]
    }
  ]
},

/* =========================================================================
   MODULE 6 — SUBQUERIES & CTEs
   ========================================================================= */
{
  id: "subqueries",
  title: "6 · Subqueries & CTEs",
  blurb: "Queries inside queries — and how to keep them readable.",
  lessons: [
    {
      id: "scalar-subquery",
      title: "Subqueries that return one value",
      body: `
        <p>A <strong>subquery</strong> is a query nested inside another, in parentheses. The simplest kind returns a single value, which you then compare against. Classic use: "show rows above the overall average."</p>
        <p><code>WHERE quantity * unit_price &gt; (SELECT AVG(quantity * unit_price) FROM orders)</code></p>
        <p>The inner query computes the average once; the outer query compares each row to it.</p>
      `,
      examples: [
        { label: "Order rows with above-average revenue", sql: "SELECT order_id,\n       quantity * unit_price AS revenue\nFROM orders\nWHERE quantity * unit_price > (\n    SELECT AVG(quantity * unit_price) FROM orders\n)\nORDER BY revenue DESC;" }
      ],
      exercises: [
        { prompt: "Return product_name and price for products that cost MORE than the average product price. Use a subquery for the average.", solution: "SELECT product_name, price FROM products WHERE price > (SELECT AVG(price) FROM products);", hint: "WHERE price > (SELECT AVG(price) FROM products)", orderMatters: false }
      ]
    },
    {
      id: "in-subquery",
      title: "Subqueries with IN (and nesting)",
      body: `
        <p>A subquery can return a <em>list</em> of values, which you feed into <code>IN</code>. And subqueries can nest: a query inside a query inside a query. Read them inside-out.</p>
        <p>Goal: revenue of products in the "Beverages" category, without joining — by first finding the category id, then the product ids, then summing.</p>
      `,
      examples: [
        { label: "Step 1 — which category id is 'Beverages'?", sql: "SELECT category_id\nFROM categories\nWHERE category_name = 'Beverages';" },
        { label: "Nested: revenue of all Beverage products", sql: "SELECT ROUND(SUM(quantity * unit_price), 2) AS beverage_revenue\nFROM orders\nWHERE product_id IN (\n    SELECT product_id FROM products\n    WHERE category_id IN (\n        SELECT category_id FROM categories\n        WHERE category_name = 'Beverages'\n    )\n);", note: "Innermost finds the category id; middle finds product ids; outer sums their revenue." }
      ],
      exercises: [
        { prompt: "Return order_id and quantity for orders whose product is in the 'Desserts' category, using IN with a subquery (no JOIN). product table links category_id; categories has the name.", solution: "SELECT order_id, quantity FROM orders WHERE product_id IN (SELECT product_id FROM products WHERE category_id IN (SELECT category_id FROM categories WHERE category_name = 'Desserts'));", hint: "Nest: orders.product_id IN (products in (category named 'Desserts')).", orderMatters: false }
      ]
    },
    {
      id: "cte",
      title: "CTEs — the WITH clause (readable subqueries)",
      body: `
        <p>Deeply nested subqueries get hard to read. A <strong>CTE</strong> ("Common Table Expression") lets you name a query up front with <code>WITH</code>, then use that name like a table below. Same power, far more readable — and you can chain several.</p>
        <p>Shape:</p>
        <p><code>WITH step1 AS (<br>&nbsp;&nbsp;SELECT ...<br>)<br>SELECT * FROM step1 WHERE ...;</code></p>
        <p>You can define multiple CTEs separated by commas, and each can reference the ones before it. This is the standard way analysts structure non-trivial queries.</p>
      `,
      examples: [
        { label: "Same 'above average' query, written with a CTE", sql: "WITH order_revenue AS (\n    SELECT order_id,\n           quantity * unit_price AS revenue\n    FROM orders\n)\nSELECT *\nFROM order_revenue\nWHERE revenue > (SELECT AVG(revenue) FROM order_revenue)\nORDER BY revenue DESC;" },
        { label: "Two chained CTEs: revenue per customer, then the top spenders", sql: "WITH per_customer AS (\n    SELECT customer_id,\n           SUM(quantity * unit_price) AS spend\n    FROM orders\n    GROUP BY customer_id\n),\nranked AS (\n    SELECT *,\n           RANK() OVER (ORDER BY spend DESC) AS spend_rank\n    FROM per_customer\n)\nSELECT * FROM ranked WHERE spend_rank <= 3;", note: "Preview of window functions (next module) — RANK numbers the rows by spend." }
      ],
      exercises: [
        { prompt: "Using a CTE named cust_spend that computes customer_id and total_spent = SUM(quantity*unit_price) grouped by customer_id, return only customers whose total_spent is greater than 50. Select customer_id and total_spent.", solution: "WITH cust_spend AS (SELECT customer_id, SUM(quantity * unit_price) AS total_spent FROM orders GROUP BY customer_id) SELECT customer_id, total_spent FROM cust_spend WHERE total_spent > 50;", hint: "Define the CTE with WITH, then SELECT from it with a WHERE filter.", orderMatters: false }
      ]
    }
  ]
},

/* =========================================================================
   MODULE 7 — WINDOW FUNCTIONS
   ========================================================================= */
{
  id: "windows",
  title: "7 · Window functions",
  blurb: "Rankings, running totals, and row-to-row comparisons — without collapsing rows.",
  lessons: [
    {
      id: "window-intro",
      title: "What a window function is",
      body: `
        <p><code>GROUP BY</code> collapses each group into one row. A <strong>window function</strong> computes a summary <em>across a set of rows</em> but <strong>keeps every row</strong> — it adds the summary as a new column next to the detail.</p>
        <p>You write a normal function followed by <code>OVER (...)</code>. An empty <code>OVER ()</code> means "the whole result". So you can show each order next to the grand total or overall average.</p>
        <p><code>SELECT *, SUM(quantity) OVER () AS total_qty FROM orders;</code> → every order row, plus a column repeating the overall total.</p>
      `,
      examples: [
        { label: "Each order beside the grand total quantity", sql: "SELECT order_id, quantity,\n       SUM(quantity) OVER () AS total_qty\nFROM orders\nLIMIT 10;", note: "Rows are NOT collapsed — total_qty just repeats on each row." },
        { label: "Compare each price to the overall average", sql: "SELECT order_id,\n       unit_price,\n       ROUND(AVG(unit_price) OVER (), 2) AS overall_avg_price\nFROM orders\nLIMIT 10;" }
      ],
      exercises: [
        { prompt: "From orders, return order_id, quantity*unit_price AS revenue, and a column avg_revenue = the overall average of quantity*unit_price using a window function OVER (). Round avg_revenue to 2.", solution: "SELECT order_id, quantity * unit_price AS revenue, ROUND(AVG(quantity * unit_price) OVER (), 2) AS avg_revenue FROM orders;", hint: "AVG(quantity * unit_price) OVER ()", orderMatters: false }
      ]
    },
    {
      id: "partition",
      title: "PARTITION BY — windows per group",
      body: `
        <p><code>PARTITION BY</code> inside <code>OVER (...)</code> restarts the calculation for each group — like GROUP BY, but it still keeps every row. "Each order's revenue as a share of <em>its day's</em> total" needs <code>PARTITION BY order_date</code>.</p>
        <p><code>SUM(...) OVER (PARTITION BY order_date)</code> → the total is computed within each date, repeated on that date's rows.</p>
      `,
      examples: [
        { label: "Revenue per row + that day's total revenue", sql: "SELECT order_date,\n       order_id,\n       quantity * unit_price AS revenue,\n       SUM(quantity * unit_price) OVER (PARTITION BY order_date) AS day_total\nFROM orders\nORDER BY order_date\nLIMIT 12;", note: "day_total resets for each date." }
      ],
      exercises: [
        { prompt: "Return customer_id, order_id, quantity*unit_price AS revenue, and customer_total = SUM(quantity*unit_price) OVER (PARTITION BY customer_id). Order by customer_id.", solution: "SELECT customer_id, order_id, quantity * unit_price AS revenue, SUM(quantity * unit_price) OVER (PARTITION BY customer_id) AS customer_total FROM orders ORDER BY customer_id;", hint: "PARTITION BY customer_id inside OVER().", orderMatters: false }
      ]
    },
    {
      id: "running-total",
      title: "Running totals (ORDER BY inside OVER)",
      body: `
        <p>Add <code>ORDER BY</code> <em>inside</em> the <code>OVER (...)</code> and a SUM becomes a <strong>running (cumulative) total</strong> — each row adds itself to everything before it in that order. Perfect for "revenue to date".</p>
        <p>Here we first roll orders up to daily revenue with a CTE, then run the total across days.</p>
      `,
      examples: [
        { label: "Cumulative revenue by day", sql: "WITH daily AS (\n    SELECT order_date,\n           SUM(quantity * unit_price) AS revenue\n    FROM orders\n    GROUP BY order_date\n)\nSELECT order_date,\n       ROUND(revenue, 2) AS revenue,\n       ROUND(SUM(revenue) OVER (ORDER BY order_date), 2) AS running_total\nFROM daily\nORDER BY order_date;", note: "running_total grows day by day." }
      ],
      exercises: [
        { prompt: "Using a CTE 'daily' (order_date, revenue=SUM(quantity*unit_price) grouped by order_date), return order_date, revenue, and running_total = the cumulative SUM(revenue) OVER (ORDER BY order_date). Round both to 2.", solution: "WITH daily AS (SELECT order_date, SUM(quantity * unit_price) AS revenue FROM orders GROUP BY order_date) SELECT order_date, ROUND(revenue,2) AS revenue, ROUND(SUM(revenue) OVER (ORDER BY order_date),2) AS running_total FROM daily ORDER BY order_date;", hint: "SUM(revenue) OVER (ORDER BY order_date) is the running total.", orderMatters: true }
      ]
    },
    {
      id: "ranking",
      title: "ROW_NUMBER, RANK, DENSE_RANK",
      body: `
        <p>Three ranking functions, all used with <code>OVER (ORDER BY ...)</code> (often plus <code>PARTITION BY</code>):</p>
        <ul>
          <li><code>ROW_NUMBER()</code> — 1, 2, 3, 4... always unique, even for ties (ties broken arbitrarily).</li>
          <li><code>RANK()</code> — ties share a rank, then it <em>skips</em>: 1, 2, 2, 4.</li>
          <li><code>DENSE_RANK()</code> — ties share a rank, no skip: 1, 2, 2, 3.</li>
        </ul>
        <p>Add <code>PARTITION BY</code> to rank <em>within</em> each group — e.g. the top-selling product <em>per day</em>: rank products by revenue partitioned by date, then keep rank 1.</p>
      `,
      examples: [
        { label: "Rank products by total revenue (see the difference)", sql: "WITH prod AS (\n    SELECT product_id,\n           SUM(quantity * unit_price) AS revenue\n    FROM orders\n    GROUP BY product_id\n)\nSELECT product_id, ROUND(revenue,2) AS revenue,\n       ROW_NUMBER()  OVER (ORDER BY revenue DESC) AS row_num,\n       RANK()        OVER (ORDER BY revenue DESC) AS rank_,\n       DENSE_RANK()  OVER (ORDER BY revenue DESC) AS dense_rank_\nFROM prod\nORDER BY revenue DESC;" },
        { label: "Top-selling product on each day (DENSE_RANK + PARTITION)", sql: "WITH daily_prod AS (\n    SELECT order_date, product_id,\n           SUM(quantity * unit_price) AS revenue\n    FROM orders\n    GROUP BY order_date, product_id\n),\nranked AS (\n    SELECT *,\n           DENSE_RANK() OVER (PARTITION BY order_date ORDER BY revenue DESC) AS rnk\n    FROM daily_prod\n)\nSELECT order_date, product_id, ROUND(revenue,2) AS revenue\nFROM ranked\nWHERE rnk = 1\nORDER BY order_date;", note: "PARTITION BY order_date restarts ranking each day; keep rnk = 1 for the winner." }
      ],
      exercises: [
        { prompt: "Build a CTE 'cust' (customer_id, spend=SUM(quantity*unit_price) grouped by customer_id), then return customer_id, spend, and spend_rank = DENSE_RANK() OVER (ORDER BY spend DESC). Order by spend_rank.", solution: "WITH cust AS (SELECT customer_id, SUM(quantity * unit_price) AS spend FROM orders GROUP BY customer_id) SELECT customer_id, spend, DENSE_RANK() OVER (ORDER BY spend DESC) AS spend_rank FROM cust ORDER BY spend_rank;", hint: "DENSE_RANK() OVER (ORDER BY spend DESC)", orderMatters: true }
      ]
    },
    {
      id: "ntile",
      title: "NTILE — split rows into buckets",
      body: `
        <p><code>NTILE(n)</code> divides the ordered rows into <em>n</em> roughly equal buckets and labels each row 1..n. It's how you build quartiles, deciles, or "top 20% of customers".</p>
        <p><code>NTILE(5) OVER (ORDER BY spend DESC)</code> → bucket 1 is the top fifth of spenders, bucket 5 the bottom fifth.</p>
      `,
      examples: [
        { label: "Split customers into 4 spend quartiles", sql: "WITH cust AS (\n    SELECT customer_id,\n           SUM(quantity * unit_price) AS spend\n    FROM orders\n    GROUP BY customer_id\n)\nSELECT customer_id,\n       ROUND(spend, 2) AS spend,\n       NTILE(4) OVER (ORDER BY spend DESC) AS quartile\nFROM cust\nORDER BY spend DESC;", note: "quartile 1 = biggest spenders." }
      ],
      exercises: [
        { prompt: "From the same per-customer spend CTE 'cust', return customer_id, spend, and a column tier = NTILE(3) OVER (ORDER BY spend DESC). Then keep only tier = 1 (the top third). Order by spend DESC.", solution: "WITH cust AS (SELECT customer_id, SUM(quantity * unit_price) AS spend FROM orders GROUP BY customer_id) SELECT * FROM (SELECT customer_id, spend, NTILE(3) OVER (ORDER BY spend DESC) AS tier FROM cust) WHERE tier = 1 ORDER BY spend DESC;", hint: "Wrap the NTILE query, then filter WHERE tier = 1.", orderMatters: true }
      ]
    },
    {
      id: "lag-lead",
      title: "LAG & LEAD — compare to previous/next row",
      body: `
        <p><code>LAG(col, n)</code> reaches <em>back</em> n rows (default 1) to grab a previous value; <code>LEAD(col, n)</code> reaches <em>forward</em>. This is how you compute change over time — month-over-month growth, days since last order, etc.</p>
        <p>Pattern for month-over-month %: <code>(this_month - LAG(this_month)) / LAG(this_month) * 100</code>.</p>
      `,
      examples: [
        { label: "Month-over-month revenue growth %", sql: "WITH monthly AS (\n    SELECT strftime('%Y-%m', order_date) AS month,\n           SUM(quantity * unit_price) AS revenue\n    FROM orders\n    GROUP BY month\n)\nSELECT month,\n       ROUND(revenue, 2) AS revenue,\n       ROUND(LAG(revenue) OVER (ORDER BY month), 2) AS prev_month,\n       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))\n             / LAG(revenue) OVER (ORDER BY month), 1) AS mom_growth_pct\nFROM monthly\nORDER BY month;", note: "The first month's growth is NULL — there's no previous month to compare." }
      ],
      exercises: [
        { prompt: "Build a CTE 'monthly' (month = strftime('%Y-%m', order_date), revenue = SUM(quantity*unit_price) grouped by month). Return month, revenue, and prev_month_revenue = LAG(revenue) OVER (ORDER BY month). Round revenue and prev_month_revenue to 2. Order by month.", solution: "WITH monthly AS (SELECT strftime('%Y-%m', order_date) AS month, SUM(quantity * unit_price) AS revenue FROM orders GROUP BY month) SELECT month, ROUND(revenue,2) AS revenue, ROUND(LAG(revenue) OVER (ORDER BY month),2) AS prev_month_revenue FROM monthly ORDER BY month;", hint: "LAG(revenue) OVER (ORDER BY month)", orderMatters: true }
      ]
    },
    {
      id: "value-functions",
      title: "FIRST_VALUE, LAST_VALUE, NTH_VALUE",
      body: `
        <p>These pull a specific row's value from within the window: <code>FIRST_VALUE(col)</code>, <code>LAST_VALUE(col)</code>, and <code>NTH_VALUE(col, n)</code>. Combined with <code>PARTITION BY customer_id ORDER BY order_date</code>, you can label each customer's <em>first</em> and <em>last</em> purchase date.</p>
        <div class="callout dialect"><strong>Heads-up:</strong> with an <code>ORDER BY</code> in the window, the default "frame" stops at the current row, which makes <code>LAST_VALUE</code> look wrong. The reliable pattern is <code>FIRST_VALUE(... ORDER BY order_date)</code> for the earliest and <code>FIRST_VALUE(... ORDER BY order_date DESC)</code> for the latest — flipping the sort instead of using LAST_VALUE.</p></div>
      `,
      examples: [
        { label: "Each customer's first and most-recent purchase date", sql: "SELECT DISTINCT customer_id,\n       FIRST_VALUE(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS first_purchase,\n       FIRST_VALUE(order_date) OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS last_purchase\nFROM orders\nORDER BY customer_id;", note: "DISTINCT collapses the repeated rows so you get one line per customer." }
      ],
      exercises: [
        { prompt: "For each customer, return DISTINCT customer_id and first_purchase = FIRST_VALUE(order_date) OVER (PARTITION BY customer_id ORDER BY order_date). Order by customer_id.", solution: "SELECT DISTINCT customer_id, FIRST_VALUE(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS first_purchase FROM orders ORDER BY customer_id;", hint: "FIRST_VALUE(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)", orderMatters: true }
      ]
    }
  ]
},

/* =========================================================================
   MODULE 8 — DATES & TIMES
   ========================================================================= */
{
  id: "datetime",
  title: "8 · Dates & times",
  blurb: "Pull apart dates, format them, and measure gaps between them.",
  lessons: [
    {
      id: "extract-parts",
      title: "Pulling parts out of a date (year, month, day, hour)",
      body: `
        <p>Dates here are stored as text like <code>'2024-03-15'</code>, times like <code>'13:45:00'</code>. To group "by month" or "by hour" you extract the part you need.</p>
        <p>In SQLite, <code>strftime(format, value)</code> formats a date/time. Useful codes: <code>%Y</code> year, <code>%m</code> month (01-12), <code>%d</code> day, <code>%H</code> hour, <code>%w</code> weekday (0=Sunday). Cast to a number with a leading <code>+0</code> or use <code>CAST(... AS INTEGER)</code> if you want it numeric.</p>
        <div class="callout dialect"><strong>Dialect note:</strong> The PDF used BigQuery's <code>EXTRACT(MONTH FROM date)</code> and <code>FORMAT_DATETIME('%B', ...)</code>. SQLite has no <code>EXTRACT</code>; the equivalent is <code>strftime</code>. The idea is identical: chop a date into its pieces.</div>
      `,
      examples: [
        { label: "Year, month, day, weekday, hour from each order", sql: "SELECT order_date, order_time,\n       strftime('%Y', order_date) AS year,\n       strftime('%m', order_date) AS month,\n       strftime('%d', order_date) AS day,\n       strftime('%w', order_date) AS weekday_0sun,\n       strftime('%H', order_time) AS hour\nFROM orders\nLIMIT 8;" },
        { label: "Orders per month (group by an extracted part)", sql: "SELECT strftime('%Y-%m', order_date) AS month,\n       COUNT(*) AS orders,\n       ROUND(SUM(quantity * unit_price), 2) AS revenue\nFROM orders\nGROUP BY month\nORDER BY month;" }
      ],
      exercises: [
        { prompt: "Return order_id and a column order_year = the 4-digit year extracted from order_date.", solution: "SELECT order_id, strftime('%Y', order_date) AS order_year FROM orders;", hint: "strftime('%Y', order_date)", orderMatters: false }
      ]
    },
    {
      id: "date-diff",
      title: "Differences between dates",
      body: `
        <p>To measure how many days are between two dates in SQLite, convert each to a day-number with <code>julianday(date)</code> and subtract: <code>julianday(d1) - julianday(d2)</code>. Wrap in <code>CAST(... AS INTEGER)</code> for whole days.</p>
        <p><code>CAST(julianday('2024-03-15') - julianday('2024-03-01') AS INTEGER)</code> → 14.</p>
        <p>Use <code>date('now')</code> for today's date (so "days since last order" works).</p>
        <div class="callout dialect"><strong>Dialect note:</strong> The PDF used BigQuery's <code>DATE_DIFF(d1, d2, DAY)</code>. SQLite's portable equivalent is the <code>julianday</code> subtraction above.</div>
      `,
      examples: [
        { label: "Each customer's lifespan and recency", sql: "SELECT customer_id,\n       MIN(order_date) AS first_order,\n       MAX(order_date) AS last_order,\n       CAST(julianday(MAX(order_date)) - julianday(MIN(order_date)) AS INTEGER) AS days_active,\n       CAST(julianday(date('now')) - julianday(MAX(order_date)) AS INTEGER) AS days_since_last\nFROM orders\nGROUP BY customer_id\nORDER BY customer_id;" }
      ],
      exercises: [
        { prompt: "From customers, return customer_id and days_as_member = whole number of days between signup_date and today (date('now')). Use CAST(julianday(...) - julianday(...) AS INTEGER).", solution: "SELECT customer_id, CAST(julianday(date('now')) - julianday(signup_date) AS INTEGER) AS days_as_member FROM customers;", hint: "julianday(date('now')) - julianday(signup_date), wrapped in CAST(... AS INTEGER).", orderMatters: false }
      ]
    },
    {
      id: "days-between-purchases",
      title: "Days between each purchase (dates + LAG)",
      body: `
        <p>Combine what you know: <code>LAG</code> grabs each customer's <em>previous</em> order date, and <code>julianday</code> subtraction turns it into a gap in days. This answers "how often does each customer come back?"</p>
        <p>The first order for each customer has no previous date, so its gap is NULL.</p>
      `,
      examples: [
        { label: "Gap in days between consecutive orders per customer", sql: "SELECT customer_id,\n       order_date,\n       LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_order,\n       CAST(julianday(order_date)\n            - julianday(LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date))\n            AS INTEGER) AS days_since_prev\nFROM orders\nORDER BY customer_id, order_date\nLIMIT 15;" },
        { label: "Average gap between orders, across all customers", sql: "WITH gaps AS (\n    SELECT customer_id,\n           julianday(order_date)\n           - julianday(LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)) AS gap\n    FROM orders\n)\nSELECT ROUND(AVG(gap), 1) AS avg_days_between_orders\nFROM gaps;", note: "NULL gaps (first orders) are ignored by AVG automatically." }
      ],
      exercises: [
        { prompt: "Return customer_id, order_date, and prev_order = the previous order_date for that customer (LAG, PARTITION BY customer_id ORDER BY order_date). Order by customer_id, order_date.", solution: "SELECT customer_id, order_date, LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_order FROM orders ORDER BY customer_id, order_date;", hint: "LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)", orderMatters: true }
      ]
    }
  ]
},

/* =========================================================================
   MODULE 9 — CHANGING DATA (bonus)
   ========================================================================= */
{
  id: "dml",
  title: "9 · Changing data (bonus)",
  blurb: "Create tables and insert/update/delete rows. Safe here — the DB resets each run.",
  lessons: [
    {
      id: "insert",
      title: "CREATE TABLE & INSERT",
      body: `
        <p>So far you've only <em>read</em> data. SQL can also <em>write</em> it. <code>CREATE TABLE</code> defines a new table; <code>INSERT INTO</code> adds rows.</p>
        <p>Because this sandbox rebuilds the QuickBite database from scratch on <em>every</em> Run, any table you create or row you insert lasts only for that single run. To see the effect, do the change and a <code>SELECT</code> in the <em>same</em> editor.</p>
        <p>Shape: <code>INSERT INTO table (col1, col2) VALUES (v1, v2);</code></p>
      `,
      examples: [
        { label: "Create a tiny table and read it back", sql: "CREATE TABLE coupons (code TEXT, discount INTEGER);\nINSERT INTO coupons (code, discount) VALUES ('WELCOME10', 10), ('FREESHIP', 0);\nSELECT * FROM coupons;", note: "All three statements run together; you see the final SELECT." },
        { label: "Add a new customer, then list Pune customers", sql: "INSERT INTO customers (customer_id, first_name, last_name, city, signup_date, referred_by)\nVALUES (99, 'Neha', 'Verma', 'Pune', '2024-04-15', NULL);\nSELECT customer_id, first_name, city FROM customers WHERE city = 'Pune';", note: "Neha appears — but only until the next Run resets the data." }
      ],
      exercises: [
        { prompt: "In one editor: INSERT a product with product_id 999, product_name 'Test Latte', category_id 1, price 5.5, size 'Small'; then SELECT product_name, price FROM products WHERE product_id = 999.", solution: "INSERT INTO products (product_id, product_name, category_id, price, size) VALUES (999, 'Test Latte', 1, 5.5, 'Small'); SELECT product_name, price FROM products WHERE product_id = 999;", hint: "INSERT first, then a SELECT filtering product_id = 999.", orderMatters: false }
      ]
    },
    {
      id: "update-delete",
      title: "UPDATE & DELETE",
      body: `
        <p><code>UPDATE</code> changes existing rows; <code>DELETE</code> removes them. Both take a <code>WHERE</code> clause that decides which rows are affected.</p>
        <div class="callout warn"><strong>The most important habit in SQL:</strong> always include a <code>WHERE</code> on UPDATE/DELETE. <code>DELETE FROM orders;</code> (no WHERE) deletes <em>every</em> row. Here it's harmless (the data resets), but on a real database it's a disaster. Write the WHERE first.</div>
        <p>Shapes: <code>UPDATE t SET col = value WHERE ...;</code> and <code>DELETE FROM t WHERE ...;</code></p>
      `,
      examples: [
        { label: "UPDATE: 10% off all beverages, then check", sql: "UPDATE products\nSET price = ROUND(price * 0.9, 2)\nWHERE category_id = 1;\nSELECT product_name, price FROM products WHERE category_id = 1;", note: "Prices drop for category 1 only." },
        { label: "DELETE: remove cancelled-looking orders, then count", sql: "DELETE FROM orders WHERE quantity > 5;\nSELECT COUNT(*) AS remaining_orders FROM orders;", note: "Only rows with quantity > 5 are removed (the two big ones)." }
      ],
      exercises: [
        { prompt: "In one editor: UPDATE customers SET city = 'Goa' WHERE customer_id = 1; then SELECT customer_id, city FROM customers WHERE customer_id = 1.", solution: "UPDATE customers SET city = 'Goa' WHERE customer_id = 1; SELECT customer_id, city FROM customers WHERE customer_id = 1;", hint: "UPDATE ... SET city = 'Goa' WHERE customer_id = 1, then SELECT to verify.", orderMatters: false }
      ]
    }
  ]
},

/* =========================================================================
   MODULE 10 — SANDBOX
   ========================================================================= */
{
  id: "sandbox",
  title: "Free sandbox",
  blurb: "No lesson, no checking — just you and the data.",
  lessons: [
    {
      id: "playground",
      title: "Playground",
      body: `
        <p>This is your open workspace. Write any query against the QuickBite tables (customers, categories, products, orders) and run it. There's no "correct answer" here — experiment, break things, combine everything you've learned. The database resets on every run, so you can't damage anything.</p>
        <p>Stuck for ideas? Try: "which city has the highest total revenue?", "what's the busiest hour of the day?", "which customer has the longest gap between two orders?"</p>
        <div class="callout tip">Press <strong>Tables</strong> (top bar) any time to see column names and sample rows.</div>
      `,
      examples: [
        { label: "A starter query you can edit freely", sql: "SELECT c.city,\n       ROUND(SUM(o.quantity * o.unit_price), 2) AS revenue,\n       COUNT(*) AS orders\nFROM orders o\nJOIN customers c ON c.customer_id = o.customer_id\nGROUP BY c.city\nORDER BY revenue DESC;" }
      ],
      exercises: []
    }
  ]
}

];

if (typeof module !== 'undefined' && module.exports) { module.exports = { LESSONS }; }
if (typeof window !== 'undefined') { window.LESSONS = LESSONS; }
