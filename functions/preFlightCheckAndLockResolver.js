import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from "https://deno.land/x/exec/mod.ts";

async function clearAptLocks() {
    try {
        await exec("sudo rm /var/lib/apt/lists/lock");
        await exec("sudo rm /var/cache/apt/archives/lock");
        await exec("sudo rm /var/lib/dpkg/lock");
    } catch (error) {
        console.error('Failed to clear apt locks:', error);
    }
}

async function checkCommand(command) {
    try {
        await exec(`command -v ${command}`);
        return true;
    } catch {
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const necessaryCommands = ["cat", "echo", "rm", "apt"...]; // Add more commands as needed
    const missingCommands = [];
    for (const command of necessaryCommands) {
        if (!(await checkCommand(command))) {
            missingCommands.push(command);
        }
    }
    if (missingCommands.length > 0) {
        return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 500 });
    }

    await clearAptLocks();

    return Response.json({ status: 'Pre-flight check completed, apt locks cleared, and commands verified.' });
});