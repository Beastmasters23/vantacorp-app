import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    try {
        const { stdout } = await Deno.run({
            cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock-frontend']
        }).status();
        return stdout;
    } catch (error) {
        console.error('Failed to clear APT locks: ', error);
        throw new Error('Failed to clear APT locks');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        // Additional logic for executing tasks can be added here
        return Response.json({ message: 'APT locks checked and cleared if necessary. Task can proceed.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});