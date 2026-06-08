import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from 'child_process';

async function clearAptLocks() {
  return new Promise((resolve, reject) => {
    exec('sudo apt-get clean && sudo rm -rf /var/lib/apt/lists/*', (error, stdout, stderr) => {
      if (error) return reject(`Error clearing apt locks: ${stderr}`);
      resolve(stdout);
    });
  });
}

async function analyzeAptLocks() {
  return new Promise((resolve, reject) => {
    exec('sudo fuser -v /var/lib/dpkg/lock /var/lib/apt/lists/lock', (error, stdout, stderr) => {
      if (error) return reject(`Error analyzing apt locks: ${stderr}`);
      resolve(stdout);
    });
  });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    const lockAnalysis = await analyzeAptLocks();
    if (lockAnalysis.includes('lock')) {
      await clearAptLocks();
    }
    return Response.json({ message: 'Apt locks analyzed and cleared if necessary.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});