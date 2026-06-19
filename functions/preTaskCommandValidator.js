import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandValidator(commands) {
    for (const cmd of commands) {
        const process = Deno.run({
            cmd: ['command', '-v', cmd],
            stdout: 'null',
            stderr: 'null',
        });
        const { success } = await process.status();
        if (!success) return false;
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'echo', 'ls']; // Add essential commands here
    const timeoutLimit = 300; // Timeout in seconds

    try {
        const isAvailable = await commandValidator(essentialCommands);
        if (!isAvailable) {
            return Response.json({ error: 'Essential commands are not available.' }, { status: 400 });
        }
        // Example long-running process
        const task = Deno.run({ cmd: ['sleep', '400'], stdout: 'piped', stderr: 'piped' });
        const { code } = await task.status();

        if (code !== 0) {
            return Response.json({ error: 'Task failed or timed out after 300 seconds.' }, { status: 408 });
        }

        return Response.json({ status: 'Task completed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});