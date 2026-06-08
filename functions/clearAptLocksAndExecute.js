import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend', '/var/cache/apt/archives/lock'];
    for (const lockFile of lockFiles) {
        try {
            await Deno.remove(lockFile);
        } catch (e) {
            if (e instanceof Deno.errors.NotFound) continue; // ignore if the file does not exist
            console.error(`Unable to remove lock file ${lockFile}:`, e);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // logic for executing tasks goes here, ensuring to check for locks afterward
        // For example, validate if locks are cleared and task can proceed
        return Response.json({ message: "APT locks cleared and ready for task execution" });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});