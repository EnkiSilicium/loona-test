import { makeKafkaConfigFactory } from 'persistence';

import type { KafkaFactoryInputs } from 'persistence';

export const reservationServiceKafkaFactoryInputs: KafkaFactoryInputs = {
  groupId: 'booking-service',
  clientId: 'booking-service',
};
export const reservationServiceKafkaConfig = makeKafkaConfigFactory(
  reservationServiceKafkaFactoryInputs,
);
