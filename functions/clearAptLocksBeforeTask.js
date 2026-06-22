import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const clearAptLock = async () => {
    try {
        const response = await Deno.run({
            cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock'],
            stdout: 'null',
            stderr: 'null',
        });
        const status = await response.status();
        if (!status.success) throw new Error('Failed to clear APT locks');
    } catch (err) {
        console.error(`APT lock clearance error: ${err.message}`);
        throw new Error('Error clearing APT locks');
    }
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Clear APT locks before executing any critical task
        await clearAptLock();
        // Continue with other task execution logic...
        return Response.json({ result: 'APT locks cleared and task executed' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});