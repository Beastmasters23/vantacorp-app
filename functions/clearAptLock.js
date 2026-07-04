import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const clearAptLock = async () => {
    const { runShellCommand } = require('shell-utils'); // Utility to run shell commands
    try {
        await runShellCommand('sudo rm /var/lib/dpkg/lock-frontend');
        await runShellCommand('sudo rm /var/lib/dpkg/lock');
        await runShellCommand('sudo dpkg --configure -a');
    } catch (error) {
        throw new Error('Failed to clear apt lock: ' + error.message);
    }
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLock();
        return Response.json({ message: 'Apt lock cleared successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});