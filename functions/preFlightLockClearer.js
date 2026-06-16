import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec("sudo apt-get remove -f lock");
        return true;
    } catch (error) {
        console.error('Error while clearing APT locks:', error);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const success = await clearAptLocks();
        if(!success) {
            return Response.json({ error: 'Failed to clear APT locks. Task may not execute.' }, { status: 400 });
        }
        // Proceed with the requested task after ensuring no APT locks
        return Response.json({ message: 'Task can now proceed safely.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});