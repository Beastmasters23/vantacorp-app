import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await process.status();
    process.close();
    return code === 0;
}

async function clearAPTLOCKs() {
    await Deno.run({ cmd: ['sudo', 'apt', 'remove', '-y', 'apt-lock'], stdout: 'piped'}).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandToCheck = 'cat';
    const lockClearCompleted = await clearAPTLOCKs();

    if (!lockClearCompleted) {
        return Response.json({ error: 'Failed to clear APT locks' }, { status: 500 });
    }

    const commandAvailable = await checkCommandAvailability(commandToCheck);
    if (!commandAvailable) {
        return Response.json({ error: `Command ${commandToCheck} is not available` }, { status: 500 });
    }

    // Simulate a task execution with timeout control
    const taskDuration = 300; // in seconds
    const taskController = new AbortController();
    const timeoutId = setTimeout(() => taskController.abort(), taskDuration * 1000);

    try {
        // Simulate running a task
        const task = await Deno.run({
            cmd: ['bash', '-c', 'sleep 250'],
            signal: taskController.signal,
        }).status();
        clearTimeout(timeoutId);
        if (!task.success) {
            return Response.json({ error: 'Task execution failed' }, { status: 500 });
        }
        return Response.json({ success: 'Task completed successfully' });
    } catch (error) {
        return Response.json({ error: 'Task timed out' }, { status: 408 });
    }
});