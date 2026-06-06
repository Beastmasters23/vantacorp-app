import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const command = "sudo fuser -k /var/lib/apt/lists/lock"; // Command to free lock
    const process = Deno.run({
        cmd: ['bash', '-c', command],
        stderr: 'piped',
        stdout: 'piped',
    });
    const { code } = await process.status();
    if (code !== 0) {
        throw new Error(`Failed to clear apt locks: ${code}`);
    }
}

async function checkSudoPrivileges() {
    const process = Deno.run({
        cmd: ['sudo', '-n', 'true'],
        stderr: 'piped',
        stdout: 'piped',
    });
    const { code } = await process.status();
    if (code !== 0) {
        throw new Error('Insufficient sudo privileges.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkSudoPrivileges();
        await clearAptLocks();
        return Response.json({ message: 'Pre-flight check completed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});