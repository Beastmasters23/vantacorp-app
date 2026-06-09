import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommands(commands) {
    const missing = [];
    for (const cmd of commands) {
        const isAvailable = await Deno.run({
            cmd: ['command', '-v', cmd],
            stdout: 'null',
            stderr: 'null',
        }).status();
        if (!isAvailable.success) missing.push(cmd);
    }
    return missing;
}

async function executeTask(command, timeout = 300) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

    const process = Deno.run({
        cmd: command.split(' '),
        stdout: 'piped',
        stderr: 'piped',
        signal: controller.signal,
    });

    const { code } = await process.status();
    clearTimeout(timeoutId);
    if (code !== 0) {
        const stderr = await process.stderrOutput();
        console.error(new TextDecoder().decode(stderr));
        throw new Error(`Task failed with exit code ${code}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const expectedCommands = ['CAT', 'ECHO']; // Example command list
    const missingCommands = await checkCommands(expectedCommands);

    if (missingCommands.length > 0) {
        return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 400 });
    }

    try {
        await executeTask('your_task_command_here'); // Replace with the actual command
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});