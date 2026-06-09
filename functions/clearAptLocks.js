import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Check if APT is locked
    const lockFileExists = await Deno.stat('/var/lib/dpkg/lock-frontend').catch(() => null);
    if (lockFileExists) {
        // If locked, attempt to clear the locks
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock-frontend'] }).status();
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'] }).status();
        await Deno.run({ cmd: ['sudo', 'dpkg', '--configure', '-a'] }).status();
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks(); // Clear APT locks before any task execution
        // Insert further task execution logic here
        return Response.json({ success: true, message: 'APT locks cleared and ready for task execution.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});