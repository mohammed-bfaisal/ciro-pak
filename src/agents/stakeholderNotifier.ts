import type { Crisis, Action, StakeholderMessage, City } from '../types';
import { getMessages } from '../data/cityData';

export function stakeholderAgent(
  _crises: Crisis[],
  _actions: Action[],
  city: City
): StakeholderMessage[] {
  return getMessages(city);
}
