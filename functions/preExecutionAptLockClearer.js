import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLock() {
    const exec = Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'],
        stdout: 'null', // Discard output
        stderr: 'null',
    });
    const { code } = await exec.status();
    exec.close();
    if (code !== 0) throw new Error('Failed to clear APT lock');
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // First, clear any APT locks
        await clearAptLock();
        // Execute main task logic here
        // ...
        return Response.json({ status: 'Task executed successfully' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});