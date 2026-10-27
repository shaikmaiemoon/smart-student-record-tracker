import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const CPP_PORT = 5000;
const CPP_URL = `http://127.0.0.1:${CPP_PORT}`;

// Function to ensure C++ server is running
async function ensureCppBackend() {
  const binaryPath = path.resolve(__dirname, 'backend/build/student_tracker_api');
  const dataPath = path.resolve(__dirname, 'backend/data/students.json');

  try {
    const res = await fetch(`${CPP_URL}/api/health`);
    if (res.ok) {
      console.log(`[Express Proxy] C++ Backend confirmed healthy at ${CPP_URL}`);
      return;
    }
  } catch {
    // Not running yet
  }

  if (fs.existsSync(binaryPath)) {
    console.log(`[Express Proxy] Launching C++ backend binary (${binaryPath}) on port ${CPP_PORT}...`);
    const child = spawn(binaryPath, [CPP_PORT.toString(), dataPath], {
      detached: true,
      stdio: 'inherit',
    });
    child.unref();

    // Wait for server to boot up
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 400));
      try {
        const check = await fetch(`${CPP_URL}/api/health`);
        if (check.ok) {
          console.log(`[Express Proxy] C++ Backend successfully initialized on port ${CPP_PORT}`);
          return;
        }
      } catch {
        // Retry
      }
    }
  } else {
    console.warn(`[Express Proxy] C++ binary not found at ${binaryPath}. Please run: npm run build:cpp`);
  }
}

// Forward all /api requests to C++ backend
app.use('/api', async (req, res) => {
  const targetUrl = `${CPP_URL}/api${req.url}`;
  try {
    const headers: Record<string, string> = {};
    for (const [key, val] of Object.entries(req.headers)) {
      if (typeof val === 'string' && key.toLowerCase() !== 'host') {
        headers[key] = val;
      }
    }

    const options: RequestInit = {
      method: req.method,
      headers,
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      options.body = Buffer.concat(chunks);
    }

    const backendRes = await fetch(targetUrl, options);
    res.status(backendRes.status);
    
    backendRes.headers.forEach((value, name) => {
      if (name.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(name, value);
      }
    });

    const bodyBuffer = await backendRes.arrayBuffer();
    res.send(Buffer.from(bodyBuffer));
  } catch (err: any) {
    console.error(`[Express Proxy] Error proxying to C++ backend:`, err.message);
    res.status(502).json({
      error: 'Cannot connect to C++ backend service',
      details: err.message,
      suggestion: 'Ensure the C++ backend is running on port ' + CPP_PORT
    });
  }
});

// Serve frontend dist assets if present
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

ensureCppBackend().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express Server] Running on http://0.0.0.0:${PORT}`);
  });
});
