import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        // Attempt to clear APT locks
        await exec("sudo rm /var/lib/dpkg/lock*");
        await exec("sudo rm /var/cache/apt/archives/lock");
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const retryCount = 3;
    let attempt = 0;
    let success = false;

    while (attempt < retryCount && !success) {
        attempt++;
        // Clear APT locks before task execution
        await clearAptLocks();
        try {
            // Simulate task execution
            const result = await base44.runTask();
            success = true;
            return Response.json({ result }, { status: 200 });
        } catch (error) {
            console.error('Task failed:', error);
            if (attempt >= retryCount) {
                return Response.json({ error: 'Task failed after multiple attempts: ' + error.message }, { status: 500 });
            }
            console.log('Retrying task...');
        }
    }
});
