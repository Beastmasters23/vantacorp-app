import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const APT_Lock_Path = '/var/lib/dpkg/lock-frontend';
    const fs = Deno;

    try {
        const lockExists = await fs.exists(APT_Lock_Path);
        if (lockExists) {
            console.log('APT lock detected, attempting to clear...');
            await fs.run({ cmd: ['sudo', 'rm', APT_Lock_Path] });
            console.log('APT lock cleared.');
        } else {
            console.log('No APT lock present.');
        }
    } catch (error) {
        console.error('Failed to check or clear APT lock:', error);
        throw new Error('APT lock clearance failed.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT locks checked and cleared if necessary.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});