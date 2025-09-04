import {
  HighPriorityQueue,
  DefaultPriorityQueue,
  LowPriorityQueue,
} from "@/jobs/queues";
import { GenericJobData } from "@/types/genericJobData.type";

export class QueueService {
  static async addCritical(jobName: string, data: GenericJobData) {
    return HighPriorityQueue.add(jobName, data, { priority: 10, delay: 0 });
  }

  static async addDefault(jobName: string, data: GenericJobData) {
    return DefaultPriorityQueue.add(jobName, data, { priority: 5 });
  }

  static async addLow(jobName: string, data: GenericJobData) {
    return LowPriorityQueue.add(jobName, data, { priority: 1, delay: 30000 });
  }

  static async addBatch(jobName: string, data: GenericJobData) {
    return LowPriorityQueue.add(jobName, data, { priority: 1, delay: 30000 });
  }
}
