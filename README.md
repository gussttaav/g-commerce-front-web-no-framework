# G-commerce

🚀 **Live Preview Available**: [Click here to try the application](https://g-commerce-front-web-no-framework.vercel.app/) 🎉

A simple web application for an e-commerce system, built only with HTML, JavaScript, and Bootstrap. No frameworks were used. This project consumes the Spring Boot REST API available at [G-commerce backend](https://github.com/gussttaav/g-commerce-springboot-api).

## 🎯 Purpose

This project was developed for educational and learning purposes, serving as an example implementation of a frontend for a Spring Boot REST API. It is part of a series of implementations that will include versions using modern frameworks like Angular.

## ✨ Features

### User Management
- New user registration
- Login with token based authentication
- User profile management
- Password change
- Admin panel for user management (ADMIN role)

### Product Management
- Product catalog visualization
- Product search and filtering
- Admin panel for:
  - Creating new products
  - Updating existing products
  - Deleting products
  - Managing product status (active/inactive)

### Shopping Cart
- Add/remove products
- Update quantities
- Cart persistence during session
- Automatic total calculations

### Purchase System
- Checkout process
- Purchase history
- Purchase details

### User Interface
- Responsive design
- Light/dark themes
- Status notifications and messages
- Real-time form validation

## 🛠️ Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5.3
- Bootstrap Icons
- Fetch API
- LocalStorage API
- Docker & Docker Compose
- Node.js & npm
- Nginx (for production deployment)

## 📋 Prerequisites

- Modern web browser
- Docker and Docker Compose installed
- Node.js and npm (optional, for development)

## 🚀 Installation

### Development Setup

1. Ensure the backend is running, use the [docker container](https://hub.docker.com/repository/docker/gussttaav/g-commerce-backend/general) or clone the [backend repository](https://github.com/gussttaav/g-commerce-springboot-api) for this.

2. Clone this repository:
```bash
git clone https://github.com/gussttaav/g-commerce-front-web-no-framework.git
cd g-commerce-front-web-no-framework
```

3. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root:
```
API_URL=http://localhost:8080/api
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Docker image

The image for this application is built and pushed to Docker Hub on every push to this branch using GitHub Actions. The complete stack includes:

- Frontend (this repository)
  - Docker image: `gussttaav/g-commerce-frontend`
  
- Backend API
  - Repository: [Backend Repository](https://github.com/gussttaav/g-commerce-springboot-api.git)
  - Docker image: `gussttaav/g-commerce-backend`
  - API Documentation: http://localhost:8080/swagger-ui.html

- Database
  - Docker image: `gussttaav/g-commerce-mysql`

Refer to the instructions on the [Docker Hub image page](https://hub.docker.com/repository/docker/gussttaav/g-commerce-frontend/general) to have the full stack running or just this application.


## 📁 Project Structure

```
g-commerce/
├── index.html
├── dashboard.html
├── css/
├── img/
├── js/
│   ├── components/
│   ├── services/
│   ├── utils/
│   ├── auth.js
│   └── dashboard.js
├── Dockerfile
├── nginx.conf
├── package.json
└── README.md
```

## 🔒 Security

- Basic authentication
- CSRF protection
- Client-side data validation
- Secure token handling
- User roles (ADMIN/USER)

## 🎯 Future Versions

Additional implementations are planned using:
- Angular
- React
- Next.js

Each implementation will maintain the same base functionality while leveraging the specific features of each framework.

## 📄 License

This project is under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
