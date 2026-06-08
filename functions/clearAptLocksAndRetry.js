import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend'];
    for (const lockFile of lockFiles) {
        try {
            const fileExists = await Deno.stat(lockFile).then(() => true).catch(() => false);
            if (fileExists) {
                console.log(`Clearing lock: ${lockFile}`);
                await Deno.remove(lockFile);
            }
        } catch (error) {
            console.error(`Failed to clear lock: ${lockFile}`, error);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ status: 'apt locks cleared successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});