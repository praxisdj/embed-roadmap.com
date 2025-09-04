#!/usr/bin/env bun

import { QueueService } from "@/services/queue.service";
import { GenericJobData } from "@/types/genericJobData.type";

async function enqueueEmailJob() {
  const emailJobData: GenericJobData = {
    handler: "sendEmail",
    params: {
      to: "test@example.com",
      subject: "Test Email from Queue",
      body: "This is a test email sent from the job queue system!",
    },
  };

  const job = await QueueService.addDefault(
    "@jobs/handlers/sendEmail.handler",
    emailJobData,
  );
  console.log(`✅ Email job enqueued successfully! ${job.id}`);

  process.exit(0);
}

// Run the test
void enqueueEmailJob();
