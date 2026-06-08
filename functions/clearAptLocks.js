import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        const { success } = await exec("sudo fuser -k /var/lib/dpkg/lock");
        if (success) {
            console.log('APT lock cleared successfully.');
        } else {
            console.log('No APT lock found to clear.');
        }
    } catch (error) {
        console.error('Error clearing APT locks:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Call the APT lock clearance function
        await clearAptLocks();

        // Further task processing would go here

        return Response.json({ message: 'Task processing complete.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});