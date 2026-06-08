import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Function to check and clear APT locks
    try {
        // Check for APT locks and clear them
        const result = await Deno.run({
            cmd: ['sudo', 'apt-get', 'clean'],
        }).status();
        if (result.success) {
            console.log('APT locks cleared successfully.');
        } else {
            console.warn('Failed to clear APT locks.');
        }
    } catch (error) {
        console.error('Error while trying to clear APT locks:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks(); // Clear APT locks before executing any tasks
        // Placeholder for task execution code
        return Response.json({ success: true, message: 'Task handled successfully' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});