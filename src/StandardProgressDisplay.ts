import { LinearOverallProgressBar } from './LinearOverallProgressBar.js';
import { Spinner } from './Spinner.js';
import { TwoPartProgressBar } from './TwoPartProgressBar.js';

/**
 * the standard progress display for ezpbarsjs with minimal styling.
 */
export class StandardProgressDisplay extends TwoPartProgressBar {
  constructor() {
    super(new LinearOverallProgressBar(), new Spinner());
  }
}
