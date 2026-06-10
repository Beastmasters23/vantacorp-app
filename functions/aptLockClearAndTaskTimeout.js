import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPT_Lock() {
    const output = await Deno.run({
        cmd: ['sudo', 'fuser', '-k', '/var/lib/apt/lists/*'],
        stdout: 'piped',
        stderr: 'piped'
    }).output();
    return new TextDecoder().decode(output);
}

async function runWithTimeout(fn, timeout) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('Task timed out'));
        }, timeout);
        fn().then(resolve).catch(reject).finally(() => clearTimeout(timer));
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPT_Lock();
        const taskResult = await runWithTimeout(async () => {
            // Your critical task logic here
            // For example: await vantaHeartbeat();
        }, 300000); // Set timeout for 5 minutes
        return Response.json({ success: true, result: taskResult });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});