import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const commandsToCheck = ['cat', 'rm', 'systemctl']; // Add more critical commands if needed

const checkCommandsAvailability = async () => {
    for (const command of commandsToCheck) {
        const isAvailable = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null',
        }).status();
        if (!isAvailable.success) {
            throw new Error(`Command ${command} is not available`);
        }
    }
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkCommandsAvailability();
        // Continue with executing the cleanup tasks.
        // Example cleanup task logic goes here...
        return Response.json({ message: 'All required commands are available, proceeding with cleanup tasks.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});