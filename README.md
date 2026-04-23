# Online Store

This project is set up to deploy to Render as a single Node web service.

## Local run

1. Create a `.env` file from `.env.example`.
2. Install dependencies:

```bash
npm install
```

3. Start the app:

```bash
npm run dev
```

The Express server serves both:

- the API under `/api/*`
- the frontend pages from `frontend/`

## Render deployment

This repo includes [render.yaml](render.yaml) for one Render web service.

### Option 1: Blueprint deploy

1. Push this repo to GitHub.
2. In Render, choose **New +** -> **Blueprint**.
3. Select the repository.
4. Fill in the environment variables marked `sync: false` in `render.yaml`.
5. Deploy.

### Option 2: Manual web service

Use these settings:

- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

### Required environment variables

Copy values from your local `.env` into Render, but do not commit real secrets:

- `MONGO_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Optional environment variables

- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_ENABLED`
- `STRIPE_SECRET_KEY`

## Important security note

Your current local `.env` contains real secrets. If that file was ever committed or shared, rotate those credentials before deploying:

- MongoDB password
- JWT secret
- Cloudinary keys
- email app password
- Stripe secret key
