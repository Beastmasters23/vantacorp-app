import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    try {
        const lockCheckCmd = 'sudo lsof /var/lib/dpkg/lock';
        const lockClearCmd = 'sudo rm -f /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend';
        const { success } = await Deno.run({ cmd: ["sh", "-c", lockCheckCmd], stdout: "piped" });
        if (success) {
            console.log('APT lock detected, attempting to clear it.');
            await Deno.run({ cmd: ["sh", "-c", lockClearCmd] });
            console.log('APT lock cleared successfully.');
        } else {
            console.log('No APT lock detected, ready to proceed.');
        }
    } catch (error) {
        console.error('Error checking or clearing APT locks:', error);
        throw error;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        // Proceed with task execution logic here. 
        return Response.json({ message: 'Task executed successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});