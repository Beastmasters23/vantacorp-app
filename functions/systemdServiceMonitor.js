import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Function to check and restart systemd services that are down
        const serviceChecker = async () => {
            const { exec } = Deno;
            const services = ['vanta-service', 'another-critical-service']; // Add critical services here

            for (const service of services) {
                // Check service status
                const status = await exec(`systemctl is-active ${service}`);
                const isActive = status.success;

                if (!isActive) {
                    // Restart service if it is not active
                    await exec(`systemctl restart ${service}`);
                    console.log(`${service} was not running and has been restarted.`);
                }
            }
        };

        // Run the service checker periodically
        setInterval(serviceChecker, 300000); // Check every 5 minutes 
        return Response.json({ message: 'Service monitor initialized.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});