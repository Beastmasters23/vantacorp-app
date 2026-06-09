import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function preFlightCommandValidator(command: string): Promise<boolean> {
    const commandCheck = await Deno.run({
        cmd: ['bash', '-c', `command -v ${command}`],
        stdout: 'piped',
        stderr: 'piped'
    });
    const output = await commandCheck.output();
    commandCheck.close();
    return output.length > 0;
}

async function clearAPT_Locks() {
    await Deno.run({ cmd: ['sudo', 'apt-get', 'remove', '-y', 'lock'] }).status();
}

async function runTaskWithChecks(directive: string): Promise<void> {
    // Check for necessary commands
    const commandsNeeded = ['cat', 'grep', 'echo']; // Example commands
    for (const command of commandsNeeded) {
        if (!await preFlightCommandValidator(command)) {
            throw new Error(`Command ${command} not found, unable to proceed.`);
        }
    }

    // Clear APT locks before executing the directive
    await clearAPT_Locks();

    // Execute the directive
    const taskProcess = Deno.run({
        cmd: directive.split(' ')
    });

    const status = await taskProcess.status();
    if (!status.success) {
        throw new Error(`Task failed to execute: ${directive}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Example usage of running a directive
        await runTaskWithChecks('cat /path/to/file');
        return Response.json({ status: 'Task executed successfully' });
    } catch(error) { 
        return Response.json({ error: error.message }, { status: 500 });
    }
});