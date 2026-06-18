import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const expectedCommands = ['cat', 'ls', 'echo']; // add other crucial commands as needed
  
    const missingCommands = expectedCommands.filter(cmd => !await commandExists(cmd));
    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
    }
    
    // Proceed with task execution logic here.
    // This is where the current task would continue.
    return Response.json({ status: 'All commands available, proceeding...'}, { status: 200 });
});

async function commandExists(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null'
    });
    const { code } = await process.status();
    process.close();
    return code === 0;
}