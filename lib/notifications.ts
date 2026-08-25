import { Prisma, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type NotifyUserInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function notifyUser(input: NotifyUserInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data
    }
  });

  const devices = await prisma.userDevice.findMany({
    where: { userId: input.userId },
    select: { token: true }
  });

  if (devices.length === 0) return notification;

  await sendExpoPushNotifications(
    devices.map((device) => ({
      to: device.token,
      title: input.title,
      body: input.body,
      sound: "default",
      data: input.data ?? {}
    }))
  );

  return notification;
}

export async function notifyUsers(inputs: NotifyUserInput[]) {
  for (const input of inputs) {
    await notifyUser(input);
  }
}

async function sendExpoPushNotifications(messages: Record<string, unknown>[]) {
  const chunks = chunk(messages, 100);
  for (const batch of chunks) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(batch)
      });

      if (!response.ok) {
        console.error("Expo push request failed", response.status, await response.text());
      }
    } catch (error) {
      console.error("Expo push request failed", error);
    }
  }
}

function chunk<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}
