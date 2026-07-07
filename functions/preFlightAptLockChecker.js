import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const Deno = Deno; // Using Deno to check for apt locks
    const lockFile = '/var/lib/dpkg/lock';
    try {
        const fileInfo = await Deno.stat(lockFile);
        if (fileInfo && fileInfo.isFile) {
            await Deno.remove(lockFile);
            console.log('APT lock cleared.');
        }
    } catch (error) {
        if (error.name === "NotFound") {
            console.log('No APT lock found.');
        } else {
            throw new Error('Failed to clear APT lock: ' + error.message);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'Pre-flight check completed; no APT locks.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});