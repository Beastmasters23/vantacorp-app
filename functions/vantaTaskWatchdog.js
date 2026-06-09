import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT_THRESHOLD = 60 * 1000; // 60 seconds
const CHECK_INTERVAL = 10 * 1000; // 10 seconds

async function checkRunningTasks() {
  // Simulated method to get current running tasks 
  const runningTasks = await getRunningTasks();

  const now = Date.now();
  for (const task of runningTasks) {
    if (now - task.startTime > TASK_TIMEOUT_THRESHOLD) {
      await handleStuckTask(task);
    }
  }
}

async function handleStuckTask(task) {
  console.error(`Task ${task.id} is stuck for too long. Taking corrective action.`);
  await restartTask(task);
  logTaskIssue(task);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
      // Start monitoring for stuck tasks
      setInterval(checkRunningTasks, CHECK_INTERVAL);
      return Response.json({ status: "Task monitoring started." }, { status: 200 });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
});