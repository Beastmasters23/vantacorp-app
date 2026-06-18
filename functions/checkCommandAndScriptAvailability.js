import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAndScriptAvailability(commands) {
    const unavailableCommands = [];
    const scriptIssues = [];

    for (const cmd of commands) {
        try {
            const isAvailable = await Deno.run({ cmd: [cmd, '--version'], stdout: 'null' }).status();
            if (isAvailable.code !== 0) {
                unavailableCommands.push(cmd);
            }
        } catch(e) {
            unavailableCommands.push(cmd);
        }
    }

    // Add more checks for specific scripts
    const scriptsToCheck = ['/path/to/your/script.sh'];
    for (const script of scriptsToCheck) {
        try {
            const scriptStatus = await Deno.stat(script);
            if (!scriptStatus.isFile) {
                scriptIssues.push(`Script not found: ${script}`);
            }
        } catch(e) {
            scriptIssues.push(`Error accessing script: ${script}`);
        }
    }

    return { unavailableCommands, scriptIssues };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'grep', 'awk']; // list of critical commands to check
    const { unavailableCommands, scriptIssues } = await checkCommandAndScriptAvailability(commands);

    if (unavailableCommands.length > 0 || scriptIssues.length > 0) {
        return Response.json({ 
            error: 'Some commands or scripts are unavailable.','
            commands: unavailableCommands,
            scripts: scriptIssues
        }, { status: 500 });
    }

    // Proceed with task execution if everything is fine
    return new Response('All checks passed.', { status: 200 });
});