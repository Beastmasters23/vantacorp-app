import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const exec = Deno.run({ 
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo fuser -k /var/cache/apt/archives/lock'], 
        stdout: 'null', 
        stderr: 'null' 
    });
    const status = await exec.status();
    exec.close();
    return status.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check and clear apt locks
        const lockCleared = await checkAndClearAptLocks();
        if (!lockCleared) {
            throw new Error('Failed to clear apt locks');
        }
        return Response.json({ message: 'Apt locks cleared successfully' }, { status: 200 });
    } catch(error) {
        console.error(error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});