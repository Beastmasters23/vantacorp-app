import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const criticalCommands = ['cat', 'ls', 'echo']; // Add essential commands here
    const systemCommands = await Deno.run({
        cmd: ['which', ...criticalCommands],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await systemCommands.status();
    const output = new TextDecoder().decode(await systemCommands.output());
    const errorOutput = new TextDecoder().decode(await systemCommands.stderrOutput());
    
    if (code !== 0) {
        console.error('Missing commands:', errorOutput);
        return Response.json({ error: 'Critical commands not available: ' + output }, { status: 500 });
    }
    
    // Continue with task execution or processing...
    return Response.json({ success: true }, { status: 200 });
});