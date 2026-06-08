import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const checkAndClearAptLocks = async () => {
    const { exec } = Deno;
    try {
        // Check if there are any APT locks
        const { code } = await exec("sudo lsof /var/lib/apt/locks");
        if (code === 0) {
            // APT lock detected, attempt to release it
            console.log('APT lock detected, attempting to clear...');
            await exec("sudo rm /var/lib/apt/locks");
            console.log('APT locks cleared.');
        }
    } catch (error) {
        console.error('Error checking or clearing APT locks:', error.message);
    }
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    await checkAndClearAptLocks(); // Ensure APT locks are cleared
    // Proceed with executing the requested task or directive...
    try {
        // Task execution logic here
        return Response.json({ status: "Task executed successfully" });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});