import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Function to check for APT locks and clear them if found
async function clearAptLocksIfPresent() {
    const locked = await checkAptLock();
    if (locked) {
        await clearAptLock(); // Placeholder for the function that clears the lock
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocksIfPresent(); // Ensure no APT lock before proceeding
        // Existing task execution logic goes here
    } catch (error) { 
        return Response.json({ error: error.message }, { status: 500 }); 
    }
});