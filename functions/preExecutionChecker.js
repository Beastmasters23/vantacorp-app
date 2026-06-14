import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearLocks() {
    // Command to check for APT locks
    const lockCheckCommand = "sudo fuser /var/lib/dpkg/lock*";
    // Command to clear locks if any process is holding it
    const clearLockCommand = "sudo rm /var/lib/dpkg/lock*";
    try {
        const { output } = await executeCommand(lockCheckCommand);
        if (output.length > 0) {
            await executeCommand(clearLockCommand);
        }
    } catch (error) {
        console.error('Error checking or clearing APT locks:', error);
    }
}

async function validateCommand(command) {
    // Check if a command exists
    const { output } = await executeCommand(`which ${command}`);
    return output.length > 0;
}

async function executeCommand(cmd) {
    const process = Deno.run({
        cmd: cmd.split(" "),
        stdout: "piped",
        stderr: "piped",
    });
    const { stdout, stderr } = await process.output();
    const output = new TextDecoder().decode(stdout).trim();
    const errorOutput = new TextDecoder().decode(stderr).trim();
    process.close();
    if (errorOutput) throw new Error(errorOutput);
    return { output };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    await checkAndClearLocks();

    const commandsToValidate = ["cat", "bash", "sudo"]; // Add commonly used commands
    for (const cmd of commandsToValidate) {
        const exists = await validateCommand(cmd);
        if (!exists) return Response.json({ error: `${cmd} command not found` }, { status: 404 });
    }

    return Response.json({ message: 'All checks passed, ready to execute tasks.' });
});