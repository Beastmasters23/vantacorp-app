import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo fuser /var/lib/dpkg/lock 2>/dev/null'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await exec.status();
    exec.close();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockCleared = await checkAndClearAptLocks();
        if (!lockCleared) {
            return Response.json({ error: "APT lock is currently in use. Please try again later." }, { status: 503 });
        }
        // Proceed with task execution after confirming no locks are present.
        // Additional task execution logic goes here...
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});