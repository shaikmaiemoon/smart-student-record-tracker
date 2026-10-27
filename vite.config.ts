import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {spawn} from 'child_process';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function cppBackendPlugin(): Plugin {
  return {
    name: 'cpp-backend-keeper',
    configureServer() {
      const binaryPath = path.resolve(__dirname, 'backend/build/student_tracker_api');
      const dataPath = path.resolve(__dirname, 'backend/data/students.json');

      const checkAndLaunch = async () => {
        try {
          const res = await fetch('http://127.0.0.1:5000/api/health');
          if (res.ok) {
            console.log('[Vite-Cpp-Plugin] C++ backend is already running on port 5000');
            return;
          }
        } catch {
          // not running, attempt launch
        }

        if (fs.existsSync(binaryPath)) {
          console.log('[Vite-Cpp-Plugin] Launching C++ backend daemon...');
          const child = spawn(binaryPath, ['5000', dataPath], {
            detached: true,
            stdio: 'inherit',
          });
          child.unref();
        } else {
          console.warn('[Vite-Cpp-Plugin] C++ binary not yet compiled at', binaryPath);
        }
      };

      checkAndLaunch();
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), cppBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
