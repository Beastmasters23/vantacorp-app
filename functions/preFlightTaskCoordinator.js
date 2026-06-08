import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const lockStatus = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock*']
    }).status();
    return lockStatus.success;
}

async function handleLongRunningTask(taskFunction) {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Task timeout exceeded')), 3600000)); // 1 hour timeout
    return Promise.race([taskFunction(), timeoutPromise]);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        if (await checkAndClearAptLocks()) {
            const result = await handleLongRunningTask(async () => {
                // Insert your task logic here
                return 'Task executed successfully';
            });
            return Response.json({ result }, { status: 200 });
        } else {
            return Response.json({ error: 'Failed to clear APT locks.' }, { status: 409 });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});