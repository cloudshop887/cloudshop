# Neon Database Setup Guide

This project uses **Neon PostgreSQL** as its database. Neon offers a free tier perfect for development and small projects.

---

## 🚀 Quick Start

### 1. Create a Neon Account & Database

1. Visit [neon.tech](https://console.neon.tech)
2. Sign up (free tier available)
3. Create a new project
4. Copy your connection string (looks like: `postgresql://user:password@host:port/database`)

### 2. Configure Your Local Environment

Create a `.env` file in the `api/` folder:

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key-here
FLASK_ENV=development
```

Replace `DATABASE_URL` with your actual Neon connection string.

### 3. Install Dependencies

```bash
cd api
pip install -r requirements.txt
```

### 4. Initialize Database & Run Backend

```bash
python index.py
```

Your Flask backend is now running on `http://localhost:5000`

### 5. Start Frontend (in separate terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 6. Start Community Alerts (in another terminal)

```bash
cd community-frontend
npm install
npm run dev
```

Community alerts run on `http://localhost:3000`

---

## Admin Login Credentials

- **Email:** `admin@cloudshop.com`
- **Password:** `Admin@123`

---

## 🐛 Troubleshooting

**"Database connection failed"**
- Check your `DATABASE_URL` is correct
- Ensure you're using the Pooler endpoint from Neon
- Verify your IP is whitelisted in Neon console

**"Module not found"**
- Run `pip install -r requirements.txt` in the `api/` folder
- Ensure you have Python 3.8+ installed

**Cannot connect to frontend**
- Ensure all three services are running in different terminals
- Check the URLs match (`localhost:5000`, `localhost:5173`, `localhost:3000`)

---

## 📚 More Information

- Neon Docs: https://neon.tech/docs
- Flask Docs: https://flask.palletsprojects.com
- SQLAlchemy Docs: https://docs.sqlalchemy.org
