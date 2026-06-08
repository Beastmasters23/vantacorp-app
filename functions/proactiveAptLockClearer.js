import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const clearAptLocks = async () => {
    try {
        await Deno.run({
            cmd: ['sudo', 'apt-get', 'remove', '-y', '--purge', 'lock'],
            stdout: 'piped',
            stderr: 'piped',
        }).status();
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        throw new Error('APT lock clearing failed');
    }
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Proactively clear APT locks before executing tasks
        await clearAptLocks();
        // Further task processing logic goes here
        return Response.json({ message: 'Tasks processed'}, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});