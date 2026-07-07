import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const APT_LOCK_FILE = '/var/lib/dpkg/lock';

const checkAndClearAPTPossiblyStuck = async () => {
    try {
        // Check if the APT lock file exists
        const lockExists = await Deno.stat(APT_LOCK_FILE).catch(() => false);
        if (lockExists) {
            // Attempt to clear the lock if it's stale
            console.log('AP lock detected, attempting to remove...');
            await Deno.run({ cmd: ['sudo', 'rm', APT_LOCK_FILE'] }).status();
        }
        return true;
    } catch (error) {
        console.error('Could not clear APT lock:', error);
        return false;
    }
};

const monitorLongRunningTasks = async () => {
    const runningTasks = await getRunningTasks(); // Implement this to return currently running tasks
    for (const task of runningTasks) {
        if (task.duration > 60) { // Replace with the actual duration check mechanism
            console.log(`Task ${task.id} stuck for more than 60 minutes, sending alert...`);
            await sendAlert(task); // Implement sendAlert to notify admins
        }
    }
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const aptCleared = await checkAndClearAPTPossiblyStuck();

    if (!aptCleared) {
        return Response.json({ error: 'Unable to clear APT locks.' }, { status: 500 });
    }

    await monitorLongRunningTasks();

    return Response.json({ status: 'OK' });
});