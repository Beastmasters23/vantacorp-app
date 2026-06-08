import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTBlocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock; sudo killsall apt-get;']
    });
    const { code } = await exec.status();
    return code === 0;
}

async function verifySystemReadiness() {
    const isLocked = await clearAPTBlocks();
    if (!isLocked) {
        throw new Error('Could not clear APT locks.');
    }
    // Additional system readiness checks can be implemented here.
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await verifySystemReadiness();
        return Response.json({ message: 'System is ready for task execution.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});