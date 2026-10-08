# Cognifyz Web Development Internship — Level 3, Task 5
## API Integration and Front-End Interaction

### Project Overview
This project extends the Student Academic Portal by introducing RESTful server-client communication, persistent JSON database storage, and a responsive CRUD Management Dashboard. It integrates full CRUD operations (`GET`, `POST`, `PUT`, `DELETE`) with the front-end using JavaScript `fetch()`, while preserving all Task 4 features including complex form validation, real-time password strength evaluation, live preview DOM updates, and hash-based SPA routing.

---

### RESTful API Documentation

#### 1. Retrieve All Registrations
- **Endpoint**: `GET /api/registrations`
- **Description**: Returns a list of all student registration records stored in the persistent database.
- **Request Body**: None
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": "reg_101",
        "name": "Aarav Sharma",
        "email": "aarav.sharma@college.edu",
        "phone": "9876543210",
        "age": 20,
        "course": "B.E. Computer Science and Engineering",
        "createdAt": "2026-10-01T10:30:00.000Z",
        "updatedAt": "2026-10-01T10:30:00.000Z"
      }
    ]
  }
  ```

#### 2. Retrieve Single Registration by ID
- **Endpoint**: `GET /api/registrations/:id`
- **Description**: Returns detailed record for a single student registration matching the provided ID.
- **Request Body**: None
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "reg_101",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@college.edu",
      "phone": "9876543210",
      "age": 20,
      "course": "B.E. Computer Science and Engineering"
    }
  }
  ```
- **Error Response (404 Not Found)**:
  ```json
  {
    "success": false,
    "message": "Registration not found with ID: reg_999"
  }
  ```

#### 3. Create New Registration
- **Endpoint**: `POST /api/registrations`
- **Description**: Validates input data, generates a unique ID, and saves a new student record to persistent storage.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@college.edu",
    "phone": "9876543211",
    "age": 21,
    "course": "B.Tech Information Technology",
    "password": "SecurePassword123!"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration created successfully",
    "data": {
      "id": "reg_1728392120000_542",
      "name": "Jane Doe",
      "email": "jane.doe@college.edu",
      "phone": "9876543211",
      "age": 21,
      "course": "B.Tech Information Technology",
      "createdAt": "2026-10-08T15:20:00.000Z"
    }
  }
  ```
- **Error Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": [
      "Phone number must be a valid 10-digit mobile number starting with 6, 7, 8, or 9."
    ]
  }
  ```

#### 4. Update Existing Registration
- **Endpoint**: `PUT /api/registrations/:id`
- **Description**: Updates fields of an existing registration record matching the given ID.
- **Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane.smith@college.edu",
    "phone": "9876543211",
    "age": 22,
    "course": "B.E. Computer Science and Engineering"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Registration updated successfully",
    "data": {
      "id": "reg_1728392120000_542",
      "name": "Jane Smith",
      "email": "jane.smith@college.edu",
      "phone": "9876543211",
      "age": 22,
      "course": "B.E. Computer Science and Engineering",
      "updatedAt": "2026-10-08T15:25:00.000Z"
    }
  }
  ```

#### 5. Delete Registration
- **Endpoint**: `DELETE /api/registrations/:id`
- **Description**: Removes the student registration record matching the specified ID from persistent storage.
- **Request Body**: None
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Registration deleted successfully",
    "id": "reg_1728392120000_542"
  }
  ```

---

### Key Features Implemented

1. **RESTful API Backend**: Express.js server providing complete CRUD routes with standard HTTP status codes (`200`, `201`, `400`, `404`, `500`) and JSON responses.
2. **Persistent Storage Engine**: Managed JSON database (`services/db.js` & `data/registrations.json`) ensuring data persists across server restarts.
3. **Interactive CRUD Dashboard**: Responsive interface featuring data table, real-time search filter, Edit modal (`PUT`), Delete modal (`DELETE`), loading spinner, empty state, and toast notifications.
4. **Task 4 Compatibility Preserved**: Includes real-time form validation, password strength progress bar, password requirement checklist, name character counter, live preview card, and SPA hash routing.

---

### How to Run the Project

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Express server:
   ```bash
   node server.js
   ```
3. Open in your browser:
   - **Portal & Form**: `http://localhost:3000/#register`
   - **CRUD Dashboard**: `http://localhost:3000/#dashboard`
