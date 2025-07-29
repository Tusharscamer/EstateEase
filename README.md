# 🏠 EstateEase

![Node.js](https://img.shields.io/badge/Node.js-Enabled-brightgreen)
![Express](https://img.shields.io/badge/Express.js-Backend-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![License](https://img.shields.io/badge/license-ISC-blue)
![Version](https://img.shields.io/badge/version-1.0.0-yellow)

**EstateEase** is a full-stack real estate management platform built using **Node.js**, **Express.js**, **MongoDB**, and **EJS** templating. It simplifies real estate property management with image uploads, dynamic listings, user sessions, and a modular, maintainable codebase.

---

## 📸 Demo

> 🚧 *Live Demo Not Deployed Yet*  
> Replace this section with a link or screenshots once you deploy the app.

---

## 🔥 Features

- 🏠 **CRUD Operations**: Add, edit, and delete property listings
- ☁️ **Image Upload**: Integrated Cloudinary support for uploading and managing images
- 🧠 **Validation**: Form and data validation using middleware
- 🔐 **Authentication**: Secure, session-based user login
- 🎨 **Frontend Rendering**: EJS templating for responsive, dynamic content
- 🛠 **Modular Structure**: Clean folder structure with controllers, routes, utilities, and configs
- 🗃 **MongoDB + Mongoose**: Robust schema modeling and query handling

---

## 🧱 Tech Stack

| Layer      | Tech                            |
|------------|---------------------------------|
| Backend    | Node.js, Express.js             |
| Frontend   | EJS, Tailwind CSS *(optional)*  |
| Database   | MongoDB (Mongoose ORM)          |
| File Upload| Multer + Cloudinary             |
| Auth       | Express-session                 |
| Utilities  | dotenv, method-override         |

---

## 📦 Installation

### ✅ Prerequisites

- Node.js (v14 or higher)
- npm
- MongoDB Atlas / local MongoDB
- Cloudinary account

### 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/EstateEase.git
cd EstateEase

# Install dependencies
npm install
```

### ⚙️ Configure Environment

Create a `.env` file in the root and add:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
DB_URL=your_mongodb_connection_uri
SESSION_SECRET=your_random_secret_key
```

### ▶️ Run the Server

```bash
node app.js
```

Visit: [http://localhost:5000](http://localhost:5000)

---

## 🧩 Project Structure

```
EstateEase/
├── app.js                # Main server entry
├── cloudConfig.js        # Cloudinary config
├── middleware.js         # Custom middleware
├── schema.js             # Mongoose schemas
├── routes/               # Express route definitions
├── controllers/          # Logic handlers
├── models/               # Database models
├── utils/                # Utility functions
├── public/               # Static files
├── views/ or viewl/      # EJS views
├── config/               # Configuration files
├── .env                  # Env vars (excluded from repo)
├── .gitignore            # Ignored files
├── package.json          # Project metadata
```

---

## 🛠 Scripts

From `package.json`:

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

Feel free to add custom start/build scripts as needed.

---

## 🌟 Future Enhancements

- 🗺 Google Maps for geolocation
- 📧 Email alerts for new listings
- 🧑‍💼 Admin dashboard for user/listing management
- 🔍 Advanced filtering and keyword-based search
- 📱 Fully responsive mobile-first UI

---

## 🤝 Contribution

We welcome contributions! Follow these steps:

1. Fork the repo
2. Create a new branch (`git checkout -b feature-x`)
3. Commit your changes (`git commit -m 'Add feature x'`)
4. Push to the branch (`git push origin feature-x`)
5. Create a Pull Request

---

## 📄 License

Licensed under the [ISC License](LICENSE).

---

## 🙌 Acknowledgments

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Cloudinary](https://cloudinary.com/)
- [EJS Templating](https://ejs.co/)
- [Multer Middleware](https://github.com/expressjs/multer)

---

> Crafted with ❤️ by **jatinbhatia** — EstateEase Project
