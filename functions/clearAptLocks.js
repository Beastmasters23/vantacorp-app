import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        const result = await Deno.run({
            cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo fuser -k /var/cache/apt/archives/lock; echo "APT locks cleared"'],
            stdout: 'piped',
            stderr: 'piped',
        });

        const { stdout } = await result.output();
        console.log(new TextDecoder().decode(stdout));
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Proceed with task execution after clearing locks
        return Response.json({ status: 'APT locks cleared, proceed with tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});