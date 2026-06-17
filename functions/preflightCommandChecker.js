import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandChecker(commands) {
    const availableCommands = await Deno.run({
        cmd: ['bash', '-c', 'command -v ' + commands.join(' command -v ')}
    }).status();
    return availableCommands.success;
}

async function outputMonitor(taskFn, command, timeout) {
    const abortController = new AbortController();
    const { signal } = abortController;
    const task = taskFn();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    try {
        await task;
        clearTimeout(timeoutId);
    } catch (e) {
        if (signal.aborted) {
            throw new Error('Task exceeded timeout limit');
        }
        throw e;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'echo']; // Add more commands as necessary
    const taskTimeout = 300000; // 5 minutes

    try {
        const commandsAvailable = await commandChecker(commands);
        if (!commandsAvailable) {
            throw new Error('Required commands are not available');
        }

        await outputMonitor(async () => {
            // Your task execution logic here
            console.log('Executing task...');
        }, 'sample_command', taskTimeout);

        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});