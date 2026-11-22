import app from '../server.js';

// Disable Vercel's default bodyParser so multipart streams reach file-upload-kit intact
export const config = {
  api: {
    bodyParser: false
  }
};

export default app;
