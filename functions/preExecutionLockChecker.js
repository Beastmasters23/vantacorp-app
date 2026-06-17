import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for active APT lock status
        const isLocked = await checkAPTLock();
        if (isLocked) {
            // Wait and Retry Logic for Locked State
            let attempts = 0;
            const maxAttempts = 5;
            while (isLocked && attempts < maxAttempts) {
                await new Promise(res => setTimeout(res, 10000)); // Wait for 10 seconds
                isLocked = await checkAPTLock();
                attempts++;
            }
            if (isLocked) {
                return Response.json({ error: 'APT lock still active after retries. Task failed.' }, { status: 500 });
            }
        }
        // Proceed with normal task execution logic
        // ...
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAPTLock() {
    // Simulate the check for APT lock
    const lockExists = Math.random() < 0.3; // Randomly simulate a lock for 30% of cases
    return lockExists;
}