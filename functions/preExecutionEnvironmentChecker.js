import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    // Function to check for APT locks and command availability
    async function preExecutionValidator() {
        const lockCheck = await Deno.run({
            cmd: ['sh', '-c', "if lsof /var/lib/dpkg/lock || lsof /var/lib/dpkg/lock-frontend; then echo 'locked'; fi"],
            stdout: 'piped',
        }).output();

        const commandCheck = await Deno.run({
            cmd: ['sh', '-c', 'command -v cat >/dev/null 2>&1'],
            status: 'piped'
        }).status();

        if (new TextDecoder().decode(lockCheck).includes('locked')) {
            throw new Error('APT lock detected. Please unlock before proceeding.');
        }
        if (!commandCheck.success) {
            throw new Error('Required command `cat` is not available.');
        }
    }

    try {
        await preExecutionValidator();
        // Proceed with tasks after validation
        return Response.json({ message: 'Pre-execution checks passed. Ready to execute tasks.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});