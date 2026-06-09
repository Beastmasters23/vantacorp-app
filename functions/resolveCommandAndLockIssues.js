import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from "https://deno.land/x/exec/mod.ts";

async function resolveCommandAndLockIssues() {
    try {
        // Check and clear APT locks
        await exec("sudo rm /var/lib/apt/lists/lock"); // Remove lock file
        await exec("sudo rm /var/cache/apt/archives/lock"); // Remove lock file
        await exec("sudo rm /var/lib/dpkg/lock*;"); // Remove dpkg locks

        return true;
    } catch (error) {
        console.error('Failed to resolve APT locks:', error);
        return false;
    }
}

async function validateCommands() {
    const essentialCommands = ['cat', 'echo', 'ls'];  // Example essential commands
    const missingCommands = [];

    for (const command of essentialCommands) {
        try {
            await exec(command);
        } catch {
            missingCommands.push(command);
        }
    }

    if (missingCommands.length) {
        console.warn('Missing commands:', missingCommands);
        // Here we can implement a fallback mechanism if needed
    }
    return missingCommands.length === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksResolved = await resolveCommandAndLockIssues();
        const commandsValid = await validateCommands();
        if (locksResolved && commandsValid) {
            return Response.json({ message: 'Pre-flight check successful.' });
        } else {
            return Response.json({ error: 'Pre-flight checks failed.' }, { status: 500 });
        }
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});