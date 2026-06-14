import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    async function checkEnvironment() {
        const requiredCommands = ['cat', 'echo'];
        const missingCommands = [];
        for (const command of requiredCommands) {
            const { code } = await Deno.run({
                cmd: [command, '--version'],
                stdout: 'null',
                stderr: 'null',
            });
            if (code !== 0) {
                missingCommands.push(command);
            }
        }
        return missingCommands;
    }

    try {
        const missingCommands = await checkEnvironment();
        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing essential commands: ' + missingCommands.join(', ') }, { status: 400 });
        }
        // Proceed with task execution if environment is valid
        return Response.json({ status: 'Environment check passed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});