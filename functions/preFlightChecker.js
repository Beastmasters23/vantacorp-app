import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const checkAndClearLocks = async () => {
    // Check for APT locks and clear them if necessary
    const { stdout, stderr } = await Deno.run({
        cmd: ['bash', '-c', 'sudo rm /var/lib/apt/lists/lock /var/lib/dpkg/lock*'],
        stdout: 'piped',
        stderr: 'piped',
    }).output();
    if (stderr.length) {
        throw new Error(new TextDecoder().decode(stderr));
    }
    return new TextDecoder().decode(stdout);
};

const checkCommandAvailability = async (command) => {
    const { stdout, stderr } = await Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped',
    }).output();
    if (stderr.length) {
        return false; // Command not found
    }
    return true; // Command is available
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearLocks(); // Clear any APT locks

        // Check commands necessary for task execution
        const commandsToCheck = ['cat', 'echo'];
        const missingCommands = [];
        for (const command of commandsToCheck) {
            if (!(await checkCommandAvailability(command))) {
                missingCommands.push(command);
            }
        }

        if (missingCommands.length) {
            throw new Error('Missing commands: ' + missingCommands.join(', '));
        }

        return Response.json({ message: 'Environment is ready.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});