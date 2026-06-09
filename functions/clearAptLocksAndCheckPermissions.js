import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocksAndCheckPermissions() {
    try {
        // Command to check and clear APT locks
        const lockCheckCmd = 'sudo fuser -v /var/lib/dpkg/lock';
        const lockClearCmd = 'sudo rm /var/lib/dpkg/lock';
        const permissionsCheckCmd = 'sudo -n true';
        const result1 = await Deno.run({
            cmd: lockCheckCmd.split(' '),
            stdout: 'piped',
            stderr: 'piped'
        });
        const { code: lockCheckExitCode } = await result1.status();

        if (lockCheckExitCode === 0) {
            await Deno.run({ cmd: lockClearCmd.split(' ') }).status();
        }

        // Check permissions for executing important commands
        const result2 = await Deno.run({
            cmd: permissionsCheckCmd.split(' '),
            stdout: 'piped',
            stderr: 'piped'
        });
        const { code: permissionsExitCode } = await result2.status();

        return permissionsExitCode === 0;
    } catch (error) {
        console.error('Error in locking and permissions check:', error);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const permissionsChecked = await clearAptLocksAndCheckPermissions();
        if (!permissionsChecked) {
            return Response.json({ error: 'Insufficient permissions or APT locks present.' }, { status: 403 });
        }
        // Proceed with task execution if clear
        return Response.json({ message: 'Tasks can proceed safely.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});