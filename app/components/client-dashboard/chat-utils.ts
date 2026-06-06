import type { JobChatMessage } from "./types";
import type { ClientJob } from "./types";

export type ClientChatThread = {
  jobId: string;
  jobTitle: string;
  artisanName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export function buildClientChatThreads(
  jobs: ClientJob[],
  messages: Record<string, JobChatMessage[]>,
  readAt: Record<string, string>,
): ClientChatThread[] {
  return jobs
    .filter((job) => (messages[job.id]?.length ?? 0) > 0)
    .map((job) => {
      const thread = messages[job.id] ?? [];
      const last = thread[thread.length - 1];
      const readTimestamp = readAt[job.id] ? new Date(readAt[job.id]).getTime() : 0;
      const unreadCount = thread.filter(
        (msg) =>
          msg.sender === "artisan" &&
          new Date(msg.createdAt).getTime() > readTimestamp,
      ).length;

      return {
        jobId: job.id,
        jobTitle: job.title,
        artisanName: job.artisanName,
        lastMessage: last?.text ?? "",
        lastMessageAt: last?.createdAt ?? job.lastUpdated,
        unreadCount,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );
}

export function getClientUnreadChatCount(
  jobs: ClientJob[],
  messages: Record<string, JobChatMessage[]>,
  readAt: Record<string, string>,
): number {
  return buildClientChatThreads(jobs, messages, readAt).reduce(
    (sum, thread) => sum + thread.unreadCount,
    0,
  );
}
