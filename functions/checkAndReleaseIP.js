import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndReleaseIP(ipAddress) {
    try {
        const existingIP = await checkIfIPExists(ipAddress);
        if (existingIP) {
            console.log(`IP ${ipAddress} is already assigned. Attempting to release...`);
            await releaseIPAddress(ipAddress);
            console.log(`IP ${ipAddress} released successfully.`);
        } else {
            console.log(`IP ${ipAddress} is free for use.`);
        }
    } catch (error) {
        console.error(`Failed to check/release IP: ${error.message}`);
        throw new Error(`IP management error: ${error.message}`);
    }
}

async function purgingTask(taskDetails) {
    try {
        // Logic to purge non-agent artifacts
        console.log(`Starting purge task: ${taskDetails}`);
        const result = await executePurge(taskDetails);
        console.log(`Purge completed: ${result}`);
    } catch (error) {
        console.error(`Error during purging: ${error.message}`);
        throw new Error(`Purge task failed: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const ipAddress = '192.168.1.1'; // example IP
        await checkAndReleaseIP(ipAddress);
        const taskDetails = 'Aggressive purge of all non-agent artifacts';
        await purgingTask(taskDetails);
        return Response.json({ message: 'Tasks executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});