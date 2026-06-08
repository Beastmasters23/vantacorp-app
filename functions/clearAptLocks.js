import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Implement logic to detect and clear APT locks
    const command = 'sudo fuser -vki /var/lib/dpkg/lock; sudo fuser -vki /var/cache/apt/archives/lock;';
    const result = await Deno.run({
        cmd: ['bash', '-c', command],
        stdout: 'piped',
        stderr: 'piped'
    });

    const output = new TextDecoder().decode(await result.output());
    const error = new TextDecoder().decode(await result.stderrOutput());
    if (error) throw new Error(`Failed to clear APT locks: ${error}`);
    console.log('APT locks cleared:', output);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ status: 'APT locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});