import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const checkCommandAvailability = async (commands) => {
    const { exec } = Deno;
    const missingCommands = [];
    for (const command of commands) {
        try {
            await exec(`${command} --version`);
        } catch { 
            missingCommands.push(command);
        }
    }
    return missingCommands;
};

const clearAptLocks = async () => {
    try {
        await exec('sudo fuser -k /var/lib/dpkg/lock-frontend');
        await exec('sudo fuser -k /var/lib/dpkg/lock');
    } catch (error) {
        console.error('Failed to clear apt locks:', error);
    }
};

const verifyProcessStates = async (expectedProcesses) => {
    const { exec } = Deno;
    const inactiveProcesses = [];
    for (const process of expectedProcesses) {
        try {
            await exec(`pgrep ${process}`);
        } catch {
            inactiveProcesses.push(process);
        }
    }
    return inactiveProcesses;
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const criticalCommands = ['cat', 'grep', 'awk', 'sed'];
    const expectedProcesses = ['apt-get', 'dpkg'];

    const missingCommands = await checkCommandAvailability(criticalCommands);
    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 500 });
    }

    await clearAptLocks();
    const inactiveProcesses = await verifyProcessStates(expectedProcesses);
    if (inactiveProcesses.length > 0) {
        return Response.json({ error: 'Inactive processes: ' + inactiveProcesses.join(', ') }, { status: 500 });
    }

    return Response.json({ message: 'All checks passed, ready for task execution.' });
});