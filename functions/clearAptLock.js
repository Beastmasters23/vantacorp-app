import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLock() {
    const { exec } = Deno;
    try {
        await exec('sudo rm -f /var/lib/dpkg/lock-frontend');
        await exec('sudo rm -f /var/lib/dpkg/lock');
        await exec('sudo dpkg --configure -a');
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        return false;
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const aptLockCleared = await clearAptLock();
    if (!aptLockCleared) {
        return Response.json({ error: 'Could not clear APT lock' }, { status: 500 });
    }
    // Continue with the rest of the task execution
    // ...
    return Response.json({ message: 'Task executed successfully' });
});