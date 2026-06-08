import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAPTLocks() {
    const isLocked = await fetch('/var/lib/dpkg/lock');
    if (isLocked.ok) {
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'] });
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAPTLocks();
        // Proceed with the task execution logic here...
        return Response.json({ message: 'APT locks checked and cleared if necessary.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});