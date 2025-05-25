# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 🔗 API integration with Django backend
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Environment Configuration

The application uses environment variables for configuration. Copy the example environment file to create your own:

```bash
# Copy the example env file
cp app/env.example .env.local

# Edit the file with your specific settings
nano .env.local
```

Available environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_BASE_URL | Base URL for API requests | http://localhost:8000/api |
| VITE_API_TIMEOUT | Timeout for API requests (ms) | 30000 |
| VITE_AUTH_LOGIN_ENDPOINT | Login endpoint | /auth/login |
| VITE_AUTH_REGISTER_ENDPOINT | Registration endpoint | /auth/register |
| VITE_AUTH_VALIDATE_TOKEN_ENDPOINT | Token validation endpoint | /auth/validate-token |
| VITE_AUTH_REFRESH_TOKEN_ENDPOINT | Token refresh endpoint | /auth/refresh-token |

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

## Security

### Authentication

This application uses HTTP-only cookies for authentication, which provides enhanced security against XSS attacks. The authentication flow works as follows:

1. When a user logs in or registers, the backend sets HTTP-only cookies containing the authentication tokens.
2. These cookies are automatically included in subsequent requests to the backend.
3. If authentication fails, the application attempts to refresh the token using a dedicated endpoint.
4. The tokens are never accessible to JavaScript, reducing the risk of token theft via XSS attacks.

### CSRF Protection

Cross-Site Request Forgery (CSRF) protection is implemented using Django's CSRF token system:

1. The backend sets a `csrftoken` cookie that is readable by JavaScript.
2. For all non-GET requests, a `X-CSRFToken` header is automatically included with the value from the cookie.
3. The API utility functions handle this transparently, retrieving the token and adding it to appropriate requests.
4. If CSRF validation fails, the user is prompted to refresh the page to obtain a new token.

This approach provides robust protection against CSRF attacks while maintaining a seamless user experience.

---

Built with ❤️ using React Router.
