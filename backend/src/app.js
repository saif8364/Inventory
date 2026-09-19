const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/error.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const subcategoryRoutes = require('./routes/subcategory.routes');
const itemRoutes = require('./routes/item.routes');
const permissionRoutes = require('./routes/permission.routes');
const historyRoutes = require('./routes/history.routes');

const app = express();

// ─── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Serve frontend static files ────────────────────────
app.use(express.static(path.join(__dirname, '../../frontend')));

// ─── API Routes ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/history', historyRoutes);

// ─── Dashboard route (uses item controller) ─────────────
const { authenticate } = require('./middleware/auth.middleware');
const itemController = require('./controllers/item.controller');
app.get('/api/dashboard', authenticate, itemController.getDashboardStats);

// ─── Catch-all for SPA-like navigation ──────────────────
app.get(/^\/(?!api).*/, (req, res) => {
  const requestedFile = path.join(__dirname, '../../frontend', req.path);
  res.sendFile(requestedFile, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, '../../frontend/index.html'));
    }
  });
});

// ─── Error handler (must be last) ───────────────────────
app.use(errorHandler);

module.exports = app;
