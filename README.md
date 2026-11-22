# @aryachadha/file-upload-kit Demo Project

A minimal, clean JavaScript project showcasing how to use the **`@aryachadha/file-upload-kit`** npm package with Express.

Designed to run seamlessly in local Node.js environments and deploy directly to Vercel without Serverless function errors.

---

## What It Demonstrates

1. **`createUploader`**: Storage configuration, size limits, and allowed extensions.
2. **`createUploadMiddleware.single`**: Express middleware handling single-file uploads with MIME verification.
3. **`createUploadMiddleware.array`**: Express middleware handling multi-file uploads with atomic rollback on failure.
4. **`uploader.getInfo`**: Inspecting file metadata (size, MIME type, createdAt).
5. **`uploader.delete`**: Deleting files safely with path traversal protection.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the local server
npm start
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Deploying to Vercel

### Option 1: Via Vercel CLI

```bash
npx vercel
```

### Option 2: Via GitHub

1. Push this folder to a GitHub repository.
2. In the Vercel dashboard, click **Add New** &rarr; **Project**.
3. Import your repository and click **Deploy**.

Vercel will automatically build the serverless functions via `api/index.js` and serve the dashboard UI at the root domain without `500 FUNCTION_INVOCATION_FAILED` errors.
