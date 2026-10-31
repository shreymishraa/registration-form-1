# HiPATH registration and login

The React app uses an Express API and a local SQLite database for account registration and login. The database file is created automatically at `server/data/hipath.sqlite`. Passwords are hashed with bcrypt before they are stored.

## Local setup

1. Use Node.js 22.13 or newer. No separate database server is required.
2. Copy `.env.example` to `.env` and set `JWT_SECRET` to a random secret of at least 32 characters. Set both Google client ID values to the same OAuth 2.0 Web client ID from Google Cloud Console, with `http://localhost:5173` added as an authorized JavaScript origin.
3. Install packages with `npm install`.
4. Run `npm run dev`. This starts the Vite app on port 5173 and the API on port 3001. The API creates its `users` table on startup.

The registration page creates an account and signs it in. The login page uses Google Sign-In and accepts the verified Google email that was used to register. Back up `server/data/hipath.sqlite` to preserve local accounts. Production deployments should set `JWT_SECRET` and both Google client ID values through the hosting provider's environment settings, and use persistent disk storage for the SQLite file.
