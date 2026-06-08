import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const process = Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock-frontend; sudo fuser -k /var/lib/dpkg/lock; sudo apt-get clean'],
        stdout: "piped",
        stderr: "piped"
    });

    const [stdout, stderr] = await Promise.all([process.output(), process.stderrOutput()]);
    const output = new TextDecoder().decode(stdout);
    const error = new TextDecoder().decode(stderr);

    if (process.status.code !== 0) {
        throw new Error(`Failed to clear APT locks: ${error}`);
    }

    return output;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const result = await clearAptLocks();
        return Response.json({ status: 'success', message: result });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});