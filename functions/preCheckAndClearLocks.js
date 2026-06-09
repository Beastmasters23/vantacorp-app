import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearLocks() {
    const { exec } = Deno;
    const aptLockCommand = "sudo rm -f /var/lib/dpkg/lock*";
    try {
        await exec(aptLockCommand);
        console.log('APT locks cleared.');
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        throw new Error('Unable to clear APT locks');
    }
}

async function checkCommandAvailable(command) {
    const checkCommand = `command -v ${command}`;
    const output = await exec(checkCommand);
    return output.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    await checkAndClearLocks();
    const commands = ['cat', 'ls', 'grep']; // Add other critical commands here
    for (const command of commands) {
        const isAvailable = await checkCommandAvailable(command);
        if (!isAvailable) {
            return Response.json({ error: `${command} is not available` }, { status: 500 });
        }
    }
    return Response.json({ status: 'All checks passed!' });
});