import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();  // Call to the APT lock clearing function
        // Proceed with normal task execution logic here ...
        return Response.json({ success: true }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }  
});

async function clearAptLocks() {
    const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend', '/var/cache/apt/archives/lock'];
    for (const lock of lockFiles) {
        try {
            await Deno.remove(lock);
            console.log(`Removed lock file: ${lock}`);
        } catch (error) {
            // Log if the lock file could not be removed
            console.warn(`Failed to remove lock file: ${lock}. Reason: ${error.message}`);
        }
    }
    // Optionally: Validate that no APT processes are running
    const processCheck = await Deno.run({
        cmd: ['pgrep', '-l', 'apt'],
    }).status();
    if (processCheck.success) {
        console.warn('APT processes are still running. Please check manual intervention.');
    }
}