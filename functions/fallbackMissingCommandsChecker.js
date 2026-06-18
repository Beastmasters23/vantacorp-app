import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'ls', 'mkdir', 'rm']; // Essential commands
    const missingCommands = requiredCommands.filter(cmd => !Deno.run({ cmd: [cmd], stdout: 'piped' }).status().then(s => s.success));

    if (missingCommands.length > 0) {
        console.error(`Missing commands: ${missingCommands.join(', ')}`);
        // Notify admins about the missing commands
        await base44.sendTrustedMessage({ message: `Missing critical commands: ${missingCommands.join(', ')}` });
        return Response.json({ error: `Missing critical commands detected: ${missingCommands.join(', ')}` }, { status: 500 });
    }

    // Continue with task execution logic here
    return Response.json({ success: true });
});