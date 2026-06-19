import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['sudo', 'sh', '-c', 'apt-get clean; apt-get update'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const [status, stdout, stderr] = await Promise.all([
        exec.status(),
        exec.output(),
        exec.stderrOutput(),
    ]);

    if (status.success) {
        console.log(new TextDecoder().decode(stdout));
    } else {
        console.error(new TextDecoder().decode(stderr));
        throw new Error('Failed to clear APT locks');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT locks cleared and system ready for directives.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});