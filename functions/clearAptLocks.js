import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'while sudo fuser /var/lib/dpkg/lock > /dev/null 2>&1; do sleep 1; done;'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await exec.status();
    if (code !== 0) {
        throw new Error(`Error clearing apt locks: ${new TextDecoder().decode(await exec.stderrOutput())}`);
    }
    exec.close();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'Apt locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});