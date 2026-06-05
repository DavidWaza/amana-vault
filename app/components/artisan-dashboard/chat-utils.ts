import type { ArtisanJob, ChatThread, JobChatMessage } from "./types";
import { canMessageClient } from "./utils";

export function buildChatThreads(
  jobs: ArtisanJob[],
  jobMessages: Record<string, JobChatMessage[]>,
  chatReadAt: Record<string, string>,
): ChatThread[] {
  return jobs
    .filter(canMessageClient)
    .map((job) => {
      const messages = jobMessages[job.id] ?? [];
      const last = messages[messages.length - 1];
      const readAt = chatReadAt[job.id] ?? "";
      const unreadCount = messages.filter(
        (msg) => msg.sender === "client" && msg.createdAt > readAt,
      ).length;

      return {
        jobId: job.id,
        clientName: job.clientName,
        jobTitle: job.title,
        lastMessage: last?.text,
        lastMessageAt: last?.createdAt,
        unreadCount,
      };
    })
    .sort((a, b) => {
      if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      return a.clientName.localeCompare(b.clientName);
    });
}

export function getUnreadChatCount(threads: ChatThread[]): number {
  return threads.reduce((sum, thread) => sum + thread.unreadCount, 0);
}
