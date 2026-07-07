import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAndCheckLocks() {
    const lockFilePaths = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend', '/var/cache/apt/archives/lock'];
    for (const path of lockFilePaths) {
        try {
            await Deno.stat(path);
            await Deno.remove(path);
            console.log(`Removed lock file: ${path}`);
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                console.log(`No lock file to remove: ${path}`);
            } else {
                console.error(`Failed removing lock file ${path}: ${error.message}`);
            }
        }
    }
    return { status: 'Locks checked and cleared if present' };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksResult = await clearAndCheckLocks();
        return Response.json(locksResult, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});