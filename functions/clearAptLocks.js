import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo apt-get clean'],
        stdout: 'piped',
        stderr: 'piped',
    });

    const { success } = await exec.status();
    exec.close();
    return success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const isCleared = await clearAptLocks();
    if (!isCleared) {
        return Response.json({ error: 'Failed to clear APT locks' }, { status: 500 });
    }
    return Response.json({ message: 'APT locks cleared, ready to proceed with tasks.' });
});