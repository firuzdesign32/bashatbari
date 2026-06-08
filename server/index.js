require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
const seedDatabase = require('./config/seeder');

const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const leadRoutes = require('./routes/leads');
const settingsRoutes = require('./routes/settings');
const blogRoutes = require('./routes/blogs');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const teamMemberRoutes = require('./routes/teamMembers');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static client assets (includes uploaded files served from public/)
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/team-members', teamMemberRoutes);

// Catch-all route to serve the SPA customer homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Admin panel route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await db.connectDB();
  
  // Seeds listings, settings, blogs, and jobs if empty
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Bashatbari Full-Stack Server Running on Port: ${PORT}`);
    console.log(`👉 Main App URL:   http://localhost:${PORT}`);
    console.log(`👉 Admin Panel:    http://localhost:${PORT}/admin.html`);
    console.log(`==================================================`);
  });
}

startServer();
