import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const status = await Deno.run({cmd: ['which', command'], stdout: 'piped'}).output();
    return status.length > 0;
}

async function clearAptLocks() {
    try {
        await Deno.run({cmd: ['sudo', 'rm', '-rf', '/var/lib/apt/lists/lock'], stderr: 'piped'}).status();
    } catch (e) {
        console.log('No apt lock found or unable to clear');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const commands = ['cat', 'rm']; // Add any additional commands needed
        for (const cmd of commands) {
            if (!await checkCommandAvailability(cmd)) {
                return Response.json({ error: `Command ${cmd} is not available` }, { status: 500 });
            }
        }
        await clearAptLocks();

        // Execute any task related logic here
        // Set a timeout for task execution
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

        // Example task logic
        const process = Deno.run({ 
            cmd: ['some_script.sh'], 
            signal: controller.signal, 
            stderr: 'piped',
            stdout: 'piped'
        });

        const output = await process.output();
        clearTimeout(timeoutId);
        return Response.json({ output: new TextDecoder().decode(output) });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});