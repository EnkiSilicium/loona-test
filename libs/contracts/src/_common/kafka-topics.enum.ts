import { EventNames } from "./event-names.enum";

export enum KafkaTopics {
  Booking = 'booking',
}

export const TopicMap: Record<string, KafkaTopics> = {
  [EventNames.BookingCreated]: KafkaTopics.Booking,
  [EventNames.BookingConfirmed]: KafkaTopics.Booking,
  [EventNames.BookingRejected]: KafkaTopics.Booking,
};