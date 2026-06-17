import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const lockFiles = ['/var/lib/dpkg/lock', '/var/cache/apt/archives/lock'];
    for (const file of lockFiles) {
        try {
            await Deno.remove(file);
            console.log(`Removed lock file: ${file}`);
        } catch (error) {
            console.warn(`Could not remove lock file: ${file}, error: ${error.message}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT locks checked and cleared.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});