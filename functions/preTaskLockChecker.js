import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkForLocks() {
    // This function checks for any APT or non-APT locks in the system.
    try {
        const { status } = await Deno.run({
            cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock'],
            stdout: 'piped',
            stderr: 'piped'
        }).output();

        return status === 0; // True if lock exists
    } catch (error) {
        throw new Error(`Lock check failed: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockExists = await checkForLocks();
        if (lockExists) {
            return Response.json({ message: 'Task cannot be executed due to existing locks.' }, { status: 503 });
        }

        // Proceed with task execution if no locks are found
        return Response.json({ message: 'No locks found, task can proceed.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});