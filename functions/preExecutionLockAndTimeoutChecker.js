import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock-frontend; sudo fuser -k /var/lib/dpkg/lock;'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const output = await result.output();
    result.close();
    return new TextDecoder().decode(output);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {  
        // Clear any APT locks before executing tasks
        const lockClearanceResult = await clearAptLocks();
        console.log(`APT Lock Clearance Result: ${lockClearanceResult}`);

        // Parse the incoming task execution directive
        const directive = await req.json();  
        const timeoutDuration = 300; // Set timeout for task (e.g., 5 minutes)
    
        // Set up the task execution with timeout
        const taskResult = await Promise.race([
            base44.executeTask(directive), // Placeholder for actual task execution
            new Promise((_, reject) => setTimeout(() => reject(new Error('Task execution timed out')), timeoutDuration * 1000))
        ]);  

        return Response.json({ taskResult }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});