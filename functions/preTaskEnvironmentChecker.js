import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocks() {
    const aptLockFile = '/var/lib/dpkg/lock-frontend';
    const aptProcess = Deno.run({
        cmd: ['pgrep', '-f', 'apt'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const [aptLockExists, aptProcesses] = await Promise.all([
        Deno.stat(aptLockFile).catch(() => false),
        aptProcess.output()
    ]);
    aptProcess.close();
    return aptLockExists || aptProcesses.length > 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isLocked = await checkAptLocks();
        if (isLocked) {
            return Response.json({ error: 'APT locks are currently active. Task execution prevented.' }, { status: 503 });
        }
        // Proceed with other task execution logic here
        return Response.json({ message: 'System is ready for task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});