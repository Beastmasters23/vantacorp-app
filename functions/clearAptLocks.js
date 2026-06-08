import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Execute command to remove APT locks if they exist
    try {
        const result = await Deno.run({
            cmd: ['sh', '-c', 'sudo fuser -cuk /var/lib/dpkg/lock*']
        }).status();
        if (!result.success) throw new Error('Failed to clear APT locks');
    } catch (error) {
        throw new Error('APT lock clearance error: ' + error.message);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});