import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for APT locks
        const aptLockCheck = await Deno.run({
            cmd: ['bash', '-c', 'sudo fuser /var/lib/dpkg/lock']
        });
        const { code: aptCode } = await aptLockCheck.status();
        if (aptCode === 0) {
            return Response.json({ error: 'APT lock detected. Please resolve it before executing tasks.' }, { status: 503 });
        }

        // Validate essential commands
        const requiredCommands = ['cat', 'echo', 'bash'];
        const missingCommands = [];

        for (const command of requiredCommands) {
            const commandCheck = await Deno.run({
                cmd: ['bash', '-c', `command -v ${command}`]
            });
            const { code: checkCode } = await commandCheck.status();
            if (checkCode !== 0) {
                missingCommands.push(command);
            }
        }

        if (missingCommands.length > 0) {
            return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 503 });
        }

        // All checks passed, proceed with task execution
        return Response.json({ message: 'Environment checks passed. Ready to execute tasks.' });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});