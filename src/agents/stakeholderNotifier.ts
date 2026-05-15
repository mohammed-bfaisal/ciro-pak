import type { Crisis, Action, StakeholderMessage, City } from '../types';
import { getKarachiMessages } from '../data/mock/karachi/scenario';
import { getIslamabadMessages } from '../data/mock/islamabad/scenario';

export function stakeholderAgent(
  _crises: Crisis[],
  _actions: Action[],
  city: City
): StakeholderMessage[] {
  return city === 'karachi' ? getKarachiMessages() : getIslamabadMessages();
}
