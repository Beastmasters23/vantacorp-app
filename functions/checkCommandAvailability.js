import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Function to check command availability
        const checkCommands = async (commands) => {
            const unavailableCommands = [];
            for (const command of commands) {
                const process = Deno.run({
                    cmd: ['which', command],
                    stdout: 'piped',
                    stderr: 'piped'
                });
                const output = await process.output();
                if (new TextDecoder().decode(output).trim() === '') {
                    unavailableCommands.push(command);
                }
                process.close();
            }
            return unavailableCommands;
        };
        // List of critical commands to check
        const requiredCommands = ['cat', 'cp', 'mv', 'rm']; // Update list as needed
        const missingCommands = await checkCommands(requiredCommands);
        if (missingCommands.length > 0) {
            return Response.json({ error: `Missing critical commands: ${missingCommands.join(', ')}` }, { status: 503 });
        }
        // Proceed with further task execution
        return Response.json({ message: 'All required commands are available.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});