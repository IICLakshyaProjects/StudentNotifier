# TASK.md — Student Notification System (Next.js + JWT + MongoDB + Infinito)

## 0. Goal

Build a system to:

* Authenticate users (JWT)
* Send WhatsApp + Email (single + bulk)
* Upload CSV/Excel for bulk messaging
* Store all data in MongoDB
* Protect routes based on roles (admin/user)

---

## 1. Project Setup

### 1.1 Create project

```bash
npx create-next-app@latest student-notifier
cd student-notifier
npm install
```

### 1.2 Install dependencies

```bash
npm install mongoose jsonwebtoken bcryptjs multer csv-parser xlsx nodemailer axios dotenv
```

---

## 2. Environment Variables (.env)

```env
DATABASE_URL=your_mongodb_url

JWT_SECRET=your_access_secret
JWT_EXPIRATION=1h

JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRATION=7d

INFINITO_API_KEY=your_api_key
INFINITO_BASE_URL=your_api_url

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

---

## 3. Folder Structure

```
/src
 ├── app
 │   ├── api
 │   │   ├── auth
 │   │   ├── message
 │   │   ├── upload
 │   ├── dashboard
 ├── lib
 │   ├── db.js
 │   ├── jwt.js
 │   ├── infinito.js
 │   ├── mailer.js
 ├── models
 │   ├── User.js
 │   ├── Message.js
 ├── middleware
 │   ├── auth.js
```

---

## 4. Database Setup

### 4.1 Mongo Connection

`/src/lib/db.js`

* Connect using mongoose
* Use global caching (avoid multiple connections)

---

## 5. Models

### 5.1 User Model

Fields:

* name
* email (unique)
* password (hashed)
* role (admin | user)

### 5.2 Message Model

Fields:

* studentName
* parentName
* email
* whatsapp
* campus
* date
* time
* location
* status (pending/sent/failed)
* createdBy (userId)

---

## 6. Authentication (JWT) ✅ Completed

### 6.1 Features

* Register
* Login
* Refresh token
* Password hashing (bcrypt)

### 6.2 Token Strategy

* Access Token → short expiry
* Refresh Token → long expiry

---

## 7. Middleware (Route Protection) ✅ Completed

### 7.1 Auth Middleware

* Verify JWT
* Attach user to request


---

## 8. Messaging System

## 8.1 Template

```
Hi {{1}}, your counselling session is confirmed.

Campus: {{2}}
Date: {{3}}
Time: {{4}}

Location: {{5}}

Please keep your admission card ready and confirm once received.
```

### 8.2 Template Replace Function

* Replace placeholders dynamically from input

---

## 9. Infinito Integration (WhatsApp)

### 9.1 Single Message API

* Input: student data
* Send formatted message

### 9.2 Bulk Message API

* Loop through dataset
* Send one by one (avoid rate limit)
* Log success/failure

---

## 10. Email Integration

* Use nodemailer
* Send same message via email
* HTML + plain text version

---

## 11. Single Send API

### Endpoint:

`POST /api/message/send`

### Input:

```
{
  studentName,
  email,
  whatsapp,
  campus,
  date,
  time,
  location
}
```

### Flow:

* Validate input
* Save to DB
* Send WhatsApp (Infinito)
* Send Email
* Update status

---

## 12. Bulk Upload (CSV / Excel)

### Endpoint:

`POST /api/upload`

### Steps:

1. Upload file (multer)
2. Parse CSV (csv-parser) or Excel (xlsx)
3. Validate columns:

   * email
   * Student Name
   * Parent Name
   * WhatsApp No
   * Campus
   * Date
   * Time
   * Location Link
4. Convert rows → JSON
5. Store in DB
6. Trigger bulk send

---

## 13. Bulk Send Logic

* Process in batches (e.g., 50 records)
* Add delay between requests (avoid blocking)
* Log failures separately

---

## 14. Dashboard (Basic UI)

### Pages:

* Login
* Send Single Message
* Upload Bulk File
* View Logs

---

## 15. Security Requirements

* Never expose secrets in frontend
* Use `.env` only
* Hash passwords
* Validate all inputs
* Limit request rate (basic)

---

## 16. Testing Checklist

* Register/login works
* JWT expires correctly
* Protected routes blocked without token
* Admin-only routes enforced
* Single message sends correctly
* Bulk upload parses correctly
* Failed messages are tracked

---

## 17. Final Output

System should:

* Authenticate users
* Allow role-based access
* Send WhatsApp + Email (single + bulk)
* Accept CSV/Excel uploads
* Store all records in MongoDB
* Track message status

---

## 18. Common Pitfalls (Fix these or it will break)

* Sending all bulk messages at once → will fail (rate limit)
* Not handling API failures → data inconsistency
* Storing plaintext passwords → security issue
* Not validating CSV → garbage data
* No retry mechanism → lost messages

---

## DONE CRITERIA

Project is complete ONLY IF:

* Auth 
* Single + bulk messaging works
* CSV upload works without crash
* Messages stored with status
* No secrets exposed
* Error handling exists

---
