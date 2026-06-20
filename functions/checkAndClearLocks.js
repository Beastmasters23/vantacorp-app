import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkForAPTLocks() {
    const locks = await Deno.run({
        cmd: ['sh', '-c', 'sudo lsof /var/lib/dpkg/lock']
    });
    const output = await locks.output();
    return output.length === 0;
}

async function clearAPPLocks() {
    await Deno.run({
        cmd: ['sh', '-c', 'sudo rm -f /var/lib/dpkg/lock']
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        if (!await checkForAPTLocks()) {
            await clearAPPLocks();
        }
        // Proceed with normal operations
        return Response.json({ message: 'No locks found, operations can proceed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});