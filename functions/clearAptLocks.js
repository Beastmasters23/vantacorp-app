import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -vki /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend /var/cache/apt/archives/lock']
    }).status();
    return result.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockCleared = await clearAptLocks();
        if (!lockCleared) throw new Error('Could not clear APT locks.');
        // Continue with task execution logic here.
        return Response.json({ message: 'APT locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});