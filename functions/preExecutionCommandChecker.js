import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const command of commands) {
        const cmdExists = await Deno.run({cmd: [`which`, command]}).status();
        if (!cmdExists.success) {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

async function clearAptLocks() {
    const result = await Deno.run({cmd: [`sudo`, `fuser`, `-k`, `apt`]}).status();
    return result.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'apt-get', 'dpkg'];
    let response;
    try {
        const missingCommands = await checkCommandAvailability(commandsToCheck);
        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
        }

        const aptLocksCleared = await clearAptLocks();
        if (!aptLocksCleared) {
            return Response.json({ error: 'Failed to clear apt locks.' }, { status: 500 });
        }

        response = { success: true, message: 'Environment is ready for task execution.' };
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json(response);
});