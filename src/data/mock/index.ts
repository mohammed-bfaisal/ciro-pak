import type { City, Signal, Resource, Crisis, Action, StakeholderMessage } from '../../types';

import karachiSignals from './karachi/signals.json';
import karachiResources from './karachi/resources.json';
import islamabadSignals from './islamabad/signals.json';
import islamabadResources from './islamabad/resources.json';
import lahoreSignals from './lahore/signals.json';
import lahoreResources from './lahore/resources.json';
import rawalpindiSignals from './rawalpindi/signals.json';
import rawalpindiResources from './rawalpindi/resources.json';
import faisalabadSignals from './faisalabad/signals.json';
import faisalabadResources from './faisalabad/resources.json';
import multanSignals from './multan/signals.json';
import multanResources from './multan/resources.json';
import gujranwalaSignals from './gujranwala/signals.json';
import gujranwalaResources from './gujranwala/resources.json';
import sialkotSignals from './sialkot/signals.json';
import sialkotResources from './sialkot/resources.json';
import bahawalpurSignals from './bahawalpur/signals.json';
import bahawalpurResources from './bahawalpur/resources.json';
import sargodhaSignals from './sargodha/signals.json';
import sargodhaResources from './sargodha/resources.json';
import peshawarSignals from './peshawar/signals.json';
import peshawarResources from './peshawar/resources.json';
import abbottabadSignals from './abbottabad/signals.json';
import abbottabadResources from './abbottabad/resources.json';
import quettaSignals from './quetta/signals.json';
import quettaResources from './quetta/resources.json';
import gwadarSignals from './gwadar/signals.json';
import gwadarResources from './gwadar/resources.json';
import hyderabadSignals from './hyderabad/signals.json';
import hyderabadResources from './hyderabad/resources.json';
import sukkurSignals from './sukkur/signals.json';
import sukkurResources from './sukkur/resources.json';

import { getKarachiCrises, getKarachiActions, getKarachiMessages } from './karachi/scenario';
import { getIslamabadCrises, getIslamabadActions, getIslamabadMessages } from './islamabad/scenario';
import { getLahoreCrises, getLahoreActions, getLahoreMessages } from './lahore/scenario';
import { getRawalpindiCrises, getRawalpindiActions, getRawalpindiMessages } from './rawalpindi/scenario';
import { getFaisalabadCrises, getFaisalabadActions, getFaisalabadMessages } from './faisalabad/scenario';
import { getMultanCrises, getMultanActions, getMultanMessages } from './multan/scenario';
import { getGujranwalaCrises, getGujranwalaActions, getGujranwalaMessages } from './gujranwala/scenario';
import { getSialkotCrises, getSialkotActions, getSialkotMessages } from './sialkot/scenario';
import { getBahawalpurCrises, getBahawalpurActions, getBahawalpurMessages } from './bahawalpur/scenario';
import { getSargodhaCrises, getSargodhaActions, getSargodhaMessages } from './sargodha/scenario';
import { getPeshawarCrises, getPeshawarActions, getPeshawarMessages } from './peshawar/scenario';
import { getAbbottabadCrises, getAbbottabadActions, getAbbottabadMessages } from './abbottabad/scenario';
import { getQuettaCrises, getQuettaActions, getQuettaMessages } from './quetta/scenario';
import { getGwadarCrises, getGwadarActions, getGwadarMessages } from './gwadar/scenario';
import { getHyderabadCrises, getHyderabadActions, getHyderabadMessages } from './hyderabad/scenario';
import { getSukkurCrises, getSukkurActions, getSukkurMessages } from './sukkur/scenario';

export interface CityScenarioEntry {
  signals: Signal[];
  resources: Resource[];
  getCrises: () => Crisis[];
  getActions: () => Action[];
  getMessages: () => StakeholderMessage[];
}

export const SCENARIO_REGISTRY: Record<City, CityScenarioEntry> = {
  karachi:    { signals: karachiSignals as Signal[],    resources: karachiResources as Resource[],    getCrises: getKarachiCrises,    getActions: getKarachiActions,    getMessages: getKarachiMessages },
  islamabad:  { signals: islamabadSignals as Signal[],  resources: islamabadResources as Resource[],  getCrises: getIslamabadCrises,  getActions: getIslamabadActions,  getMessages: getIslamabadMessages },
  lahore:     { signals: lahoreSignals as Signal[],     resources: lahoreResources as Resource[],     getCrises: getLahoreCrises,     getActions: getLahoreActions,     getMessages: getLahoreMessages },
  rawalpindi: { signals: rawalpindiSignals as Signal[], resources: rawalpindiResources as Resource[], getCrises: getRawalpindiCrises, getActions: getRawalpindiActions, getMessages: getRawalpindiMessages },
  faisalabad: { signals: faisalabadSignals as Signal[], resources: faisalabadResources as Resource[], getCrises: getFaisalabadCrises, getActions: getFaisalabadActions, getMessages: getFaisalabadMessages },
  multan:     { signals: multanSignals as Signal[],     resources: multanResources as Resource[],     getCrises: getMultanCrises,     getActions: getMultanActions,     getMessages: getMultanMessages },
  gujranwala: { signals: gujranwalaSignals as Signal[], resources: gujranwalaResources as Resource[], getCrises: getGujranwalaCrises, getActions: getGujranwalaActions, getMessages: getGujranwalaMessages },
  sialkot:    { signals: sialkotSignals as Signal[],    resources: sialkotResources as Resource[],    getCrises: getSialkotCrises,    getActions: getSialkotActions,    getMessages: getSialkotMessages },
  bahawalpur: { signals: bahawalpurSignals as Signal[], resources: bahawalpurResources as Resource[], getCrises: getBahawalpurCrises, getActions: getBahawalpurActions, getMessages: getBahawalpurMessages },
  sargodha:   { signals: sargodhaSignals as Signal[],   resources: sargodhaResources as Resource[],   getCrises: getSargodhaCrises,   getActions: getSargodhaActions,   getMessages: getSargodhaMessages },
  peshawar:   { signals: peshawarSignals as Signal[],   resources: peshawarResources as Resource[],   getCrises: getPeshawarCrises,   getActions: getPeshawarActions,   getMessages: getPeshawarMessages },
  abbottabad: { signals: abbottabadSignals as Signal[], resources: abbottabadResources as Resource[], getCrises: getAbbottabadCrises, getActions: getAbbottabadActions, getMessages: getAbbottabadMessages },
  quetta:     { signals: quettaSignals as Signal[],     resources: quettaResources as Resource[],     getCrises: getQuettaCrises,     getActions: getQuettaActions,     getMessages: getQuettaMessages },
  gwadar:     { signals: gwadarSignals as Signal[],     resources: gwadarResources as Resource[],     getCrises: getGwadarCrises,     getActions: getGwadarActions,     getMessages: getGwadarMessages },
  hyderabad:  { signals: hyderabadSignals as Signal[],  resources: hyderabadResources as Resource[],  getCrises: getHyderabadCrises,  getActions: getHyderabadActions,  getMessages: getHyderabadMessages },
  sukkur:     { signals: sukkurSignals as Signal[],     resources: sukkurResources as Resource[],     getCrises: getSukkurCrises,     getActions: getSukkurActions,     getMessages: getSukkurMessages },
};
