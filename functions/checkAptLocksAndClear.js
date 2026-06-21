import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    // Check for APT locks
    async function checkAndClearAptLocks() {
        try {
            const lockCheck = await Deno.run({
                cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo fuser -k /var/cache/apt/archives/lock'],
                stdout: 'piped',
                stderr: 'piped'
            });
            const { code } = await lockCheck.status();
            if (code === 0) {
                console.log('APT locks cleared successfully.');
            } else {
                const error = new TextDecoder().decode(await lockCheck.stderrOutput());
                console.error('Error clearing APT locks:', error);
            }
        } catch (error) {
            console.error('Error checking APT locks:', error);
        }
    }

    await checkAndClearAptLocks();

    return Response.json({ message: 'APT lock checker executed.' }, { status: 200 });
});