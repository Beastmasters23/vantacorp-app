import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Logic to check and clear any apt locks that might be causing issues.
    const lockFile = '/var/lib/dpkg/lock';
    const lockFileAlt = '/var/lib/dpkg/lock-frontend';
    const fs = Deno;
    try {
        // Check if lock files exist
        const exists1 = await fs.stat(lockFile).then(() => true).catch(() => false);
        const exists2 = await fs.stat(lockFileAlt).then(() => true).catch(() => false);

        if (exists1) {
            await fs.remove(lockFile);
        }
        if (exists2) {
            await fs.remove(lockFileAlt);
        }
    } catch (error) {
        console.error(`Error while clearing apt locks: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks(); // Clear apt locks before proceeding
        // Other task operations go here...
        return Response.json({ message: 'Task executed successfully' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});