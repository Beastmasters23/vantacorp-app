import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandExists(command) {
    const { exec } = Deno;
    try {
        const process = Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped'
        });
        const output = await process.output();
        process.close();
        return output.length > 0;
    } catch {
        return false;
    }
}

async function validateCommands(commands) {
    const validationResults = {};
    for (const command of commands) {
        validationResults[command] = await commandExists(command);
    }
    return validationResults;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'grep', 'awk']; // List of critical commands
    const commandValidation = await validateCommands(commandsToCheck);

    for (const command in commandValidation) {
        if (!commandValidation[command]) {
            return Response.json({ error: `Required command ${command} not found!` }, { status: 500 });
        }
    }

    return Response.json({ status: 'All required commands are available.' });
});