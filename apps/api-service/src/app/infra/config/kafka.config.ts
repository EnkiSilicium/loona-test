import { makeKafkaConfigFactory } from 'persistence';

import type { KafkaFactoryInputs } from 'persistence';

export const apiServiceKafkaFactoryInputs: KafkaFactoryInputs = {
  groupId: 'api-service',
  clientId: 'api-service',
};
export const apiServiceKafkaConfig = makeKafkaConfigFactory(
  apiServiceKafkaFactoryInputs,
);
