import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

type TaskStatus = 'clear' | 'locked';

type LockCheckerResult = {
  status: TaskStatus;
  message: string;
};

async function checkAptLock(): Promise<LockCheckerResult> {
  const lockFilePath = '/var/lib/dpkg/lock';
  const exists = await Deno.stat(lockFilePath).catch(() => null);
  if (exists) {
    return { status: 'locked', message: 'APT lock is active, waiting for clearance.' };
  }
  return { status: 'clear', message: 'No APT lock detected.' };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const lockStatus = await checkAptLock();

  if (lockStatus.status === 'locked') {
    return Response.json({ error: lockStatus.message }, { status: 423 }); // Locked
  }

  try {
    // Proceed with task execution logic here
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});