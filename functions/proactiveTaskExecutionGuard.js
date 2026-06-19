import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearLocks() {
    const locks = await getAPTLocks(); // Assuming a function to get APT locks
    if (locks.length > 0) {
        for (const lock of locks) {
            await clearLock(lock); // Function to clear individual APT lock
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearLocks(); // Clear APT locks before executing tasks
        // Proceed with normal task execution logic here.
        // ...
        return Response.json({ message: 'Task started successfully' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});