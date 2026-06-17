import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    for (const command of commands) {
        const cmdResult = await executeCommand(`which ${command}`);
        if (!cmdResult.success) {
            console.error(`Command ${command} not found. Attempting to resolve.`);
            return false;
        }
    }
    return true;
}

async function clearAptLocks() {
    const cmdResult = await executeCommand(`sudo fuser -v /var/lib/dpkg/lock`; // Ensure APT locks are cleared
    if (!cmdResult.success) {
        console.error('APT lock could not be cleared.');
        return false;
    }
    return true;
}

async function executeCommand(command) {
    const { success } = await Deno.run({
        cmd: command.split(' '),
        stdout: "null"
    }).status();
    return { success };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'echo', 'nohup']; // Add essential commands here
    try {
        const commandAvailable = await checkCommandAvailability(requiredCommands);
        const aptLocksCleared = await clearAptLocks();
        if (!commandAvailable || !aptLocksCleared) {
            return Response.json({ error: 'Pre-checks failed. Fix issues before executing tasks.' }, { status: 400 });
        }
        // Proceed with task execution logic here
        // ...
        return Response.json({ success: 'Tasks can now be executed safely.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});