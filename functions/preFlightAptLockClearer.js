import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo rm -rf /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend /var/cache/apt/archives/lock'],
        stdout: 'null',
        stderr: 'null'
    });
    const { code } = await exec.status();
    exec.close();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptCleared = await clearAptLocks();
        if (!aptCleared) {
            throw new Error('Failed to clear APT locks.');
        }
        // Proceed with the intended task execution here...
        return Response.json({ status: 'APT locks cleared, moving to task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});