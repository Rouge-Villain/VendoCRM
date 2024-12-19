import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';
import { activities } from '@db/schema';
import { db } from 'db';
import { gt } from 'drizzle-orm';

let wss: WebSocketServer;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to activity stream');

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      console.log('Client disconnected from activity stream');
    });
  });

  console.log('WebSocket server initialized');
}

export function broadcastActivity(activity: any) {
  if (!wss) {
    console.warn('WebSocket server not initialized');
    return;
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(activity));
      } catch (error) {
        console.error('Error sending activity:', error);
      }
    }
  });
}

let activityCheckInterval: NodeJS.Timeout;

export function startActivityMonitoring() {
  let lastCheckTime = new Date();
  console.log('Starting activity monitoring');

  activityCheckInterval = setInterval(async () => {
    try {
      const newActivities = await db
        .select()
        .from(activities)
        .where(gt(activities.createdAt, lastCheckTime));

      if (newActivities.length > 0) {
        console.log(`Broadcasting ${newActivities.length} new activities`);
        newActivities.forEach((activity) => {
          broadcastActivity(activity);
        });
        lastCheckTime = new Date();
      }
    } catch (error) {
      console.error('Error checking for new activities:', error);
    }
  }, 5000); // Check every 5 seconds

  return () => {
    if (activityCheckInterval) {
      clearInterval(activityCheckInterval);
    }
  };
}

export function stopActivityMonitoring() {
  if (activityCheckInterval) {
    clearInterval(activityCheckInterval);
  }
}