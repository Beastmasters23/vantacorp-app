import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const checkSystemReady = async () => {
    // Check for apt locks
    const aptLockExists = await Deno.run({
        cmd: ['sh', '-c', 'test -e /var/lib/dpkg/lock || echo No'],
    }).status();

    // Check for long-running tasks, assuming a hardcoded max duration of 60 minutes
    const longRunningTasks = await Deno.run({
        cmd: ['sh', '-c', 'ps -eo etime,pid,cmd | grep Running | awk \\"$1 > 60\\"'],
    }).status();

    return !(aptLockExists.success || longRunningTasks.success);
};

const logIssue = async (message) => {
    console.log(`[${new Date().toISOString()}] WARNING: ${message}`);
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isSystemReady = await checkSystemReady();
        if (!isSystemReady) {
            await logIssue('System is not ready for task execution.');
            return Response.json({ error: 'System is busy. Please try again later.' }, { status: 503 });
        }
        // Proceed with task execution here...
        return Response.json({ message: 'System is ready for task execution.' } );
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});