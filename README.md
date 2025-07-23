# Full-Stack Blog Application

A modern, responsive blog application built with the MERN stack and TypeScript.

## 🚀 Features

### 👤 User Management

- **User Registration** - Create new accounts with email validation
- **Secure Authentication** - JWT-based login/logout system
- **Profile Management** - Update personal information and settings
- **Password Security** - Change password with old password verification
- **Password Recovery** - Email-based password reset with secure tokens
- **Account Management** - Soft delete user accounts

### 📝 Blog Post Management

- **Rich Content Creation** - Advanced text editor with formatting options
- **Image Upload** - Upload and manage post images with file validation
- **Post Categories** - Organize content by topics (Art, Technology, Food, Travel, etc.)
- **Draft & Publish** - Create and manage blog post lifecycle
- **Post Editing** - Full CRUD operations for post authors
- **Post Deletion** - Soft delete with data integrity
- **Personal Dashboard** - View and manage all your posts

### 🔍 Content Discovery

- **Browse All Posts** - Paginated view of all published content
- **Category Filtering** - Filter posts by specific categories
- **Search Functionality** - Full-text search across titles and content
- **Post Details** - Individual post view with full content
- **Related Posts** - Suggested content based on categories
- **Responsive Pagination** - Navigate through large content sets

### 💬 Social Engagement

- **Like System** - Like/unlike posts with real-time counters
- **Comment System** - Add, edit, and delete comments
- **Comment Threading** - Organized discussion on posts
- **User Interactions** - See who liked and commented on posts
- **Real-time Updates** - Dynamic content loading without page refresh

### 📱 Cross-Platform Support

- **Responsive Design** - Fully optimized for all screen sizes
- **Mobile-First Approach** - Touch-friendly interface design
- **Desktop Optimization** - Enhanced experience for larger screens
- **Tablet Support** - Seamless experience across all devices
- **Progressive Enhancement** - Works on modern and legacy browsers
- **Accessibility Features** - WCAG compliant design elements

### 🔒 Security Features

- **Input Validation** - Comprehensive server-side validation
- **XSS Protection** - Content sanitization and security
- **SQL Injection Prevention** - Parameterized queries
- **CORS Configuration** - Controlled cross-origin requests
- **Rate Limiting** - API protection against abuse
- **Secure Headers** - Enhanced security configurations
- **Token Expiration** - Automatic session management

### 🎨 User Experience

- **Modern UI/UX** - Clean, intuitive interface design
- **Fast Loading** - Optimized performance and caching
- **Smooth Animations** - Enhanced user interactions
- **Error Handling** - Graceful error messages and recovery
- **Loading States** - Visual feedback for user actions
- **Toast Notifications** - Real-time user feedback
- **Scroll Management** - Automatic scroll-to-top navigation

## 🛠️ Tech Stack

### Frontend Technologies

- **React 18** - Modern component-based UI library
- **Vite** - Lightning-fast build tool and dev server
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing and navigation
- **React Quill** - Rich text editor with formatting
- **Axios** - HTTP client for API requests
- **React Toastify** - Toast notifications
- **React Icons** - Comprehensive icon library
- **DOMPurify** - XSS protection for user content
- **React Responsive** - Media query components
- **PostCSS** - CSS processing and optimization

### Backend Technologies

- **Node.js** - JavaScript runtime environment
- **Express.js** - Minimal web application framework
- **TypeScript** - Strongly typed programming language
- **MySQL2** - MySQL database driver with promise support
- **JWT (jsonwebtoken)** - JSON Web Token authentication
- **Multer** - File upload handling middleware
- **Nodemailer** - Email sending functionality
- **Crypto-JS** - Cryptographic utilities
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger middleware
- **ts-node** - TypeScript execution environment
- **Nodemon** - Development auto-restart utility

### Database & Storage

- **MySQL** - Relational database management system
- **File System** - Local image storage with organized structure

### Development & Documentation

- **Swagger UI Express** - Interactive API documentation
- **Swagger JSDoc** - API documentation generation
- **ESLint** - Code linting and quality assurance
- **Prettier** - Code formatting
- **Git** - Version control system

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js (v14+)
- MySQL
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Full-Stack-Blog-Application-usingMERN
   ```

2. **Backend Setup**

   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Database Setup**
   - Import `blogapp.sql` into your MySQL database
   - Update database credentials in server configuration

## 📚 API Documentation

Visit `http://localhost:4000/api-docs` for interactive Swagger documentation.

## 🌐 Live Demo

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000
- **API Docs**: http://localhost:4000/api-docs

## 📁 Project Structure

```
├── client/                  # React Frontend Application
│   ├── public/             # Static assets and images
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages/routes
│   │   ├── config/        # API configuration
│   │   ├── images/        # Client-side assets
│   │   └── styles/        # CSS and styling files
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite build configuration
│
├── server/                 # TypeScript Backend Application
│   ├── src/
│   │   ├── controllers/   # Request handlers and business logic
│   │   ├── routes/        # API endpoint definitions
│   │   ├── middleware/    # Authentication and validation
│   │   ├── services/      # Business service layer
│   │   ├── repositories/  # Database access layer
│   │   ├── types/         # TypeScript type definitions
│   │   ├── config/        # Server configuration
│   │   └── images/        # Uploaded post images
│   ├── package.json       # Backend dependencies
│   └── tsconfig.json      # TypeScript configuration
│
├── database/              # Database Schema & Sample Data
│   ├── blogapp.sql        # Complete database schema
│   ├── Sample data/       # Pre-populated test data
│   └── db_schema.mwb      # MySQL Workbench model
│
└── README.md              # Project documentation
```

## 🌐 Platform Compatibility

### Desktop Support

- **Windows** - Full compatibility with Windows 10/11
- **macOS** - Native support for macOS 10.15+
- **Linux** - Ubuntu, Debian, CentOS, and other distributions
- **Browser Support** - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Mobile Support

- **iOS** - iPhone and iPad with iOS 13+
- **Android** - Android 8.0+ devices
- **Progressive Web App** - Installable mobile experience
- **Touch Optimized** - Gesture-friendly interface
- **Responsive Breakpoints** - Optimized for all screen sizes

### Performance Optimizations

- **Lazy Loading** - Images and content loaded on demand
- **Code Splitting** - Optimized bundle sizes
- **Caching Strategy** - Enhanced performance with browser caching
- **Database Indexing** - Optimized query performance
- **Image Optimization** - Compressed and resized media files

## 🔧 Environment Variables

### Server Configuration

Create a `.env` file in the server directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blogapp

# Authentication
JWT_SECRET=your_jwt_secret_key

# Email Configuration (for password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=4000
NODE_ENV=development
```

### Client Configuration

Create a `.env` file in the client directory:

```env
# API Configuration
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=Blog Application

# Environment
VITE_NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.
