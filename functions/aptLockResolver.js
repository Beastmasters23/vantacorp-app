import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { stdout, stderr } = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock-frontend /var/cache/apt/archives/lock'],
        stdout: 'piped',
        stderr: 'piped',
    }).output();
    stdout; // Handle output if necessary
    if (stderr && stderr.length > 0) throw new Error(new TextDecoder().decode(stderr));
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for APT locks and clear them
        await clearAptLocks();
        // Continue with the primary task execution here...
        return Response.json({ message: 'APT locks cleared, ready for next task' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});