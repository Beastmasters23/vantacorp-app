import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const COMMANDS = ['cat', 'ls', 'echo'];  // List of essential commands
    const TIMEOUT_THRESHOLD = 300; // Timeout threshold in seconds

    const commandExists = async (command) => {
        const { code } = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null',
        }).status();
        return code === 0;
    };

    const checkCommandsAvailability = async () => {
        const availabilityPromises = COMMANDS.map(commandExists);
        const results = await Promise.all(availabilityPromises);
        return COMMANDS.filter((_, index) => !results[index]);
    };

    const executeTaskWithTimeout = async (taskCommand) => {
        const process = Deno.run({
            cmd: taskCommand,
            stdout: 'piped',
            stderr: 'piped',
        });

        let timeout;
        const outputPromise = process.output();
        const statusPromise = process.status();

        timeout = new Promise((_, reject) => setTimeout(() => {
            process.kill(Deno.Signal.SIGTERM); // Kill long running processes
            reject(new Error('Task exceeded timeout threshold'));  
        }, TIMEOUT_THRESHOLD * 1000));

        return Promise.race([outputPromise, statusPromise, timeout]);
    };

    try {
        const missingCommands = await checkCommandsAvailability();
        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 500 });
        }

        // Example task execution
        const taskResult = await executeTaskWithTimeout(['cat', '/tmp/somefile']);
        return Response.json({ output: new TextDecoder().decode(taskResult), status: 'success' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});