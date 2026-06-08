import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTLocks() {
    // Function to check and clear APT locks
    const locksCleared = [];
    const exec = Deno.run({
        cmd: ['sh', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo fuser -k /var/cache/apt/archives/lock; sudo dpkg --configure -a'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { success } = await exec.status();
    if (success) {
        locksCleared.push('APT locks cleared successfully.');
    } else {
        const error = await exec.stderrOutput();
        const errorMessage = new TextDecoder().decode(error);
        locksCleared.push(`Error clearing APT locks: ${errorMessage}`);
    }
    return locksCleared;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksLog = await clearAPTLocks();
        return Response.json({ message: 'APT lock clearance function executed.', locksLog }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});