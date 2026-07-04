import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function preFlightTaskManager() {
    // Check for existing apt locks
    const isAptLocked = await checkAptLocks();
    if (isAptLocked) {
        throw new Error('Apt is currently locked, cannot proceed with tasks.');
    }

    // List of critical files to check
    const criticalFiles = [
        '/home/delgadofrankie139/vanta/output/hive_strategy.json',
        '/home/delgadofrankie139/vanta/agi_daemon.log'
    ];

    for (const file of criticalFiles) {
        const exists = await checkFileExists(file);
        if (!exists) {
            throw new Error(`Required file missing: ${file}`);
        }
    }

    // Execute the critical task
    const taskStartTime = Date.now();
    await executeCriticalTask();
    const taskEndTime = Date.now();
    const taskDuration = (taskEndTime - taskStartTime) / 1000; // duration in seconds

    if (taskDuration > 60) {
        console.warn('Task took too long to complete, consider checking for issues.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await preFlightTaskManager();
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});