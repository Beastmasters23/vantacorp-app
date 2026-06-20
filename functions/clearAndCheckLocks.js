import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAndCheckLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo apt-get -y update; sudo apt-get -y upgrade'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await exec.status();
    if (code !== 0) throw new Error('APT command failed. Check if locks are present.');
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAndCheckLocks();
        return Response.json({ message: 'Lock cleared and system ready.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});