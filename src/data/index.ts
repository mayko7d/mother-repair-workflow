import type { PowerSequence, SequenceId } from '../types/sequence';
import { laptopSequence } from './laptop';
import { desktopSequence } from './desktop';

export const sequences: Record<SequenceId, PowerSequence> = {
  laptop: laptopSequence,
  desktop: desktopSequence,
};

export const sequenceList: PowerSequence[] = [laptopSequence, desktopSequence];
