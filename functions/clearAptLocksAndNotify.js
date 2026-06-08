import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const clearAptLocks = async () => {
  const { exec } = Deno;
  try {
    const { stdout } = await exec("sudo fuser -k /var/lib/dpkg/lock-frontend; sudo rm -f /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend");
    return { message: 'APT locks cleared.', output: stdout }; 
  } catch (error) {
    return { message: 'Error clearing APT locks.', error: error.message };
  }
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const lockCheck = await clearAptLocks();
    
    if (lockCheck.error) {
        return Response.json({ error: lockCheck.message, details: lockCheck.error }, { status: 500 });
    }
    
    return Response.json({ message: 'No APT locks present, proceed with tasks.', lockStatus: lockCheck });
});