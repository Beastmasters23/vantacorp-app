import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    for (const command of commands) {
        const commandExists = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
        }).status();
        if (commandExists.code !== 0) {
            return false;
        }
    }
    return true;
}

async function enhancedTaskRunner(task) {
    const requiredCommands = ['cat', 'echo']; // Commands to check
    const commandAvailable = await checkCommandAvailability(requiredCommands);
    if (!commandAvailable) {
        throw new Error('One or more required commands are missing.');
    }

    let retries = 3;
    let result;
    while (retries > 0) {
        try {
            result = await Deno.run({
                cmd: task,
                stdout: 'piped',
                stderr: 'piped',
            }).output();
            return new TextDecoder().decode(result);
        } catch (e) {
            console.error(`Task failed: ${e.message}. Retries left: ${retries - 1}`);
            retries--;
            if (retries === 0) throw e;
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const response = await enhancedTaskRunner(['cat', '/some/file']);
        return Response.json({ result: response }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});