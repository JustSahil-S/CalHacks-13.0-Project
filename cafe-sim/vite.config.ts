import { spawn, type ChildProcess } from 'node:child_process';
import { readFileSync, watch } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

function loadDotEnv() {
  for (const file of [resolve('..', '.env'), resolve('.env')]) {
    try {
      for (const line of readFileSync(file, 'utf8').split('\n')) {
        const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
        }
      }
    } catch {
      // missing file
    }
  }
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolveBody, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk as Buffer));
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function assistantApi(): Plugin {
  loadDotEnv();
  return {
    name: 'assistant-api',
    configureServer(server) {
      server.middlewares.use('/api/assistant', (req, res, next) => {
        void handleAssistant(req, res, next);
      });
    },
  };
}

async function handleAssistant(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) {
  if (req.method !== 'POST') {
    next();
    return;
  }
  res.setHeader('content-type', 'application/json');
  const key = process.env.ANTHROPIC_API_KEY ?? '';
  if (!key) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY is missing' }));
    return;
  }
  try {
    const payload = JSON.parse(await readBody(req)) as {
      system?: string;
      tools?: unknown;
      messages?: unknown;
    };
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-5-5',
        max_tokens: 2048,
        system: payload.system,
        tools: payload.tools,
        messages: payload.messages,
      }),
    });
    const text = await response.text();
    res.statusCode = response.status;
    res.end(text);
  } catch (error) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Assistant failed',
      }),
    );
  }
}

function killWorker(proc: ChildProcess | undefined) {
  if (!proc?.pid) return;
  try {
    proc.kill('SIGTERM');
  } catch {
    // already gone
  }
  setTimeout(() => {
    try {
      if (proc.exitCode == null && proc.signalCode == null) proc.kill('SIGKILL');
    } catch {
      // already gone
    }
  }, 500);
}

function agentWorker(): Plugin {
  let child: ChildProcess | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let shuttingDown = false;
  const stop = () => {
    shuttingDown = true;
    clearTimeout(timer);
    killWorker(child);
    child = undefined;
  };
  const start = () => {
    if (process.env.DISABLE_AGENT_WORKER || shuttingDown) return;
    const previous = child;
    const tsx = resolve('node_modules/tsx/dist/cli.mjs');
    const proc = spawn(process.execPath, [tsx, 'agents/worker.ts'], {
      stdio: 'inherit',
      env: process.env,
    });
    child = proc;
    killWorker(previous);
    proc.on('exit', () => {
      if (child !== proc) return;
      child = undefined;
      if (shuttingDown) return;
      clearTimeout(timer);
      timer = setTimeout(start, 1000);
    });
  };
  return {
    name: 'agent-worker',
    configureServer() {
      shuttingDown = false;
      start();
      watch('agents/worker.ts', () => {
        if (shuttingDown) return;
        clearTimeout(timer);
        timer = setTimeout(start, 300);
      });
      process.on('exit', stop);
    },
    closeBundle: stop,
  };
}

export default defineConfig({
  plugins: [react(), agentWorker(), assistantApi()],
});
