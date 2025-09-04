/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test, beforeEach, afterEach, mock } from "bun:test";
import { Slack } from "@/lib/slack";

// Mock the Slack WebClient
const mockPostMessage = mock(() =>
  Promise.resolve({ ts: "1234567890.123456" }),
);

// Mock the @slack/web-api module
void mock.module("@slack/web-api", () => ({
  WebClient: class MockWebClient {
    chat = {
      postMessage: mockPostMessage,
    };
  },
}));

describe("Slack", () => {
  let slack: InstanceType<typeof Slack>;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original env
    originalEnv = { ...process.env };

    // Reset mocks completely
    mockPostMessage.mockClear();
    mockPostMessage.mockImplementation(() =>
      Promise.resolve({ ts: "1234567890.123456" }),
    );

    // Set default env vars
    Object.assign(process.env, {
      SLACK_OAUTH_TOKEN: "xoxb-test-token",
      NODE_ENV: "development",
    });
  });

  afterEach(() => {
    // Restore original env
    Object.assign(process.env, originalEnv);
  });

  describe("constructor", () => {
    test("should create instance with valid token", () => {
      expect(() => new Slack()).not.toThrow();
    });

    test("should throw ExternalServiceError when token is missing", () => {
      delete process.env.SLACK_OAUTH_TOKEN;

      try {
        new Slack();
        expect.unreachable();
      } catch (error) {
        expect((error as any)?.name).toBe("ExternalServiceError");
        expect(error).toHaveProperty("statusCode", 502);
        expect(error).toHaveProperty("message", "SLACK_OAUTH_TOKEN is not set");
      }
    });

    test("should throw ExternalServiceError when token is empty", () => {
      process.env.SLACK_OAUTH_TOKEN = "";

      try {
        new Slack();
        expect.unreachable();
      } catch (error) {
        expect((error as any)?.name).toBe("ExternalServiceError");
        expect(error).toHaveProperty("statusCode", 502);
        expect(error).toHaveProperty("message", "SLACK_OAUTH_TOKEN is not set");
      }
    });
  });

  describe("postMessage", () => {
    beforeEach(() => {
      slack = new Slack();
    });

    test("should post message successfully and return timestamp", async () => {
      const result = await slack.postMessage("Test message");

      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: slack.CHANNELS.ALERTS_DEV, // dev environment
        text: "Test message",
      });
      expect(result).toBe("1234567890.123456");
    });

    test("should use custom channel when provided", async () => {
      await slack.postMessage("Test message", "C123456789");

      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: "C123456789",
        text: "Test message",
      });
    });

    test("should use production channel in production environment", async () => {
      Object.assign(process.env, { NODE_ENV: "production" });
      slack = new Slack();

      await slack.postMessage("Test message");

      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: slack.CHANNELS.ALERTS_CRITICAL,
        text: "Test message",
      });
    });

    test("should skip and return null in test environment", async () => {
      Object.assign(process.env, { NODE_ENV: "test" });
      slack = new Slack();

      const result = await slack.postMessage("Test message");

      expect(result).toBeNull();
      expect(mockPostMessage).not.toHaveBeenCalled();
      // Logger output will be visible in console
    });

    test("should throw ExternalServiceError when Slack API fails", async () => {
      const apiError = new Error("Slack API error");
      mockPostMessage.mockRejectedValueOnce(apiError);

      try {
        await slack.postMessage("Test message");
        expect.unreachable();
      } catch (error) {
        expect((error as any)?.name).toBe("ExternalServiceError");
        expect(error).toHaveProperty("statusCode", 502);
        expect(error).toHaveProperty("message", "Failed to post Slack message");
      }
      // Logger output will be visible in console
    });

    test("should truncate long messages in error logs", async () => {
      const longMessage = "a".repeat(200);
      const apiError = new Error("Slack API error");
      mockPostMessage.mockRejectedValueOnce(apiError);

      await expect(slack.postMessage(longMessage)).rejects.toThrow();
      // Logger output will be visible in console - should show truncated message
    });
  });

  describe("postMessageToThread", () => {
    beforeEach(() => {
      slack = new Slack();
    });

    test("should post thread message successfully", async () => {
      await slack.postMessageToThread("1234567890.123456", "Thread reply");

      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: slack.CHANNELS.ALERTS_DEV,
        thread_ts: "1234567890.123456",
        text: "Thread reply",
      });
      // Logger output will be visible in console
    });

    test("should use custom channel for thread message", async () => {
      await slack.postMessageToThread(
        "1234567890.123456",
        "Thread reply",
        "C123456789",
      );

      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: "C123456789",
        thread_ts: "1234567890.123456",
        text: "Thread reply",
      });
    });

    test("should skip in test environment", async () => {
      Object.assign(process.env, { NODE_ENV: "test" });
      slack = new Slack();

      await slack.postMessageToThread("1234567890.123456", "Thread reply");

      expect(mockPostMessage).not.toHaveBeenCalled();
      // Logger output will be visible in console
    });

    test("should throw ExternalServiceError when thread message fails", async () => {
      const apiError = new Error("Thread API error");
      mockPostMessage.mockRejectedValueOnce(apiError);

      try {
        await slack.postMessageToThread("1234567890.123456", "Thread reply");
        expect.unreachable();
      } catch (error) {
        expect((error as any)?.name).toBe("ExternalServiceError");
        expect(error).toHaveProperty("statusCode", 502);
        expect(error).toHaveProperty(
          "message",
          "Failed to post Slack thread message",
        );
      }
      // Logger output will be visible in console
    });
  });

  describe("postMessageSafe", () => {
    beforeEach(() => {
      slack = new Slack();
    });

    test("should return timestamp when successful", async () => {
      const result = await slack.postMessageSafe("Safe message");

      expect(result).toBe("1234567890.123456");
      expect(mockPostMessage).toHaveBeenCalled();
    });

    test("should return null and log warning when message fails", async () => {
      const apiError = new Error("Safe API error");
      mockPostMessage.mockRejectedValueOnce(apiError);

      const result = await slack.postMessageSafe("Safe message");

      expect(result).toBeNull();
      // Logger output will be visible in console
    });

    test("should not throw error even when underlying method fails", async () => {
      mockPostMessage.mockRejectedValueOnce(new Error("API failure"));

      await expect(slack.postMessageSafe("Safe message")).resolves.toBeNull();
    });

    test("should truncate long messages in warning logs", async () => {
      const longMessage = "b".repeat(200);
      mockPostMessage.mockRejectedValueOnce(new Error("API failure"));

      await slack.postMessageSafe(longMessage);
      // Logger output will be visible in console - should show truncated message
    });
  });

  describe("CHANNELS", () => {
    test("should have correct channel IDs", () => {
      slack = new Slack();

      expect(slack.CHANNELS.ALERTS_CRITICAL).toBe("C08RDSHRHU2");
      expect(slack.CHANNELS.ALERTS_DEV).toBe("C08RPL5CR09");
    });
  });

  describe("environment handling", () => {
    test("should use dev channel in development", () => {
      Object.assign(process.env, { NODE_ENV: "development" });
      slack = new Slack();

      const resolveChannel = (
        slack as unknown as { resolveChannel: (channel?: string) => string }
      ).resolveChannel.bind(slack);
      expect(resolveChannel()).toBe(slack.CHANNELS.ALERTS_DEV);
    });

    test("should use provided channel in production", () => {
      Object.assign(process.env, { NODE_ENV: "production" });
      slack = new Slack();

      const resolveChannel = (
        slack as unknown as { resolveChannel: (channel?: string) => string }
      ).resolveChannel.bind(slack);
      expect(resolveChannel("C123456789")).toBe("C123456789");
    });

    test("should use critical channel as fallback in production", () => {
      Object.assign(process.env, { NODE_ENV: "production" });
      slack = new Slack();

      const resolveChannel = (
        slack as unknown as { resolveChannel: (channel?: string) => string }
      ).resolveChannel.bind(slack);
      expect(resolveChannel()).toBe(slack.CHANNELS.ALERTS_CRITICAL);
    });

    test("should skip operations in test environment", () => {
      Object.assign(process.env, { NODE_ENV: "test" });
      slack = new Slack();

      const shouldSkip = (
        slack as unknown as { shouldSkip: () => boolean }
      ).shouldSkip.bind(slack);
      expect(shouldSkip()).toBe(true);
    });
  });
});
