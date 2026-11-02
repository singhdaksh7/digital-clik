import { prisma } from '../lib/prisma.js';

let schedulerInterval: NodeJS.Timeout | null = null;

export async function runPublishingSchedulerJob() {
  try {
    const now = new Date();

    // 1. Pages scheduled to publish
    const pagesToPublish = await prisma.page.findMany({
      where: {
        status: 'DRAFT',
        publishAt: { lte: now }
      }
    });

    for (const page of pagesToPublish) {
      await prisma.page.update({
        where: { id: page.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: now,
          publishAt: null
        }
      });
      await prisma.auditLog.create({
        data: {
          action: 'SCHEDULED_PUBLISH',
          entityType: 'Page',
          entityId: page.id,
          metadata: JSON.stringify({ slug: page.slug, title: page.title })
        }
      });
      console.log(`[Scheduler] Page published automatically: ${page.slug}`);
    }

    // 2. Pages scheduled to unpublish / archive
    const pagesToUnpublish = await prisma.page.findMany({
      where: {
        status: 'PUBLISHED',
        unpublishAt: { lte: now }
      }
    });

    for (const page of pagesToUnpublish) {
      await prisma.page.update({
        where: { id: page.id },
        data: {
          status: 'ARCHIVED',
          unpublishAt: null
        }
      });
      await prisma.auditLog.create({
        data: {
          action: 'SCHEDULED_UNPUBLISH',
          entityType: 'Page',
          entityId: page.id,
          metadata: JSON.stringify({ slug: page.slug, title: page.title })
        }
      });
      console.log(`[Scheduler] Page archived automatically: ${page.slug}`);
    }
  } catch (err) {
    console.error('[Scheduler] Error running publishing job:', err);
  }
}

export function initPublishingScheduler() {
  if (schedulerInterval) return;
  // Run every 60 seconds
  schedulerInterval = setInterval(runPublishingSchedulerJob, 60000);
  // Also run once immediately on startup
  runPublishingSchedulerJob();
}
