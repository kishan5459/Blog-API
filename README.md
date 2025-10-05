<h1 align="center">📝 Blog API - TypeScript, Express & MongoDB 📝</h1>

<p align="left" style="font-size:small"><i>[Public version of <code>mern-projects/blog_api</code>]</i></p>

Check out the live API: [https://blog-api-taer.onrender.com](https://blog-api-taer.onrender.com)

---

## Overview

Blog API is a **secure, scalable, and high-performance RESTful API** built with **TypeScript, Express, and MongoDB**.  
It provides full **CRUD operations for blogs**, **user authentication**, and **role-based access control** for admins and regular users.  

Frontend with ReactJS for this api is in progress.

> ⚠️ **Note:** This API is deployed on Render's free tier. The server may take some time to start if it has been inactive, so the first request after inactivity may be slightly delayed.

---

## Highlights

- 🔐 **User Authentication & Authorization**
  - JWT-based authentication
  - Password hashing with bcrypt
  - Role-based access control (admin & user)
  - Cookie-based session handling for refresh tokens

- 📝 **Blog Management**
  - CRUD operations for blogs
  - Draft and published statuses
  - Slug-based fetching
  - Commenting and liking system

- 🗂️ **Media & File Uploads**
  - Image uploads with Multer
  - Cloudinary integration for optimized media storage

- 🛡️ **Security & Validation**
  - Helmet for securing HTTP headers
  - CORS for cross-origin requests
  - Express-rate-limit to prevent abuse
  - Input sanitization with express-validator & DOMPurify

- ⚡ **Performance & Scalability**
  - Redis caching (ioredis) for faster responses
  - Data compression with compression middleware
  - Efficient query handling with Mongoose
  - Async/await with Express v5 middleware

- 🧰 **Logging & Monitoring**
  - Request and error logging using Winston
  - integration with Telemetry(formerly Logtail) for centralized logs

- 🔧 **Environment & Config**
  - Configuration management with dotenv
  - Easily switch between development, staging, and production

---

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, MongoDB, Redis
- **Authentication:** JWT, bcrypt
- **File Storage:** Multer + Cloudinary
- **Validation & Security:** express-validator, DOMPurify, Helmet, CORS
- **Logging:** Winston, Telemetry(Logtail)
- **Caching:** Redis (ioredis)
- **Middleware:** Compression, Async Express Handlers

---