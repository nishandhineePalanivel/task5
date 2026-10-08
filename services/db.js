/**
 * Cognifyz Web Development Internship - Level 3, Task 5
 * Database Service Module: Persistent JSON Storage Manager
 * 
 * Provides persistent asynchronous CRUD operations reading and writing to data/registrations.json.
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'registrations.json');

// Sample Seed Data for initial load
const SEED_REGISTRATIONS = [
  {
    id: "reg_101",
    name: "Aarav Sharma",
    email: "aarav.sharma@college.edu",
    phone: "9876543210",
    age: 20,
    course: "B.E. Computer Science and Engineering",
    createdAt: "2026-10-01T10:30:00.000Z",
    updatedAt: "2026-10-01T10:30:00.000Z"
  },
  {
    id: "reg_102",
    name: "Priya Patel",
    email: "priya.patel@college.edu",
    phone: "9812345678",
    age: 21,
    course: "B.Tech Information Technology",
    createdAt: "2026-10-02T14:15:00.000Z",
    updatedAt: "2026-10-02T14:15:00.000Z"
  },
  {
    id: "reg_103",
    name: "Rohan Verma",
    email: "rohan.v@college.edu",
    phone: "8765432109",
    age: 22,
    course: "B.E. Electronics and Communication Engineering",
    createdAt: "2026-10-05T09:45:00.000Z",
    updatedAt: "2026-10-05T09:45:00.000Z"
  }
];

class DatabaseService {
  /**
   * Ensures data directory and JSON file exist with initial seed data
   */
  static async init() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      try {
        await fs.access(DATA_FILE);
      } catch {
        // File does not exist, initialize with seed data
        await fs.writeFile(DATA_FILE, JSON.stringify(SEED_REGISTRATIONS, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('Error initializing persistent database service:', err);
    }
  }

  /**
   * Read all registration records
   */
  static async getAll() {
    await this.init();
    try {
      const content = await fs.readFile(DATA_FILE, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (err) {
      console.error('Error reading registrations from file:', err);
      return [];
    }
  }

  /**
   * Read single registration record by ID
   */
  static async getById(id) {
    const records = await this.getAll();
    return records.find(r => r.id === id) || null;
  }

  /**
   * Create a new registration record
   */
  static async create(data) {
    const records = await this.getAll();
    const newId = `reg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const newRecord = {
      id: newId,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      age: parseInt(data.age, 10),
      course: data.course.trim(),
      createdAt: now,
      updatedAt: now
    };

    records.unshift(newRecord); // Prepend so latest appears first
    await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
    return newRecord;
  }

  /**
   * Update an existing registration record by ID
   */
  static async update(id, updateData) {
    const records = await this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;

    const existing = records[index];
    const updatedRecord = {
      ...existing,
      name: updateData.name ? updateData.name.trim() : existing.name,
      email: updateData.email ? updateData.email.trim() : existing.email,
      phone: updateData.phone ? updateData.phone.trim() : existing.phone,
      age: updateData.age ? parseInt(updateData.age, 10) : existing.age,
      course: updateData.course ? updateData.course.trim() : existing.course,
      updatedAt: new Date().toISOString()
    };

    records[index] = updatedRecord;
    await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
    return updatedRecord;
  }

  /**
   * Delete a registration record by ID
   */
  static async delete(id) {
    const records = await this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return false;

    records.splice(index, 1);
    await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
    return true;
  }
}

module.exports = DatabaseService;
