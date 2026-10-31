# HiPATH registration and login

The React app uses an Express API and PostgreSQL for account registration and login. Passwords are hashed with bcrypt before they are stored. Gmail addresses work as regular email addresses; this project does not use Google OAuth.

## Local setup

1. Create a PostgreSQL database named `hipath` (or choose another database name).
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL connection string. Set `JWT_SECRET` to a random secret of at least 32 characters.
3. Install packages with `npm install`.
4. Run `npm run dev`. This starts the Vite app on port 5173 and the API on port 3001. The API creates its `users` table on startup.

For example, a local connection string looks like:

```text
postgresql://postgres:your_password@localhost:5432/hipath
```

The registration page creates an account and signs it in. Use the same email and password on the login page. Production deployments should set `DATABASE_URL` and `JWT_SECRET` through the hosting provider's environment settings.
