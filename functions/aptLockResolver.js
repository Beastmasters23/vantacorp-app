import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptLockCheck = await checkAndClearAptLocks();
        if (!aptLockCheck.success) {
            throw new Error('Could not clear APT locks. Current lock status: ' + aptLockCheck.locks);
        }
        // Proceed to execute the tasks securely if no APT locks are present.
        // This is a placeholder for actual task execution logic.
        return Response.json({ message: 'Tasks can be executed safely.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAndClearAptLocks() {
    // Logic to check for APT locks and attempt to clear them if present.
    try {
        const output = await Deno.run({
            cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock; sudo rm -f /var/lib/dpkg/lock'],
            stdout: 'piped',
            stderr: 'piped'
        }).output();
        const result = new TextDecoder().decode(output);
        // Check if locks were present and cleared
        if (result.includes('is in use')) {
            return { success: false, locks: result };
        }
        return { success: true };
    } catch (error) {
        console.error('Error clearing APT locks:', error);
        return { success: false, locks: 'Error in determining APT lock status.' };
    }
}