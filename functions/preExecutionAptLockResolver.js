import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    try {
        // Define a function to check and clear apt locks
        async function clearAptLocks() {
            const { status } = await Deno.run({
                cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock-frontend; sudo fuser -k /var/cache/apt/archives/lock'],
                stdout: "piped",
                stderr: "piped"
            }).output();

            return status === 0;
        }

        // Attempt to clear locks before executing task
        const locksCleared = await clearAptLocks();
        if (!locksCleared) {
            throw new Error('Failed to clear apt locks, aborting task execution.');
        }

        // Proceed with task execution here (insert your task directive logic)

        return Response.json({ message: 'Task executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});