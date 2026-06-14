import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAPT() {
    const { exec } = Deno;
    try {
        // Check if there are APT locks
        const checkLock = await exec("sudo fuser /var/lib/dpkg/lock");
        if (checkLock.status === 0) {
            // Clear APT locks
            await exec("sudo rm /var/lib/dpkg/lock");
            await exec("sudo dpkg --configure -a");
        }
    } catch (error) {
        console.error('Failed to check or clear APT locks:', error);
        throw new Error('APT lock check/clear failed.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAPT(); // Ensure APT locks are cleared before proceeding
        // Proceed with task execution logic here
        return Response.json({ status: 'Task ready to execute' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});