import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAPT() {
    // Check for APT lock files
    const aptLocks = await Deno.readDir('/var/lib/dpkg/lock');
    if (aptLocks) {
        for await (const lock of aptLocks) {
            // If lock exists, log and attempt to clear it
            console.log(`Lock file found: ${lock.name}, attempting to remove...`);
            await Deno.remove(`/var/lib/dpkg/lock/${lock.name}`);
        }
    }
    return 'APT locks cleared successfully.';
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const result = await checkAndClearAPT();
        return Response.json({ message: result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});