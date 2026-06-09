import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLockAndCheckCommands() {
    const requiredCommands = ['cat', 'echo', 'grep'];
    let aptLockCleared = false;
    try {
        // Clear APT locks
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/apt/lists/lock'] }).status();
        aptLockCleared = true;
    } catch (e) {
        console.error('Failed to clear APT locks:', e.message);
    }

    // Check for required commands
    for (const cmd of requiredCommands) {
        try {
            const status = await Deno.run({ cmd: ['which', cmd] }).status();
            if (status.code !== 0) {
                throw new Error(`Command missing: ${cmd}`);
            }
        } catch (e) {
            console.error(e.message);
            return { error: e.message };
        }
    }

    return { success: true, aptLockCleared };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const result = await clearAptLockAndCheckCommands();
    return Response.json(result);
});