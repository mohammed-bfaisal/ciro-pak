import type { Crisis, Action, StakeholderMessage, City } from '../types';
import { SCENARIO_REGISTRY } from '../data/mock';

export function stakeholderAgent(
  _crises: Crisis[],
  _actions: Action[],
  city: City
): StakeholderMessage[] {
  return SCENARIO_REGISTRY[city].getMessages();
}
