import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateAndExecuteCommands(commands) {
    for (const command of commands) {
        const result = await Deno.run({
            cmd: command.split(' '),
            stdout: 'piped',
            stderr: 'piped'
        }).status();
        if (!result.success) {
            throw new Error(`Command failed: ${command}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToRun = [
        'stop all running app processes',
        'delete project directories on AJ-Windows-Node-Final'
    ];

    try {
        await validateAndExecuteCommands(commandsToRun);
        return Response.json({ message: 'Commands executed successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});