import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateCommandAvailability(commands) {
    const responses = await Promise.all(commands.map(async (cmd) => {
        const process = Deno.run({
            cmd: ['bash', '-c', `command -v ${cmd}`],
            stdout: 'piped',
            stderr: 'piped',
        });
        const output = await process.output();
        const error = await process.stderrOutput();
        const status = await process.status();
        if (status.success) {
            return { cmd, available: true }; // Command exists
        } else {
            return { cmd, available: false, error: new TextDecoder().decode(error) };
        }
    }));
    return responses;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'rm', 'echo']; // Commands to validate
    const availabilityResults = await validateCommandAvailability(commandsToCheck);

    const allAvailable = availabilityResults.every(res => res.available);
    if (!allAvailable) {
        return Response.json({ error: 'One or more commands are missing.', details: availabilityResults }, { status: 400 });
    }

    // If commands are available, proceed with other task logic here...
    //
    // Example placeholder for background tasks
    // const taskResults = await executeBackgroundTasks();
    // return Response.json({ taskResults }, { status: 200 });

    return Response.json({ message: 'All necessary commands are available.' }, { status: 200 });
});