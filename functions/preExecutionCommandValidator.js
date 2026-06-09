import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'ls', 'echo'];
    const extendedTimeouts = {'TaskA': 120, 'TaskB': 180};

    const commandAvailable = (command) => {
        try {
            Deno.run({ cmd: [command, '--version'] });
            return true;
        } catch (e) {
            return false;
        }
    };

    const checkCommands = () => {
        return essentialCommands.every(commandAvailable);
    };

    const validateTimeout = (taskName) => {
        return extendedTimeouts[taskName] || 60;
    };

    try {
        const commandsAreAvailable = checkCommands();
        if (!commandsAreAvailable) {
            throw new Error('Essential commands are missing in the environment.');
        }

        // Example use case for checking a task timeout
        const taskName = 'TaskA'; // This would be dynamically determined in a real scenario
        const timeoutLimit = validateTimeout(taskName);

        return Response.json({ message: 'Command availability check passed', timeout: timeoutLimit }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});