import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        const { status } = await Deno.run({
            cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock; sudo dpkg --configure -a'],
            stdout: 'piped',
            stderr: 'piped',
        }).status();
        return status;
    } catch (error) {
        throw new Error(`Failed to clear locks: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Clear apt locks before executing any task.
        const lockStatus = await clearAptLocks();
        if (lockStatus !== 0) {
            return Response.json({ error: 'Could not clear system locks.' }, { status: 500 });
        }
        // Return success response after clearing locks
        return Response.json({ message: 'Apt locks cleared successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});