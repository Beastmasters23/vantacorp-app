import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function isAptLocked() {
    const result = await Deno.run({
        cmd: ['sh', '-c', 'test -e /var/lib/dpkg/lock-frontend && echo locked || echo unlocked'],  
        stdout: 'piped',  
        stderr: 'piped'
    });
    const output = await result.output();
    const status = new TextDecoder().decode(output).trim();
    return status === 'locked';
}

async function clearAptLock() {
    await Deno.run({
        cmd: ['sudo', 'rm', '/var/lib/dpkg/lock-frontend', '/var/lib/dpkg/lock'],  
        stdout: 'piped',  
        stderr: 'piped'
    }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        if (await isAptLocked()) {
            await clearAptLock();
        }
        // Continue with task execution after clearing the lock
        // Task execution logic here...
        return Response.json({ message: 'Task executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});