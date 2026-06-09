import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null'
    });
    const status = await process.status();
    process.close();
    return status.success;
}

async function clearLocks() {
    try {
        await Deno.run({ cmd: ['sudo', 'apt-get', 'remove', '-y', 'lock'], stdout: 'null', stderr: 'null'}).status();
    } catch (error) {
        console.error('Error clearing locks:', error);
    }
}

async function handleLongRunningTask(task, timeout) {
    const timeoutHandle = setTimeout(() => {
        Deno.run({ cmd: ['pkill', '-f', task.name] });
    }, timeout);

    const result = await task();
    clearTimeout(timeoutHandle);
    return result;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'echo', 'ls']; // Add more required commands as necessary
    try {
        await clearLocks();
        for (const command of commands) {
            const available = await checkCommandAvailability(command);
            if (!available) {
                return Response.json({ error: `Command ${command} is not available.` }, { status: 500 });
            }
        }
        // Define your task here, example:
        const task = async () => Deno.run({ cmd: ['some', 'long-running', 'command'] }).status();
        await handleLongRunningTask(task, 300000); // 5 minutes timeout
        return Response.json({ message: 'Task completed successfully!' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});