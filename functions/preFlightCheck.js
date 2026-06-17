import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'echo', 'ls'];
    const lockCheck = await checkForAPTLocks();
    
    if (lockCheck) {
        return Response.json({ error: 'APT locks are present. Cannot execute tasks.' }, { status: 503 });
    }
    
    const missingCommands = await checkCommandAvailability(requiredCommands);
    if (missingCommands.length > 0) {
        return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 503 });
    }
    
    // If everything is clear, proceed with task execution
    return Response.json({ message: 'All checks passed. Ready for task execution.' });
});

async function checkForAPTLocks() {
    // Logic to check APT locks
tmp.lock = Deno.run({
      cmd: ['bash', '-c', 'ls /var/lib/dpkg/lock*'],
      stdout: 'piped',
      stderr: 'piped'
    });
    
    const { code } = await tmp.lock.status();
    return code === 0; // Returns true if locks are present
}

async function checkCommandAvailability(commands) {
    const missing = [];
    for (const cmd of commands) {
        const commandCheck = Deno.run({
            cmd: ['bash', '-c', `which ${cmd}`],
            stdout: 'piped',
            stderr: 'piped',
        });
        const { code } = await commandCheck.status();
        if (code !== 0) {
            missing.push(cmd);
        }
    }
    return missing;
}