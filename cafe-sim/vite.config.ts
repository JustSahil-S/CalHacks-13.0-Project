import { spawn, type ChildProcess } from 'node:child_process';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

function agentWorker(): Plugin {
  let child: ChildProcess | undefined;
  const stop = () => {
    child?.kill();
    child = undefined;
  };
  return {
    name: 'agent-worker',
    configureServer() {
      if (process.env.DISABLE_AGENT_WORKER || child) return;
      child = spawn('npx', ['tsx', 'agents/worker.ts'], { stdio: 'inherit', env: process.env });
      child.on('exit', () => {
        child = undefined;
      });
      process.on('exit', stop);
    },
    closeBundle: stop,
  };
}

export default defineConfig({
  plugins: [react(), agentWorker()],
});
