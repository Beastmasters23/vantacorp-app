import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const lockFilePath = '/var/lib/dpkg/lock';
    const fs = Deno;
    try {
        const fileInfo = await fs.stat(lockFilePath);
        if (fileInfo.isFile) {
            console.log('APT lock file exists, attempting to remove it.');
            await fs.remove(lockFilePath);
            console.log('APT lock file cleared.');
        }
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            console.log('No APT lock file detected, proceeding normally.');
        } else {
            throw new Error(`Failed to check or clear APT lock: ${error.message}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        // Your existing task execution logic here
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});