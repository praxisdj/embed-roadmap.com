import { WebClient } from "@slack/web-api";
import logger from "@/lib/utils/logger";
import { ExternalServiceError } from "@/lib/utils/errors";

export class Slack {
  private readonly slackClient: WebClient;

  public readonly CHANNELS = {
    ALERTS_CRITICAL: "C08RDSHRHU2",
    ALERTS_DEV: "C08RPL5CR09",
  } as const;

  constructor() {
    const token = process.env.SLACK_OAUTH_TOKEN;
    if (!token) {
      throw new ExternalServiceError("SLACK_OAUTH_TOKEN is not set");
    }

    this.slackClient = new WebClient(token);
  }

  async postMessage(text: string, channel?: string): Promise<string | null> {
    if (this.shouldSkip()) {
      return null;
    }

    const channelToPost = this.resolveChannel(channel);

    try {
      const response = await this.slackClient.chat.postMessage({
        channel: channelToPost,
        text,
      });

      logger.debug("Slack message posted successfully", {
        channel: channelToPost,
        messageId: response.ts,
      });

      return response.ts || null;
    } catch (error) {
      const slackError = new ExternalServiceError(
        "Failed to post Slack message",
      );
      logger.error(slackError, {
        originalError: error instanceof Error ? error.message : String(error),
        channel: channelToPost,
        text: text.substring(0, 100) + "...", // Truncate for logging
        context: "postMessage",
      });
      throw slackError;
    }
  }

  async postMessageToThread(
    ts: string,
    text: string,
    channel?: string,
  ): Promise<void> {
    if (this.shouldSkip()) {
      return;
    }

    const channelToPost = this.resolveChannel(channel);

    try {
      await this.slackClient.chat.postMessage({
        channel: channelToPost,
        thread_ts: ts,
        text,
      });

      logger.debug("Slack thread message posted successfully", {
        channel: channelToPost,
        threadId: ts,
      });
    } catch (error) {
      const slackError = new ExternalServiceError(
        "Failed to post Slack thread message",
      );
      logger.error(slackError, {
        originalError: error instanceof Error ? error.message : String(error),
        channel: channelToPost,
        text: text.substring(0, 100) + "...", // Truncate for logging
        threadId: ts,
        context: "postMessageToThread",
      });
      throw slackError;
    }
  }

  async postMessageSafe(
    text: string,
    channel?: string,
  ): Promise<string | null> {
    try {
      return await this.postMessage(text, channel);
    } catch (error) {
      // Log but don't throw - for non-critical notifications
      logger.warn("Failed to send Slack notification", {
        error: error instanceof Error ? error.message : String(error),
        text: text.substring(0, 100) + "...",
        channel,
      });
      return null;
    }
  }

  private resolveChannel(providedChannel?: string): string {
    if (process.env.NODE_ENV !== "production") {
      return providedChannel || this.CHANNELS.ALERTS_DEV;
    }
    return providedChannel || this.CHANNELS.ALERTS_CRITICAL;
  }

  private shouldSkip(): boolean {
    if (process.env.NODE_ENV === "test") {
      logger.debug("Skipping Slack message in test environment");
      return true;
    }

    return false;
  }
}

// Singleton instance for easy access throughout the application
export const slack = new Slack();
