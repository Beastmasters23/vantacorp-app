import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandDiagnostics(cmd) {
    try {
        const process = Deno.run({
            cmd: ['bash', '-c', `command -v ${cmd}`],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { code } = await process.status();
        if (code !== 0) throw new Error(`${cmd} is not available.`);

        const output = await process.output();
        const outputStr = new TextDecoder().decode(output);
        return outputStr.trim();
    } catch (error) {
        return Promise.reject(error.message);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const commandsToCheck = ['cat', 'ls', 'rm']; // Add critical commands
        for (const cmd of commandsToCheck) {
            await commandDiagnostics(cmd);
        }
        return Response.json({ status: 'All critical commands are available.' });
    } catch (error) {
        return Response.json({ error: error }, { status: 500 });
    }
});