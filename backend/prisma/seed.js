const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Super Admin ────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@inventory.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName = process.env.ADMIN_NAME || 'Super Admin';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  let admin;
  if (existingAdmin) {
    console.log(`  ✓ Super Admin already exists: ${adminEmail}`);
    admin = existingAdmin;
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password_hash: passwordHash,
        role: 'SUPER_ADMIN',
        is_active: true,
      },
    });
    console.log(`  ✓ Super Admin created: ${adminEmail}`);
  }

  // ─── Categories ─────────────────────────────────────────
  const categoriesData = [
    { name: 'Electronics', description: 'Electronic components, boards, and modules' },
    { name: 'Robotics', description: 'Robotics parts, actuators, and mechanical components' },
    { name: 'LEGO', description: 'LEGO kits, technic parts, and building components' },
    { name: 'Tools', description: 'Hand tools, power tools, and measurement equipment' },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const existing = await prisma.category.findUnique({ where: { name: cat.name } });
    if (existing) {
      categories[cat.name] = existing;
      console.log(`  ✓ Category exists: ${cat.name}`);
    } else {
      categories[cat.name] = await prisma.category.create({
        data: { ...cat, created_by: admin.id },
      });
      console.log(`  ✓ Category created: ${cat.name}`);
    }
  }

  // ─── Sub-categories ─────────────────────────────────────
  const subcategoriesData = [
    { name: 'Microcontrollers', description: 'Arduino, ESP32, Raspberry Pi boards', category: 'Electronics' },
    { name: 'Sensors', description: 'Temperature, ultrasonic, IR, and other sensors', category: 'Electronics' },
    { name: 'Motors', description: 'DC motors, stepper motors, servo motors', category: 'Electronics' },
    { name: 'Motor Drivers', description: 'L298N, L293D, and other motor controllers', category: 'Electronics' },
    { name: 'Wires & Connectors', description: 'Jumper wires, breadboards, connectors', category: 'Electronics' },
    { name: 'Displays', description: 'LCD, OLED, LED displays', category: 'Electronics' },
    { name: 'Actuators', description: 'Linear actuators, pneumatic components', category: 'Robotics' },
    { name: 'Frames & Chassis', description: 'Robot frames, chassis, and structural parts', category: 'Robotics' },
    { name: 'Controllers', description: 'Robotic controllers and driver boards', category: 'Robotics' },
    { name: 'LiDAR & Vision', description: 'LiDAR modules, cameras, depth sensors', category: 'Robotics' },
    { name: 'Technic', description: 'LEGO Technic beams, gears, and axles', category: 'LEGO' },
    { name: 'Mindstorms', description: 'LEGO Mindstorms EV3 and SPIKE components', category: 'LEGO' },
    { name: 'Hand Tools', description: 'Screwdrivers, pliers, wire strippers', category: 'Tools' },
    { name: 'Power Tools', description: 'Drills, soldering irons, heat guns', category: 'Tools' },
    { name: 'Measurement', description: 'Multimeters, calipers, oscilloscopes', category: 'Tools' },
  ];

  const subcategories = {};
  for (const sub of subcategoriesData) {
    const categoryId = categories[sub.category].id;
    const existing = await prisma.subCategory.findUnique({
      where: { name_category_id: { name: sub.name, category_id: categoryId } },
    });
    if (existing) {
      subcategories[sub.name] = existing;
      console.log(`  ✓ Sub-category exists: ${sub.name}`);
    } else {
      subcategories[sub.name] = await prisma.subCategory.create({
        data: {
          name: sub.name,
          description: sub.description,
          category_id: categoryId,
          created_by: admin.id,
        },
      });
      console.log(`  ✓ Sub-category created: ${sub.name}`);
    }
  }

  // ─── Sample Items ───────────────────────────────────────
  const itemsData = [
    { name: 'ESP32 DevKit V1', category: 'Electronics', subcategory: 'Microcontrollers', description: 'ESP32 development board with WiFi and Bluetooth', quantity: 15 },
    { name: 'Arduino Uno R3', category: 'Electronics', subcategory: 'Microcontrollers', description: 'ATmega328P-based microcontroller board', quantity: 10 },
    { name: 'Raspberry Pi 4 Model B', category: 'Electronics', subcategory: 'Microcontrollers', description: '4GB RAM single-board computer', quantity: 5 },
    { name: 'HC-SR04 Ultrasonic Sensor', category: 'Electronics', subcategory: 'Sensors', description: 'Ultrasonic distance sensor, 2cm–400cm range', quantity: 20 },
    { name: 'DHT22 Temperature Sensor', category: 'Electronics', subcategory: 'Sensors', description: 'Digital temperature and humidity sensor', quantity: 12 },
    { name: 'MG996R Servo Motor', category: 'Electronics', subcategory: 'Motors', description: 'High torque metal gear servo motor', quantity: 8 },
    { name: 'L298N Motor Driver', category: 'Electronics', subcategory: 'Motor Drivers', description: 'Dual H-Bridge motor driver module', quantity: 6 },
    { name: 'RPLIDAR A1', category: 'Robotics', subcategory: 'LiDAR & Vision', description: '360-degree laser scanner, 12m range', quantity: 3 },
    { name: '4WD Robot Chassis Kit', category: 'Robotics', subcategory: 'Frames & Chassis', description: 'Aluminum chassis with 4 DC motors and wheels', quantity: 4 },
    { name: 'LEGO Technic Beam 15L', category: 'LEGO', subcategory: 'Technic', description: 'Standard 15-hole Technic beam', quantity: 50 },
    { name: 'LEGO Mindstorms EV3 Brick', category: 'LEGO', subcategory: 'Mindstorms', description: 'Programmable EV3 intelligent brick', quantity: 2 },
    { name: 'Hakko FX-888D Soldering Station', category: 'Tools', subcategory: 'Power Tools', description: 'Digital soldering station with adjustable temperature', quantity: 3 },
    { name: 'Fluke 117 Multimeter', category: 'Tools', subcategory: 'Measurement', description: 'True-RMS digital multimeter', quantity: 4 },
  ];

  for (const item of itemsData) {
    const categoryId = categories[item.category].id;
    const subcategoryId = subcategories[item.subcategory]?.id || null;

    // Check if item with same name and category exists
    const existing = await prisma.item.findFirst({
      where: { name: item.name, category_id: categoryId },
    });

    if (existing) {
      console.log(`  ✓ Item exists: ${item.name}`);
    } else {
      const created = await prisma.item.create({
        data: {
          name: item.name,
          category_id: categoryId,
          sub_category_id: subcategoryId,
          description: item.description,
          quantity: item.quantity,
        },
      });

      // Record creation in history
      await prisma.inventoryHistory.create({
        data: {
          item_id: created.id,
          user_id: admin.id,
          action: 'CREATE',
          old_quantity: null,
          new_quantity: created.quantity,
        },
      });

      console.log(`  ✓ Item created: ${item.name} (qty: ${item.quantity})`);
    }
  }

  console.log('\n✅ Seed completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
