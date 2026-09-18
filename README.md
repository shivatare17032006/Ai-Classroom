# AI-Enabled Classroom & Academic Management System

An Enterprise Academic Management, Automated AI Grading, and B2B License Monetization Platform built with **Spring Boot**, **PostgreSQL**, and **React**.

---

## System Overview

The platform provides a comprehensive learning management ecosystem connecting educational institutions, educators, and students. It integrates automated AI essay and code evaluation (powered by Gemini 3.5 Pro), academic integrity checks, individual deadline extension management, and institutional B2B subscription licensing.

---

## Key Feature Modules

### 1. System Administration & B2B SaaS Hub (`ADMIN`)
- **Institutional Domain Licensing**: Register and whitelist enterprise domain extensions (e.g., `@vit.edu`, `@coep.edu.in`) with custom pricing in **₹ INR**.
- **Automated AI Access Unlock**: Users signing up with whitelisted institutional email domains automatically receive site-wide enterprise AI features.
- **Monetization & Growth Metrics**: Track Annual Recurring Revenue (ARR), Monthly Recurring Revenue (MRR), and active institutional subscription counts in real time.
- **Academic Governance**: Global plagiarism similarity thresholds and automated parent notification triggers.

### 2. Educator & Course Evaluation Portal (`TEACHER`)
- **Classroom Management**: Create courses, generate unique enrollment codes, and post course announcements.
- **AI Automated Grading**: Perform AI rubric-based evaluation, similarity detection, and manual score overrides.
- **Centralized Review Hub**: Monitor submitted work, missed assignments, and pending reviews across classrooms.
- **Deadline Extension Management**: Grant student-specific deadline extensions with custom reasons and grace periods.
- **Certificate Management**: Generate and issue verified academic certificates to top-performing students.

### 3. Student Learning & Submission Hub (`STUDENT`)
- **Classroom Enrollment**: Join classrooms using instructor-provided class codes.
- **Coursework & Submissions**: View upcoming, completed, and missing assignments; upload submissions with rubric guidelines.
- **Certificate Vault**: Access, verify, and store issued academic achievements and certificates.

---

## Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Modern Responsive Vanilla CSS
- **Backend**: Spring Boot 3.x, Java 21, Spring Data JPA, Hibernate REST APIs
- **Database**: PostgreSQL 18
- **AI Integration**: Gemini 3.5 Pro Enterprise Engine

---

## Demonstration Credentials

| Role | Email | Password | Primary Interface |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@classroom.edu` | `admin123` | SaaS Monetization & Domain Licensing Hub |
| **Lead Educator** | `dr.sharma@vit.edu` | `teacher123` | Classrooms, AI Review Hub & Extensions |
| **Student** | `rohan.gupta@vit.edu` | `student123` | Coursework, Submissions & Certificate Locker |

---

## Installation & Running Locally

### Backend Setup
1. Ensure **PostgreSQL 18** is running and database `aiclassroomdb` is created.
2. Navigate to the backend directory and execute:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *Spring Boot will launch on `http://localhost:8080/api`.*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Vite development server will launch on `http://localhost:5173/`.*

---

## Main API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/licenses` | List all institutional domain subscriptions |
| `POST` | `/api/licenses` | Create a new B2B domain license |
| `PUT` | `/api/licenses/{id}/toggle` | Activate or suspend an institutional license |
| `GET` | `/api/classrooms` | Fetch active classrooms |
| `POST` | `/api/classrooms/join` | Join a classroom via 6-digit code |
| `GET` | `/api/assignments` | Retrieve course assignments |
| `POST` | `/api/submissions` | Submit student coursework |
| `POST` | `/api/submissions/{id}/review` | Finalize teacher grade and AI feedback |
| `POST` | `/api/extensions` | Grant student-specific deadline extensions |
| `POST` | `/api/announcements` | Post course announcement |
