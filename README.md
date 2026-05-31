# Bashatbari Purbachal Development Ltd Web Application

This is a premium, modern, and highly minimalistic full-stack real estate web application built for **Bashatbari Purbachal Development Ltd**. The application features a stunning customer landing page and a secure, powerful admin dashboard.

## Technical Architecture & Features

-   **Frontend**: Built with clean, vanilla HTML5, CSS3, and JavaScript (ES6+). Uses custom CSS variables, responsive CSS grids, glassmorphism UI elements, full-bleed HTML5 background video triggers, and smooth scroll animations.
-   **Backend**: Node.js and Express REST API endpoints with secure JWT authentication and automated email/log alert triggers.
-   **Database**: Designed using MongoDB (via Mongoose).
-   **Dual-Database Adapter (Robust Fallback)**: Runs out of the box with or without an active MongoDB connection. If MongoDB is not running or not configured, it transparently falls back to local JSON database storage located in `server/data/`, meaning the app is **instantly runnable and testable** under any environment.
-   **Auto-Seeding**: Seeds initial real properties from `bashatbari.com` if the database is detected as empty.
-   **Interactive Maps**: Direct iframe integrations for corporate offices (Nikunja-1, Dhaka) and the project location.

---

## Folder Structure

```
bashatbari/
├── public/                 # Frontend client application
│   ├── css/
│   │   ├── styles.css      # Core styles, variables, typography, layouts
│   │   └── admin.css       # Secure dashboard-specific styles
│   ├── js/
│   │   ├── main.js         # Frontend interactive logic and API fetching
│   │   └── admin.js        # Admin dashboard authentication and CRUD operations
│   ├── index.html          # Main customer-facing website
│   └── admin.html          # Admin panel view
├── server/                 # Express backend server
│   ├── config/
│   │   ├── db.js           # Database connection client
│   │   ├── dataStore.js    # Unified data access wrapper (MongoDB / JSON fallback)
│   │   └── seeder.js       # Database initial seed script
│   ├── middleware/
│   │   └── auth.js         # JWT validation middleware
│   ├── models/
│   │   ├── property.js     # Property Mongoose Schema
│   │   └── lead.js         # Lead Mongoose Schema
│   ├── routes/
│   │   ├── auth.js         # Admin authentication route
│   │   ├── properties.js   # Listings CRUD routes
│   │   └── leads.js        # Submissions & statistics routes
│   └── index.js            # Express application entrypoint
├── .env                    # Environment configuration
├── package.json            # Node dependencies
└── README.md               # Documentation (this file)
```

---

## Installation & Setup

1.  Ensure you have **Node.js** (v14+ recommended) installed.
2.  Open your terminal in the project directory (`bashatbari`) and run:
    ```bash
    npm install
    ```
3.  Configure variables in the `.env` file at the root directory:
    -   `PORT`: Port for the server to listen on (default is `5000`).
    -   `MONGODB_URI`: Your MongoDB connection URI. (Optional: if not running, local JSON fallback will be used automatically).
    -   `JWT_SECRET`: Secret key used for signing JWT tokens.
    -   `ADMIN_USERNAME`: Username for dashboard portal access (default: `admin`).
    -   `ADMIN_PASSWORD`: Password for dashboard portal access (default: `admin123`).

---

## Running the Application

Start the full-stack application by running:
```bash
npm start
```

Once running, access:
-   **Customer Homepage**: [http://localhost:5000](http://localhost:5000)
-   **Admin Dashboard**: [http://localhost:5000/admin.html](http://localhost:5000/admin.html) (or click the **"Portal"** link in the navbar)

---

## Admin Portal Authentication

Log in to the portal using your credentials:
*   **Username**: `admin` (or the value set in `.env`)
*   **Password**: `admin123` (or the value set in `.env`)

### Managing the Portal:
1.  **Properties Tab**: Create, edit, and delete plot listings. All changes update on the home page in real time.
2.  **Customer Leads Tab**: View client contact inquiries, time stamps, referenced properties, and update their statuses (New, Contacted, Closed, Discarded).
