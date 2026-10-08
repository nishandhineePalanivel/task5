/**
 * Cognifyz Web Development Internship - Level 3, Task 5
 * RESTful API & Server Application (Express.js + EJS + Persistent JSON Storage)
 */

const express = require("express");
const path = require("path");
const DatabaseService = require("./services/db");

const app = express();

// Configure View Engine (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware for parsing JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public folder (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Initialize Database Storage on Server Startup
DatabaseService.init().then(() => {
  console.log("Database persistent storage initialized successfully.");
});

/* ==========================================================================
   RESTFUL API ENDPOINTS (/api/registrations)
   ========================================================================== */

/**
 * Server-Side Validation Helper Function
 */
function validateRegistrationPayload(data) {
  const errors = [];

  // Name
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long.");
  } else if (/^\d+$/.test(data.name.trim())) {
    errors.push("Name cannot consist of numbers only.");
  }

  // Email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.push("Please provide a valid email address.");
  }

  // Phone
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!data.phone || !phoneRegex.test(data.phone.trim())) {
    errors.push("Phone number must be a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
  }

  // Age
  const ageNum = parseInt(data.age, 10);
  if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
    errors.push("Age must be a valid number between 16 and 100.");
  }

  // Course
  if (!data.course || typeof data.course !== 'string' || data.course.trim() === '') {
    errors.push("Please select an engineering course.");
  }

  return errors;
}

// 1. GET /api/registrations - Retrieve all registration records
app.get("/api/registrations", async (req, res) => {
  try {
    const registrations = await DatabaseService.getAll();
    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (err) {
    console.error("GET /api/registrations error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching registrations."
    });
  }
});

// 2. GET /api/registrations/:id - Retrieve single registration by ID
app.get("/api/registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const record = await DatabaseService.getById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: `Registration not found with ID: ${id}`
      });
    }
    return res.status(200).json({
      success: true,
      data: record
    });
  } catch (err) {
    console.error(`GET /api/registrations/${req.params.id} error:`, err);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching registration."
    });
  }
});

// 3. POST /api/registrations - Create a new registration record
app.post("/api/registrations", async (req, res) => {
  try {
    const errors = validateRegistrationPayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

    const createdRecord = await DatabaseService.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Registration created successfully",
      data: createdRecord
    });
  } catch (err) {
    console.error("POST /api/registrations error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error creating registration."
    });
  }
});

// 4. PUT /api/registrations/:id - Update existing registration record
app.put("/api/registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await DatabaseService.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Cannot update. Registration not found with ID: ${id}`
      });
    }

    const errors = validateRegistrationPayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

    const updatedRecord = await DatabaseService.update(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Registration updated successfully",
      data: updatedRecord
    });
  } catch (err) {
    console.error(`PUT /api/registrations/${req.params.id} error:`, err);
    return res.status(500).json({
      success: false,
      message: "Internal server error updating registration."
    });
  }
});

// 5. DELETE /api/registrations/:id - Delete registration record
app.delete("/api/registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DatabaseService.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Cannot delete. Registration not found with ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Registration deleted successfully",
      id: id
    });
  } catch (err) {
    console.error(`DELETE /api/registrations/${req.params.id} error:`, err);
    return res.status(500).json({
      success: false,
      message: "Internal server error deleting registration."
    });
  }
});

/* ==========================================================================
   PAGE ROUTES & SERVING VIEWS
   ========================================================================== */

// GET / - Render main SPA view
app.get("/", (req, res) => {
  res.render("index", { error: null, successMessage: null, contactSuccess: null, formData: {} });
});

// POST /submit - Legacy server-side form submission support
app.post("/submit", async (req, res) => {
  const { name, email, phone, age, course } = req.body;

  if (!name || !email || !age || !course || name.trim() === "" || email.trim() === "") {
    return res.status(400).render("index", {
      error: "All registration fields are required. Please provide valid inputs.",
      successMessage: null,
      contactSuccess: null,
      formData: { name, email, phone, age, course }
    });
  }

  const record = await DatabaseService.create({ name, email, phone: phone || '9876543210', age, course });

  res.render("result", {
    name: record.name,
    email: record.email,
    age: record.age.toString(),
    course: record.course
  });
});

// POST /contact - Contact form route
app.post("/contact", (req, res) => {
  const { contactName, contactEmail, subject, message } = req.body;

  if (!contactName || !contactEmail || !message || contactName.trim() === "" || contactEmail.trim() === "") {
    return res.status(400).render("index", {
      error: "Please complete all required fields in the contact form.",
      successMessage: null,
      contactSuccess: null,
      formData: {}
    });
  }

  res.render("index", {
    error: null,
    successMessage: null,
    contactSuccess: `Thank you, ${contactName.trim()}! Your message regarding "${subject || 'General Inquiry'}" has been sent successfully. Our academic team will respond shortly.`,
    formData: {}
  });
});

// Port configuration
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Task 5 REST API Server running on http://localhost:${PORT}`);
});
