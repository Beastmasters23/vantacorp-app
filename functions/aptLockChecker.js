import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLock() {
    try {
        const { stdout } = await Deno.run({
            cmd: ['bash', '-c', 'sudo lsof /var/lib/dpkg/lock'],
            stdout: 'piped',
            stderr: 'piped',
        }).output();
        return stdout.length === 0; // Return true if no apt lock exists
    } catch (error) {
        console.error('Error checking apt lock', error);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptLockFree = await checkAptLock();
        if (!aptLockFree) {
            return Response.json({ error: 'APT lock detected. Please resolve before executing new tasks.' }, { status: 423 });
        }
        // Proceed with running tasks if no apt lock is found
        // Existing task execution logic goes here
        return Response.json({ success: 'Tasks can execute.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});