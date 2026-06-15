import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemdServices(services) {
    const downServices = [];
    for (const service of services) {
        const status = await Deno.run({
            cmd: ['systemctl', 'is-active', service],
            stdout: 'piped',
            stderr: 'piped'
        }).output();
        const output = new TextDecoder().decode(status).trim();
        if (output !== 'active') {
            downServices.push(service);
        }
    }
    return downServices;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const servicesToCheck = ['your-required-service1', 'your-required-service2'];
    const downServices = await checkSystemdServices(servicesToCheck);
    if (downServices.length > 0) {
        for (const service of downServices) {
            await Deno.run({ cmd: ['systemctl', 'restart', service] }).status();
        }
        return Response.json({ message: 'Down services were restarted.', downServices }, { status: 200 });
    }
    return Response.json({ message: 'All services are active.' }, { status: 200 });
});