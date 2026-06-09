import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandList = ['cat', 'echo', 'ls']; // Extend this based on required commands for tasks
    const requiredCommands = commandList.join(' ');
 
    try {
        const { stdout, stderr } = await executeFallbackChecker(requiredCommands);
        return Response.json({ status: 'success', stdout, stderr }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function executeFallbackChecker(commands) {
    const commandAvailabilityCheck = await Deno.run({
        cmd: ['sh', '-c', `command -v ${commands} | wc -l`],
        stdout: 'piped',
        stderr: 'piped'
    });
    const output = await commandAvailabilityCheck.output();
    const error = await commandAvailabilityCheck.stderrOutput();
    commandAvailabilityCheck.close();
    const availabilityCount = new TextDecoder().decode(output).trim();

    if (Number(availabilityCount) !== commandList.length) {
        throw new Error('Required commands are not available.');
    }
    return { stdout: 'All required commands are available.', stderr: new TextDecoder().decode(error) };
}