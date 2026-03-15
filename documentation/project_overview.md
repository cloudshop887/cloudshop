# ☁️ Cloud Shop — Project Overview & Status Report
**A Smart Multi-Vendor Cloud Marketplace for Local Shops**

---

## 📌 1. Project Introduction

**Cloud Shop** is a modern cloud-based e-commerce platform that connects **local shop owners** with **customers** in their community.

Unlike large platforms such as Amazon or Flipkart, Cloud Shop focuses on:
- **Hyper-local discovery** of nearby shops
- **Reserve & Pick** — a unique in-store pickup model with instant discounts
- **Real-time updates** via websockets
- **Community integration** with alerts and lost-and-found features

> *"Empowering every local shop with the power of the cloud."*

---

## ❓ 2. Problem Statement

Local shops struggle to compete with large e-commerce platforms because:

| Problem | Impact |
|---|---|
| No online presence | Lost customers to big brands |
| No inventory visibility | Customers don't know what's available |
| No automated discounts | Cannot attract price-sensitive buyers |
| Poor community engagement | Disconnected from their neighborhoods |

**Cloud Shop solves all of these — in one platform.**

---

## 🎯 3. Core Objectives

1. **Enable local shops** to register, upload products, and go live instantly.
2. **Help customers** discover nearby shops and compare prices.
3. **Implement Reserve & Pick** — an instant discount model for in-store pickup.
4. **Provide admin control** over all shops, users, discounts, and analytics.
5. **Integrate community features** (alerts, lost & found, jobs) for a complete ecosystem.
6. **Support real-time updates** for orders, reservations, and promotions.

---

## ⚙️ 4. System Features

### 🏪 Shop Management
- Shop registration with admin approval workflow.
- Logo, banner, and branding customization.
- Shop categories with custom category support.

### 🛒 Product & Ordering
- Add/edit/delete products with image hosting.
- Cart with multi-shop checkout support.
- Order status tracking (Pending → Dispatched → Delivered).

### 🏷️ Reserve & Pick Discount System *(New Feature)*
- Customer chooses **Reserve & Pick** instead of delivery.
- System calculates **instant discount** automatically.
- **Bulk quantity discount** for 5+ items reserved.
- Shop owners can **enable/disable**, **set percentage**, **configure bulk rules**.
- Reservation status: Pending → Confirmed → Picked Up.
- Real-time management via the **Shop Owner Dashboard**.

### 🌐 Community & Real-Time Features
- Real-time community alerts (emergency, offers, events).
- Nearby shops with distance calculator + travel time.
- WebSocket-powered live notifications and order updates.

---

## 🛠️ 5. Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: Prisma ORM with SQLite (Development) / MySQL (Production)
- **Authentication**: JWT, Google OAuth 2.0, Firebase Phone OTP
- **Real-time**: Socket.IO (WebSockets)
- **Maps**: Leaflet, react-leaflet

---

## 🐛 6. Recent Bug Fixes & Issue Resolutions

During the latest comprehensive review, the following critical issues were permanently resolved:

1. **Logo & Image Loading Bugs**:
   - *Issue*: `via.placeholder.com` links were failing to load, causing broken images.
   - *Fix*: Swept the entire codebase (`ShopDetail.jsx`, `Shops.jsx`, `ShopOwnerDashboard.jsx`, `Checkout.jsx`, etc.) and replaced all broken placeholders with reliable `placehold.co` backups. Images and logos now render flawlessly.

2. **Cart & Checkout Logic**:
   - *Issue*: Multi-vendor checkout math and discount application quirks.
   - *Fix*: Verified `CartContext.jsx` and `Checkout.jsx`. Items are correctly grouped by `shopId` during checkout, and subtotals accurately reflect real-time pricing and quantities.

3. **Reserve & Pick Reservation Logic**:
   - *Issue*: Needed a streamlined way for customers to reserve instead of just adding to the cart, with live discount mathematics.
   - *Fix*: Created the entire `Reservation` database model, backed by `reservationController.js`. The calculation correctly applies base % discounts and stacks bulk % discounts if the cart quantity exceeds the shop's defined thresholds. Developed a visual `ReservePickModal` and a `MyReservations` tracking page.

4. **Real-Time Database Deployment Prep**:
   - *Issue*: WebSockets were misconfigured for production deployment cross-origin resource sharing (CORS).
   - *Fix*: Secured `socket.js` and `server.js` with `process.env.FRONTEND_URL` origin policies, setting the stage for live production websocket integration seamlessly.

5. **Schema Validation**:
   - *Issue*: Database structural integrity checks.
   - *Fix*: Ran `prisma validate` — 100% structural clearance with zero errors.

---

## 🏁 7. Conclusion

**Cloud Shop bridges the gap between traditional local shops and the digital economy.**

By introducing the **Reserve & Pick Instant Discount System**, solving persistent UI placeholder bugs, securing the cart logic, and prepping for real-time WebSocket deployment, the project is completely stable.

*Cloud Shop is not just an app — it's a community marketplace.*
