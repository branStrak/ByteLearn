# ByteLearn — Enterprise-Grade Learning Management Ecosystem

ByteLearn is a high-performance, full-stack Learning Management System (LMS) engineered to bridge the gap between students, educators, and administrators. Built with a focus on data integrity, professional aesthetics, and automated pedagogy, the platform features atomic financial transactions, AI-assisted mentorship, and a headless-browser graduation engine.

**🌐 Live Platform:** [bytelearn.arthapulse.app](https://bytelearn.arthapulse.app)

---

## 🚀 System Architecture & Portals

### 👨‍🎓 Student Experience

- **Intelligent Dashboard**: Real-time progress aggregation across all enrolled courses using high-performance MongoDB pipelines.
- **Rich Curriculum Viewer**: Seamless consumption of video lectures (Cloudinary), markdown documentation, and downloadable resources.
- **Assessment Sandbox**: Secure, timed quiz environments with state-persistence (Resume capability) and server-side grading.
- **Assignment Lifecycle**: Professional file submission system with cloud storage and automated email notifications for graded work.
- **Communication Hub**: Direct line to instructors for course-specific queries with AI-enhanced response times.

### 👨‍🏫 Educator Command Center

- **Curriculum Architect**: Modular drag-and-drop course builder supporting complex nested structures (Modules -> Lessons/Quizzes/Assignments).
- **Live Roster Analytics**: Dynamic calculation of "Live Grades" using weighted averages based on custom educator-defined configurations.
- **Collaborative Teaching**: Secure invitation system for adding co-instructors with granular permission checks.
- **Financial Intelligence**: Automated revenue tracking with an 80/20 platform-educator split and atomic wallet balance management.
- **AI Drafting Engine**: Integrated LLM assistance for generating direct, analogous, or encouraging feedback to students.

### 🛡️ Admin Orchestration

- **Identity Management**: Centralized control to block/unblock accounts and manage platform-wide user status.
- **Curated Marketplace**: Multi-stage approval workflow for new courses and educator applications.
- **Financial Auditing**: End-to-end oversight of payout queues, platform profit aggregation, and transaction history.

---

## 🛠️ Detailed Technology Stack

### Backend (Node.js & Express)

- **Mongoose**: Advanced schema modeling with custom validation and atomic transactions.
- **Puppeteer**: Headless Chrome engine for server-side professional PDF generation.
- **JWT & Bcrypt**: Stateless identity management and cryptographic password hashing.
- **Razorpay SDK**: Full-cycle payment integration with automated settlement logic.
- **Multer & Cloudinary**: Stream-based multimedia handling and optimized cloud storage.
- **Nodemailer**: Trigger-based HTML email engine for scorecard and certificate delivery.

### Frontend (React & Tailwind)

- **Vite**: Next-generation frontend tooling for optimized development and production builds.
- **Framer Motion**: Advanced micro-animations and smooth page transitions.
- **Recharts**: Interactive data visualization for financial and progress analytics.
- **Monaco Editor**: Integrated VS Code-like coding environment for programming courses.
- **Tailwind CSS**: Utility-first styling for a premium, high-contrast UI/UX.
- **Docker**: Full-stack containerization for consistent development and deployment.

---

## 💎 Advanced Engineering Features

### 1. The Graduation Engine

Utilizes **Puppeteer** to render custom-designed HTML/CSS certificates into A4 PDFs. These certificates feature dynamic student data, serial IDs, and educator signatures, streamed directly to Cloudinary without local storage overhead.

### 2. Stateless OTP Verification

Implements a cryptographically signed JWT-based OTP system. This eliminates the need for database storage during the registration/recovery phase, significantly reducing database I/O.

### 3. Atomic Revenue Distribution

All course sales are processed inside **MongoDB Sessions**. The 80% educator cut is automatically split among the primary owner and co-instructors in a single atomic operation, ensuring no financial discrepancies.

### 4. Judge0 Code Compilation

Integrated sandbox execution for programming assignments, allowing students to run and test code in real-time within the platform safely.

---

## 📦 Installation & Configuration

### Prerequisites

- Node.js (v18+)
- MongoDB Cluster
- Cloudinary Account
- Razorpay API Credentials
- OpenAI/Gemini API Key (For AI Drafts)

### Environment Variables

Create a `.env` file in the `/backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
RAZORPAY_KEY_ID=key
RAZORPAY_KEY_SECRET=secret
EMAIL_USER=your_email
EMAIL_PASS=app_password
FRONTEND_URL=https://bytelearn.arthapulse.app
```

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   ```
2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🐳 Docker Support

ByteLearn is fully containerized, allowing you to run the entire stack with minimal setup. Both services include optimized Dockerfiles for production-grade environments.

### **Backend (API & Pedagogy Engine)**

Includes a pre-configured Chromium environment for Puppeteer-based certificate generation.

```bash
# Build the image
cd backend
docker build -t bytelearn-backend .

# Run the container
docker run -p 5000:5000 --env-file .env bytelearn-backend
```

### **Frontend (Vite & Nginx)**

```bash
# Build the image
cd frontend
docker build -t bytelearn-frontend .

# Run the container
docker run -p 80:80 bytelearn-frontend
```

---

## 🌐 Deployment

ByteLearn is architected for cloud-native deployment.

### **Frontend (Vercel)**

The React application is optimized for **Vercel**, leveraging its global Edge Network for ultra-fast load times.

- **Platform**: [Vercel](https://vercel.com)
- **Deployment URL**: [bytelearn.arthapulse.app](https://bytelearn.arthapulse.app)

### **Backend (Render)**

The Node.js/Express server is hosted on **Render**, providing automated deployments and seamless horizontal scaling.

- **Platform**: [Render](https://render.com)
- **Environment**: Production (Web Service)

---

## 📧 Contact & Support

For collaboration or technical support, please reach out via the official platform at [bytelearn.arthapulse.app](https://bytelearn.arthapulse.app).

