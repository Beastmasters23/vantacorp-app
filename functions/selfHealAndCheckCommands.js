import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocksAndCheckCommands() {
    const aptLockExists = await checkForAptLocks();
    const requiredCommandsAvailable = await checkRequiredCommands();
    if (aptLockExists) {
        await clearAptLocks();
    }
    return requiredCommandsAvailable;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Pre-execution checks
        const areChecksPassed = await clearAptLocksAndCheckCommands();
        if (!areChecksPassed) {
            throw new Error('Essential commands are missing.');
        }
        // Proceed with task execution if checks passed
        return Response.json({ message: 'All checks passed, ready for task execution.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});