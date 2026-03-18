# 🚰 KGN Waters — Full Stack Web App

**Node.js + Express + MySQL** water delivery system with a customer frontend and admin dashboard.

---

## 📁 Project Structure

```
kgn-waters/
├── backend/
│   ├── server.js           ← Main Express server
│   ├── db.js               ← MySQL connection pool
│   ├── database.sql        ← Run once to set up DB + seed data
│   ├── package.json
│   ├── .env.example        ← Copy to .env and fill in your values
│   ├── middleware/
│   │   └── auth.js         ← JWT authentication
│   └── routes/
│       ├── auth.js         ← POST /api/auth/login
│       ├── orders.js       ← Orders CRUD
│       └── products.js     ← Products + stats
└── frontend/
    ├── index.html          ← Customer ordering page
    └── admin.html          ← Admin dashboard
```

---

## ⚡ Quick Setup (Step by Step)

### 1. Install MySQL
Download from https://dev.mysql.com/downloads/mysql/ and install it.

### 2. Set up the database
Open your MySQL terminal and run:
```bash
mysql -u root -p < backend/database.sql
```
This creates the `kgn_waters` database, all tables, and seeds default products + admin account.

### 3. Configure environment
```bash
cd backend
cp .env.example .env
```
Open `.env` and fill in your MySQL password:
```
DB_PASSWORD=your_mysql_password
JWT_SECRET=any_long_random_string_here
```

### 4. Install dependencies
```bash
cd backend
npm install
```

### 5. Start the server
```bash
npm start
# or for auto-reload during development:
npm run dev
```

### 6. Open the app
| Page | URL |
|------|-----|
| Customer site | http://localhost:3000/ |
| Admin dashboard | http://localhost:3000/admin |

---

## 🔐 Default Admin Login
| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `kgn2024` |

> ⚠️ Change this password in production! Update the `.env` file and re-hash using bcrypt.

---

## 🌐 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/products` | List available products |
| POST | `/api/orders` | Place a new order |

### Admin (requires JWT token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and get token |
| GET | `/api/orders` | Get all orders (filter by status, search, paginate) |
| PATCH | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Delete an order |
| GET | `/api/products/stats` | Get dashboard stats |
| POST | `/api/products` | Add a new product |
| PATCH | `/api/products/:id/toggle` | Toggle product availability |

---

## 🗄️ Database Tables

### `orders`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| order_id | VARCHAR | e.g. KGN1234567 |
| customer_name | VARCHAR | Customer's name |
| phone | VARCHAR | 10-digit phone |
| address | TEXT | Delivery address |
| product_id | INT | FK → products |
| product_name | VARCHAR | Snapshot at order time |
| quantity | INT | Number of units |
| unit_price | DECIMAL | Price at order time |
| total | DECIMAL | quantity × unit_price |
| status | ENUM | new / processing / delivered / cancelled |
| notes | TEXT | Special instructions |
| created_at | DATETIME | Auto-set |

### `products`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR | Product name |
| description | TEXT | Description |
| price | DECIMAL | Price in ₹ |
| unit | VARCHAR | e.g. "per jar" |
| available | TINYINT | 1=visible, 0=hidden |

### `admins`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| username | VARCHAR | Login username |
| password | VARCHAR | bcrypt hashed |

---

## 🚀 Deploy to Production

### Option A: VPS (DigitalOcean / AWS EC2)
1. Upload code to server via SSH
2. Install Node.js 18+ and MySQL
3. Run `npm install` in backend/
4. Use **PM2** to keep it running: `pm2 start server.js`
5. Use **Nginx** as a reverse proxy on port 80

### Option B: Railway.app (Easy, Free tier available)
1. Push code to GitHub
2. Create a new project on railway.app
3. Add a MySQL plugin
4. Set environment variables
5. Deploy!

---

## 🔒 Security Notes for Production
- Change `JWT_SECRET` to a long random string (32+ chars)
- Change admin password
- Set `CORS origin` in server.js to your actual domain
- Use HTTPS (SSL certificate via Let's Encrypt)
- Never commit `.env` to git (add it to `.gitignore`)
