import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec("sudo apt-get clean");
        await exec("sudo rm /var/lib/apt/lists/lock");
        await exec("sudo rm /var/cache/apt/archives/lock");
        await exec("sudo rm /var/lib/dpkg/lock*");
        await exec("sudo dpkg --configure -a");
        console.log('APT locks cleared successfully.');
    } catch (error) {
        console.error('Error clearing APT locks:', error);
        throw new Error('APT lock clearance failed.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Insert additional task processing logic here
        return Response.json({ status: "APT locks are cleared, ready for task execution." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});