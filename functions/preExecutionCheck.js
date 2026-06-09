import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const aptLockPath = '/var/lib/dpkg/lock';
    const commandList = ['cat', 'echo', 'mkdir', 'rm'];

    const checkAptLock = async () => {
        try {
            await Deno.stat(aptLockPath);
            console.log('APT lock found.');
            return true;
        } catch (e) {
            return false;
        }
    };

    const checkCommandsAvailable = async () => {
        const unavailableCommands = [];
        for (const cmd of commandList) {
            const result = await Deno.run({
                cmd: ['command', '-v', cmd],
                stdout: 'piped',
                stderr: 'piped'
            }).output();
            if (result.length === 0) {
                unavailableCommands.push(cmd);
            }
        }
        return unavailableCommands;
    };

    const logIssues = (issues) => {
        if (issues.length > 0) {
            console.log('Problems detected: ', issues);
        }
    };

    try {
        const aptLocked = await checkAptLock();
        const missingCommands = await checkCommandsAvailable();

        if (aptLocked || missingCommands.length > 0) {
            let issues = [];
            if (aptLocked) issues.push('APT Lock is active.');
            if (missingCommands.length > 0) {
                issues.push('Missing commands: ' + missingCommands.join(', '));
            }
            logIssues(issues);
            return Response.json({ error: issues.join(' '), status: 'warning' }, { status: 503 });
        }

        // Proceed with normal workflow here...

        return Response.json({ message: 'All systems are go.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});