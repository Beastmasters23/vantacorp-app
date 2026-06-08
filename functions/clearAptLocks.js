import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Check the status of APT locks
    const lockStatus = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser /var/lib/dpkg/lock*']
    }).output();

    // If there are lock users, clear them
    if (new TextDecoder().decode(lockStatus).trim()) {
        console.log('APT locks detected, attempting to clear...');
        await Deno.run({
            cmd: ['bash', '-c', 'sudo kill -9 $(sudo fuser /var/lib/dpkg/lock*)']
        }).status();
        console.log('APT locks cleared.');
    } else {
        console.log('No APT locks detected. System ready.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    await clearAptLocks(); // Clear APT locks before processing any tasks
    try {
        // Continue with task execution logic here
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});