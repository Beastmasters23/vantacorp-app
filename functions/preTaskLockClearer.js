import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo rm /var/lib/apt/lists/lock /var/cache/apt/archives/lock /var/lib/dpkg/lock*'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { success } = await exec.status();
    exec.close();
    return success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockClearSuccess = await clearLocks();
        if (!lockClearSuccess) {
            return Response.json({ error: 'Failed to clear apt locks.' }, { status: 500 });
        }
        return Response.json({ message: 'Apt locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});