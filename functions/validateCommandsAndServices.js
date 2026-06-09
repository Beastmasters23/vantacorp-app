import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateCommandsAndServices(commands, services) {
    const commandChecks = await Promise.all(commands.map(cmd => Deno.run({
        cmd: ['which', cmd],
        stdout: 'piped',
        stderr: 'piped',
    }).output()));
    const missingCommands = commandChecks.filter(res => new TextDecoder().decode(res).trim() === '').map((_, idx) => commands[idx]);

    const serviceChecks = await Promise.all(services.map(service => Deno.run({
        cmd: ['systemctl', 'is-active', service],
        stdout: 'piped',
        stderr: 'piped',
    }).output()));
    const inactiveServices = serviceChecks.filter(res => new TextDecoder().decode(res).trim() !== 'active').map((_, idx) => services[idx]);

    return { missingCommands, inactiveServices };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'echo', 'rm']; // Add necessary commands
    const requiredServices = ['some-service', 'another-service']; // Add necessary services

    let validationResults = await validateCommandsAndServices(requiredCommands, requiredServices);

    if (validationResults.missingCommands.length > 0 || validationResults.inactiveServices.length > 0) {
        return Response.json({
            error: 'Validation Failed',
            missingCommands: validationResults.missingCommands,
            inactiveServices: validationResults.inactiveServices
        }, { status: 500 });
    }

    return Response.json({ message: 'All checks passed!' });
});