import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandDependencyCheck(){
    const requiredCommands = ['cat', 'echo']; // sample required commands
    const missingCommands = [];
    for (const command of requiredCommands) {
        const commandAvailable = await Deno.run({
            cmd: ['which', command],
            stderr: 'null',
            stdout: 'null',
        }).status();
        if (!commandAvailable.success) {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

async function timeoutManager(task, timeout=300){
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('Task timed out after ' + timeout + ' seconds'));
        }, timeout * 1000);
        task().then((result) => {
            clearTimeout(timer);
            resolve(result);
        }).catch((err) => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const missingCommands = await commandDependencyCheck();
    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
    }
    try {
        const task = () => Promise.resolve('Task executed successfully!'); // Replace with actual task
        const result = await timeoutManager(task);
        return Response.json({ message: result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});