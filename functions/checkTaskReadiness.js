import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkTaskReadiness() {
    // Assume we have functions checkAPPLock(), checkRunningTasks(), and checkFilePermissions()
    const aptLock = await checkAPPLock();
    const runningTasks = await checkRunningTasks();
    const permissionIssues = await checkFilePermissions();

    if (aptLock) {
        return { status: 'locked', message: 'APT is currently locked, please try again later.' };
    }
    if (runningTasks.length > 0) {
        return { status: 'busy', message: 'Tasks are currently running, please wait.' };
    }
    if (permissionIssues.length > 0) {
        return { status: 'permission denied', issues: permissionIssues };
    }
    return { status: 'ready', message: 'System is ready for new tasks.' };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const readiness = await checkTaskReadiness();
        return Response.json(readiness);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});