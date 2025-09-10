# 🍴 Restaurant Web App – Backend

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Mongoose](https://img.shields.io/badge/Mongoose-8.x-orange)
![JWT](https://img.shields.io/badge/JWT-Authentication-blue?logo=jsonwebtokens)
![bcryptjs](https://img.shields.io/badge/Security-bcryptjs-yellow)
![dotenv](https://img.shields.io/badge/Config-dotenv-lightblue)

Backend for the **Restaurant Web App** built with the **MERN stack**.  
Handles authentication, customers, orders, tables, dishes, and reporting APIs.

---

## 🚀 Tech Stack
- **Node.js** – Runtime environment  
- **Express.js** – Web framework  
- **MongoDB Atlas** – Cloud database  
- **Mongoose** – ODM for MongoDB  
- **JWT (jsonwebtoken)** – Authentication  
- **bcryptjs** – Password hashing  
- **dotenv** – Environment configuration  
- **CORS** – Secure API access from frontend  

---

## ⚡ Features
- **Authentication (JWT)** → Only one role (Owner)  
- **Customer Management** → Profile, loyalty points, order history  
- **Orders API** → Create orders from mobile app, linked to customers  
- **Dishes API** → Manage restaurant menu & availability  
- **Tables API** → Track availability & reservations  
- **Reports API** → Sales, top dishes, payment breakdown, customer ratings  

---

## 🔑 Environment Variables
Create a `.env` file in the backend root:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=supersecret_key
CLIENT_URL=http://localhost:5173
SALT_ROUNDS=10
```

## 🛠 API Endpoints
```
Auth
- POST /api/auth/register → Register owner (one-time setup)
- POST /api/auth/login → Login and get JWT

Customers
- GET /api/customers → Get all customers (admin only)
- GET /api/customers/:id → Get customer details (admin only)

Orders
- POST /api/orders → Create order (mobile app)
- GET /api/orders → List all orders (admin only)

Tables
- GET /api/tables → Get all tables (admin only)
- POST /api/tables/reserve → Reserve a table (mobile app)
- PUT /api/tables/:id/toggle → Toggle availability (admin only)

Reports
- GET /api/reports/sales → Total sales & orders
- GET /api/reports/top-dishes → Top 5 dishes
- GET /api/reports/payment-modes → Payment mode breakdown
- GET /api/reports/customer-ratings → Average rating per customer
```

## Installation & Running
```
# install dependencies
npm install

# run in dev mode (with nodemon)
npm run dev

# run in production mode
npm start
```

## 👨‍💻 Developer Info
- **Name:** Chirag Vaibhav Rane  
- **Portfolio:** [Portfolio Link](https://chirag-rane.vercel.app)  
- **LinkedIn:** [LinkedIn Profile](https://www.linkedin.com/in/chirag-rane-2a7ba5270/) 