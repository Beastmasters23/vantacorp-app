import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();  // New function to clear APT lock
        await checkCommandAvailability();  // Checks for essential commands
        // Proceed with executing the task
        // Placeholder for task execution code
        return Response.json({ success: true }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function clearAptLocks() {
    // Logic to clear APT locks if they're present
    console.log('Checking for APT locks...');
    const locksCleared = await runCommand('sudo rm /var/lib/dpkg/lock');  // Example command to clear APT lock
    return locksCleared;
}

async function checkCommandAvailability() {
    const requiredCommands = ['apt', 'cat', 'echo'];  // Add required commands here
    for (const command of requiredCommands) {
        const available = await isCommandAvailable(command);
        if (!available) throw new Error(`Required command missing: ${command}`);
    }
}

async function isCommandAvailable(command) {
    const { stdout } = await runCommand(`command -v ${command}`);
    return !!stdout;
}

async function runCommand(command) {
    const process = Deno.run({
        cmd: command.split(' '),
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await process.status();
    const stdout = new TextDecoder().decode(await process.output());
    const stderr = new TextDecoder().decode(await process.stderrOutput());
    if (code !== 0) throw new Error(stderr.trim() || 'Command failed without error message.');
    return stdout.trim();
}