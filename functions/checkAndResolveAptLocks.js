import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const checkAndClearAptLocks = async () => {
    // Function to check for any existing apt locks and clear them if found.
    const aptLockFiles = ['/var/lib/dpkg/lock', '/var/lib/apt/lists/lock', '/var/cache/apt/archives/lock'];
    for (const lockFile of aptLockFiles) {
        try {
            await Deno.stat(lockFile);
            await Deno.remove(lockFile);
            console.log(`Removed lock file: ${lockFile}`);
        } catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                console.log(`No lock file found: ${lockFile}`);
            } else {
                console.error(`Error removing lock file: ${lockFile}`, e);
            }
        }
    }
};

const getLongRunningTasks = async () => {
    // Function to fetch and log tasks running for too long.
    const tasks = await getRunningTasks(); // Placeholder for actual task fetching logic.
    const now = Date.now();
    const longRunningTasks = tasks.filter(task => (now - task.startTime) > (60 * 60 * 1000)); // Tasks running over 1 hour.
    for (const task of longRunningTasks) {
        console.warn(`Task ${task.id} has been running for ${(now - task.startTime) / (1000 * 60)} minutes. Cancelling...`);
        await cancelTask(task.id); // Placeholder for actual cancellation logic.
    }
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        await getLongRunningTasks();
        // Proceed with normal task execution here
        return Response.json({ message: 'Checks complete.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});