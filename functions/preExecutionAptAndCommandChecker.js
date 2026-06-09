import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from 'child_process';

async function checkAptLocks() {
    return new Promise((resolve, reject) => {
        exec('sudo fuser -v /var/lib/dpkg/lock', (error, stdout, stderr) => {
            if (error && !stderr.includes('No such file or directory')) {
                resolve(true); // APT lock exists
            } else {
                resolve(false); // No APT lock
            }
        });
    });
}

async function checkCommandAvailability(command) {
    return new Promise((resolve) => {
        exec(`command -v ${command}`, (error) => {
            resolve(!error); // true if command exists
        });
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'grep', 'sudo']; // Add other essential commands here

    try {
        // Perform pre-execution checks
        const aptLocked = await checkAptLocks();
        if (aptLocked) {
            return Response.json({ error: 'APT is locked, clearing is necessary.' }, { status: 503 });
        }

        const commandChecks = await Promise.all(commandsToCheck.map(checkCommandAvailability));
        const missingCommands = commandsToCheck.filter((_, index) => !commandChecks[index]);
        if (missingCommands.length > 0) {
            return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 400 });
        }

        // Proceed with the original task logic (to be filled in)
        return Response.json({ message: 'All checks passed, ready to execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});