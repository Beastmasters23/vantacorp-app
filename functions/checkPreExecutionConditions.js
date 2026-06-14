import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkRunningTasksAndLocks(nodeId) {
    // Mocked function to check for running tasks and locks
    const runningTasks = await getCurrentRunningTasks(nodeId);
    const aptLockStatus = await checkAptLock(nodeId);
    return {
        runningTasks,
        aptLock: aptLockStatus
    };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const nodeId = req.headers.get("Node-ID");  // Assume a Node-ID header for identification

    try {
        const { runningTasks, aptLock } = await checkRunningTasksAndLocks(nodeId);
        if (aptLock) {
            return Response.json({ error: 'APT lock detected. Cannot execute new tasks.' }, { status: 423 });
        }
        if (runningTasks.length > 0) {
            return Response.json({ error: 'There are currently running tasks. Please wait before executing new ones.' }, { status: 423 });
        }

        return Response.json({ message: 'No locks or running tasks detected. Ready to execute.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});