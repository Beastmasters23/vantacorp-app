import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo rm /var/lib/apt/lists/lock; sudo rm /var/cache/apt/archives/lock; sudo rm /var/lib/dpkg/lock'],
        stderr: 'piped',
        stdout: 'piped'
    });
    const { code } = await exec.status();
    if (code !== 0) {
        throw new Error(`Failed to clear APT locks: ${new TextDecoder().decode(await exec.stderrOutput())}`);
    }
    exec.close();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks(); // Check and clear APT locks
        // Proceed with task execution after clearing locks
        return Response.json({ message: 'APT locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});