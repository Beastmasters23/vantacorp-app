import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        // Attempt to unlock apt locks
        await Deno.run({
            cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock-frontend; sudo fuser -k /var/lib/dpkg/lock; sudo dpkg --configure -a']
        }).status();
        return { success: true };  
    } catch (error) {
        throw new Error('Failed to clear apt locks: ' + error.message);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockStatus = await clearAptLocks();
        return Response.json({ status: lockStatus }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});