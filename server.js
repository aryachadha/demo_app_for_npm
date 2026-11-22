import express from 'express';
import os from 'node:os';
import path from 'node:path';
import fsp from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// 1. Import our published npm package
import { createUploader } from '@aryachadha/file-upload-kit';
import { createUploadMiddleware } from '@aryachadha/file-upload-kit/express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In serverless (Vercel), only /tmp is writable
const UPLOADS_DIR = path.join(os.tmpdir(), 'demo-uploads');

const app = express();

// 2. Initialize the file-upload-kit uploader
const uploader = createUploader({
  destination: UPLOADS_DIR,
  maxFileSize: 5 * 1024 * 1024, // 5 MB
  allowedExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.txt', '.zip'],
  maxFiles: 5,
  rollbackOnError: true
});

// Serve frontend UI
app.use(express.static(path.join(__dirname, 'public')));

// 3. Single File Upload Route using file-upload-kit Express Middleware
app.post(
  '/api/upload/single',
  createUploadMiddleware.single('file', {
    destination: UPLOADS_DIR,
    maxFileSize: 5 * 1024 * 1024,
    allowedExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.txt', '.zip']
  }),
  (req, res) => {
    res.json({
      success: true,
      message: 'File uploaded successfully!',
      file: req.file
    });
  }
);

// 4. Multiple Files Upload Route with atomic rollback
app.post(
  '/api/upload/multiple',
  createUploadMiddleware.array('files', 5, {
    destination: UPLOADS_DIR,
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 5,
    rollbackOnError: true
  }),
  (req, res) => {
    res.json({
      success: true,
      message: `Uploaded ${req.files.length} files successfully!`,
      files: req.files
    });
  }
);

// 5. List uploaded files with metadata using uploader.getInfo()
app.get('/api/files', async (req, res) => {
  try {
    await fsp.mkdir(UPLOADS_DIR, { recursive: true });
    const dirFiles = await fsp.readdir(UPLOADS_DIR);
    const files = [];

    for (const name of dirFiles) {
      if (name.startsWith('.') || name.includes('.tmp-')) continue;
      try {
        const info = await uploader.getInfo(name);
        files.push(info);
      } catch {
        // Skip inaccessible files
      }
    }

    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Delete file safely using uploader.delete()
app.delete('/api/files/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const result = await uploader.delete(filename);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 7. View/Download uploaded file
app.get('/uploads/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const info = await uploader.getInfo(filename);
    res.setHeader('Content-Type', info.mimeType);
    const buffer = await fsp.readFile(info.path);
    res.send(buffer);
  } catch {
    res.status(404).send('File not found');
  }
});

// 8. Standardized Error Handling Middleware for file-upload-kit errors
app.use((err, req, res, next) => {
  res.status(400).json({
    success: false,
    error: err.name || 'UploadError',
    code: err.code || 'UPLOAD_ERROR',
    message: err.message
  });
});

// Only listen locally if not on Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Demo app running locally at http://localhost:${PORT}`);
  });
}

export default app;
