import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const clearAptLocks = async () => {
        const output = await Deno.run({
            cmd: ['sh', '-c', 'sudo apt-get clean && sudo rm /var/lib/apt/lists/lock /var/cache/apt/archives/lock'],
            stdout: 'piped',
            stderr: 'piped',
        });
        const rawOutput = await output.output();
        return new TextDecoder().decode(rawOutput);
    };

    const validateCommands = async (commands) => {
        for (const command of commands) {
            const output = await Deno.run({
                cmd: ['sh', '-c', `command -v ${command}`],
                stdout: 'piped',
                stderr: 'piped',
            });
            const { code } = await output.status();
            if (code !== 0) {
                throw new Error(\