import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const checkResponseFromLyra = async () => {
        // Logic to check for response from Lyra in the bridge outbox
        const response = await base44.getLyraResponse(); // Pseudo function to simulate checking Lyra
        if (!response || response.error) {
            console.error('Error: No response from Lyra or response contains error:', response);
            return {status: 'error', message: 'No response from Lyra.'};
        }
        return {status: 'ok', message: 'Response received from Lyra.'};
    };

    const logPurgeProcess = async (taskId) => {
        // Logic for logging purging processes
        const output = await base44.purgeTask(taskId);
        if (!output) {
            console.warn('Warning: Purge task returned no output for Task ID:', taskId);
            return false;
        }
        console.info('Purge task completed with output:', output);
        return true;
    };

    try {
        // Check response from Lyra
        const lyraStatus = await checkResponseFromLyra();
        console.log(lyraStatus.message);

        // Log and process purging tasks
        const taskId = 'some-task-id'; // Get this dynamically as per your implementation
        const purgeStatus = await logPurgeProcess(taskId);
        if (!purgeStatus) {
            throw new Error('Purge task failed with no output.');
        }

        return Response.json({message: 'All tasks executed successfully.'});
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});