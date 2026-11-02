import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

export async function dispatchWebhook(event: string, data: any): Promise<void> {
  try {
    const webhooks = await prisma.webhookConfig.findMany({
      where: {
        isActive: true,
        OR: [
          { event: 'ALL' },
          { event }
        ]
      }
    });

    if (!webhooks || webhooks.length === 0) {
      return;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };

    const payloadString = JSON.stringify(payload);

    await Promise.allSettled(
      webhooks.map(async (webhook) => {
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'DigitalClik-Webhook/1.0',
            'X-DigitalClik-Event': event
          };

          if (webhook.secret) {
            const signature = crypto
              .createHmac('sha256', webhook.secret)
              .update(payloadString)
              .digest('hex');
            headers['X-DigitalClik-Signature'] = signature;
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const res = await fetch(webhook.url, {
            method: 'POST',
            headers,
            body: payloadString,
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!res.ok) {
            console.warn(`[Webhook Warning] Event ${event} to ${webhook.url} responded with status ${res.status}`);
          }
        } catch (err: any) {
          console.warn(`[Webhook Error] Delivery to ${webhook.url} failed:`, err.message);
        }
      })
    );
  } catch (err: any) {
    console.error('[Webhook Dispatcher Error]', err.message);
  }
}
