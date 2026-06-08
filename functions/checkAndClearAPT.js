import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAPT([
  client
]) {
  const { exec } = require('child_process');

  return new Promise((resolve, reject) => {
    // Check if there are any APT locks present
    exec('sudo fuser /var/lib/dpkg/lock', (err, stdout, stderr) => {
      if (err && stderr.includes('No such file or directory')) {
        // No lock is present
        resolve({ status: 'No locks present' });
      } else if (stdout) {
        // Lock is present, try to clear it
        exec('sudo kill $(fuser -u -k /var/lib/dpkg/lock)', (killErr) => {
          if (killErr) {
            reject({ error: 'Failed to clear APT lock', details: killErr.message });
          } else {
            resolve({ status: 'APT locks cleared' });
          }
        });
      } else {
        reject({ error: 'Unknown error checking APT locks', details: stderr });
      }
    });
  });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const result = await checkAndClearAPT(base44);
        return Response.json(result);
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});