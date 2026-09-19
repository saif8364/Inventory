# ⚡ Inventory OS — Physical Hardware & Component Management System

A full-stack, responsive Inventory Management System built specifically for managing physical components such as microcontrollers (Arduino, ESP32, Raspberry Pi), sensors, motors, robotics parts, LEGO kits, and tools.

---

## 🚀 Technologies Used

### **Backend**
- **Node.js** & **Express.js**
- **SQLite** & **Prisma ORM**
- **JWT (JSON Web Tokens)** & **bcrypt**
- Clean 3-tier architecture: **Routes ➔ Controllers ➔ Services ➔ Repositories**

### **Frontend**
- **HTML5**, **Vanilla CSS3**, **Vanilla JavaScript (ES6)**
- **Fetch API** with centralized error handling & JWT interception
- Dark / Light Theme switching with system preference memory
- Glassmorphic login UI, customizable modals, toast notifications & interactive pagination

---

## 🛠️ Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Super Admin**: Full global bypass access, user management, category access permission assignment.
   - **Member Users**: Access scoped strictly to assigned categories and permissions (`VIEW` / `EDIT`).

2. **Category & Sub-Category Hierarchy**:
   - Organize hardware parts under top-level categories (e.g. *Electronics, Robotics, LEGO, Tools*) and nested sub-categories.

3. **Stock Quantity & Inventory Tracking**:
   - Add/edit/delete items with specs, pinouts, bin locations, and stock levels.
   - Dynamic Low Stock badges (&le; 5 units).

4. **Complete Audit Trail & History**:
   - Automatic record logging for every `CREATE`, `UPDATE`, `DELETE`, and `QUANTITY_CHANGE` event.

5. **Category-Level Permissions Matrix**:
   - Granular `NONE`, `VIEW`, `EDIT` permission configuration per user per category.

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Seed Database
```bash
node prisma/seed.js
```

### 3. Run Application
```bash
npm run dev
# or
node src/server.js
```

App will be available at: **`http://localhost:5000`**

---

## 🔑 Default Credentials

- **Email**: `admin@inventory.com`
- **Password**: `Admin123!`
- **Role**: `SUPER_ADMIN`
