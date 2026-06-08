import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const process = Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock || true && sudo fuser -k /var/cache/apt/archives/lock || true'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { stdout, stderr } = await process.output();
    process.close();
    return { success: true, stdout: new TextDecoder().decode(stdout).trim(), stderr: new TextDecoder().decode(stderr).trim() };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const result = await clearAptLocks();
        return Response.json({ result }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});