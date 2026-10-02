# DevBlog

A production-ready MERN stack blog platform featuring robust role-based access control, comprehensive commenting systems, and a strictly isolated administrative dashboard.

## Tech Stack

- **Frontend**: React.js (TypeScript), Redux Toolkit, TailwindCSS, React Query, Vite.
- **Backend**: Node.js, Express.js (TypeScript), Mongoose, Passport.js, Jest.
- **Database**: MongoDB (Local/Atlas).

## Features

- **Advanced Authentication**: JWT access and refresh components via HTTP-only cookies. Full OAuth 2.0 pipeline (Google & Facebook).
- **Role-Based Access Control**: Hardened internal middleware physically separating `USER` and `ADMIN` operations.
- **Post & Comment Management**: Full CRUD capabilities. Users can manage their own data; Admins have blanket override access globally.
- **Admin Dashboard**: Dedicated React routing layout displaying core analytics and content moderation controls.
- **Security & Testing**: Zod structural payload validation, bcrypt password hashing, Express IP rate limiting, and a fully automated Jest/Mongo-Memory-Server integration suite.

## Installation & Setup

1. **Clone the repo** and navigate to the project folder.
2. **Setup the Backend**:

   ```bash
   cd devblog-backend
   npm install
   ```

   _Create a `.env` file in the backend root based on `.env.example`:_

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/devblog
   JWT_SECRET=your_super_secret_key
   JWT_REFRESH_SECRET=your_super_refresh_key
   FRONTEND_URL=http://localhost:5173
   # Optional OAuth setup
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   FACEBOOK_APP_ID=your_id
   FACEBOOK_APP_SECRET=your_secret
   ```

3. **Setup the Frontend**:

   ```bash
   cd ../devblog-frontend
   npm install
   ```

   _Create a `.env` file in the frontend root:_

   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```

4. **Spin up the environments**:
   _Terminal 1 (Backend)_: `npm run dev`
   _Terminal 2 (Frontend)_: `npm run dev`

## Creating an Admin Account (Terminal)

For security reasons, you cannot register an Admin account via the standard UI. To elevate a standard user to an Admin, you must run the backend CLI bootstrapping script.

1. Register a standard user natively on the frontend (e.g. `admin@devblog.com`).
2. Open a terminal inside `devblog-backend`.
3. Execute the elevation script, passing the target email:
   ```bash
   npx ts-node src/scripts/createAdmin.ts admin@devblog.com
   ```
4. Log back in on the frontend. The system will detect your new `ADMIN` status and grant you instant access to the `/admin` portal.

## Running Tests

I built a robust integration testing pipeline for the backend using `Jest` and `mongodb-memory-server`. Tests run locally in memory without blowing away your real database:

```bash
cd devblog-backend
npm test
```

## API Structure Overview

| Method | Endpoint                  | Access        | Description                        |
| ------ | ------------------------- | ------------- | ---------------------------------- |
| POST   | `/api/v1/auth/register`   | Public        | Register standard user             |
| POST   | `/api/v1/auth/login`      | Public        | Standard login mapping             |
| GET    | `/api/v1/posts`           | Public        | Paginated feed fetch               |
| POST   | `/api/v1/posts`           | Authenticated | Publish new article                |
| GET    | `/api/v1/admin/posts/:id` | Admin Only    | Bypass soft-del logic to view post |
| DELETE | `/api/v1/admin/users/:id` | Admin Only    | Physically boot user               |
