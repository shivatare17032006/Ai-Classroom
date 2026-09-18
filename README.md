# AI-Enabled Classroom & Academic Management System

An Enterprise Academic Management, Automated AI Grading, and B2B License Monetization Platform built with **Spring Boot**, **PostgreSQL**, and **React**.

---

## System Overview

The platform provides a comprehensive learning management ecosystem connecting educational institutions, educators, and students. It integrates automated AI essay and code evaluation (powered by Gemini 3.5 Pro), academic integrity checks, individual deadline extension management, and institutional B2B subscription licensing.

---

## Key Feature Modules

### 1. System Administration & B2B SaaS Hub (`ADMIN`)
- **Institutional Domain Licensing**: Register and whitelist enterprise domain extensions (e.g., `@vit.edu`) with custom pricing in **₹ INR**.
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

