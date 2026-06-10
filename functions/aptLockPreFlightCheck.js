import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function isAptLocked() {
    const { exec } = Deno;
    const output = await exec('fuser /var/lib/dpkg/lock');
    return output.status === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        if (await isAptLocked()) {
            return Response.json({ error: 'APT is locked. Task cannot proceed.' }, { status: 423 });
        }
        // Proceed with task execution
        return Response.json({ message: 'Tasks can proceed, APT is not locked.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});