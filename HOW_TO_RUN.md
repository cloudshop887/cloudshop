# CloudShop - How to Run the Project 🚀

This project is now fully migrated to a **Python Flask backend** using **SQLite**. 
You will need three separate terminal windows to run the complete ecosystem.

---

### Terminal 1: Start the Backend (Flask API & Sockets)
The backend provides all API routes (`/api/*`) and handles the Live Community Alerts via WebSockets.

1. Open a new terminal.
2. Navigate to the backend folder:
   ```bash
   cd "flask-backend"
   ```
3. Run the Flask Server:
   ```bash
   python app.py
   ```
   *The backend will now be running on `http://localhost:5000`.*

---

### Terminal 2: Start the Main Frontend (CloudShop)
This is the main shopping application built with React/Vite.

1. Open a **second** new terminal.
2. Navigate to the frontend folder:
   ```bash
   cd "frontend"
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The CloudShop frontend will now be running on `http://localhost:5173`.*

---

### Terminal 3: Start the Community Alerts Frontend (Next.js)
This is the live community board app that uses WebSockets to show new alerts.

1. Open a **third** new terminal.
2. Navigate to the community-frontend folder:
   ```bash
   cd "community-frontend"
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   *The Community Alerts frontend will now be running on `http://localhost:3000`.*

---

### Default Admin Login
To access the admin features of the shop, you can log in with:
- **Email:** `admin@cloudshop.com`
- **Password:** `Admin@123`
