import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock* || true'],
        stderr: 'piped',
        stdout: 'piped',
    });

    const { code } = await exec.status();
    exec.close();

    if (code !== 0) {
        const err = await Deno.readAll(exec.stderr);
        throw new Error(new TextDecoder().decode(err));
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Additional task processing logic here.
        return Response.json({ message: 'Apt locks cleared, task can proceed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});