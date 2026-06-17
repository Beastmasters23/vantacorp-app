import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkEnvironmentReadiness() {
    // Check if any APT locks are present
    const hasAptLock = await checkAptLocks();
    if (hasAptLock) {
        logIssue('APT lock detected.');
        return false;
    }
    // Check for other blocking processes
    const isClear = await checkOtherLocks();
    if (!isClear) {
        logIssue('Other locks detected.');
        return false;
    }
    
    // Check access to critical directories
    const hasAccess = await checkDirectoryPermissions();
    if (!hasAccess) {
        logIssue('Insufficient permissions for critical directories.');
        return false;
    }
    
    return true;
}

async function taskExecutionHandler(req) {
    const base44 = createClientFromRequest(req);
    try {
        const ready = await checkEnvironmentReadiness();
        if (!ready) {
            return Response.json({ error: 'Environment not ready for task execution.' }, { status: 500 });
        }
        // Proceed with task execution logic
        // ...
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

Deno.serve(taskExecutionHandler);