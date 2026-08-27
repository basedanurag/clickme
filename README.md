# ClickMe 🔗

ClickMe is a developer-friendly, AI-powered smart URL management platform built for speed, advanced analytics, and custom branding. It offers a premium SaaS experience for shortening links, tracking granular device/geographic analytics, and generating QR codes.

## 🚀 Features

- **Link Shortening**: Generate concise, shareable URLs instantly.
- **Custom Aliases**: Claim custom branding for your links (e.g., `clickme.app/my-campaign`).
- **Advanced Analytics**: Track clicks, operating systems, browsers, and referrers globally using the highly robust YAUAA tracking engine.
- **QR Code Generation**: Automatically generate and download QR codes for any short link.
- **Modern SaaS UI**: A beautiful, fully responsive frontend featuring Dark Mode, micro-animations, and data visualizations.
- **Secure Authentication**: JWT-based session management and highly secure password hashing.

## 🛠️ Tech Stack

**Frontend**
- React 18 (Vite)
- TypeScript
- Tailwind CSS
- React Router DOM
- React Hook Form + Zod (Validation)
- Recharts (Analytics Visualizations)
- Lucide React (Icons)

**Backend**
- Java 21
- Spring Boot 3
- Spring Security (JWT)
- Spring Data JPA
- PostgreSQL / MySQL
- Redis (Caching)
- YAUAA (User-Agent Parsing)
- ZXing (QR Code Generation)

## 💻 Local Development

### Prerequisites
- Java 21
- Node.js 18+
- PostgreSQL or MySQL running locally
- Redis server running locally on port 6379

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend/clickme-backend/clickme
   ```
2. Update your `src/main/resources/application.properties` with your local database credentials if they differ from the defaults.
3. Build and run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   *The API will start on `http://localhost:8080`.*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The UI will start on `http://localhost:5173`.*

## ☁️ Deployment

ClickMe is fully configured for cloud deployment. 

**Option 1: Railway (Recommended)**
- Create a new project on [Railway](https://railway.app/).
- Add a PostgreSQL and Redis database to your canvas.
- Connect this GitHub repository. Railway will automatically detect the Java backend and React frontend and build both services instantly.

**Option 2: Render & Netlify**
- **Backend (Render)**: Deploy the Spring Boot app as a Web Service on Render using the provided `Dockerfile`. Set the database URL environment variables to point to Render's free PostgreSQL tier.
- **Frontend (Netlify)**: Connect your repo to Netlify. Set the build command to `npm run build` and the publish directory to `dist`. The included `public/_redirects` file ensures React Router works perfectly in production. Set the `VITE_API_URL` environment variable to your deployed Render URL.

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
