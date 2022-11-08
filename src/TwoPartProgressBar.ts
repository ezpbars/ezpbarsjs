import { ProgressBar } from './ProgressBar.js';
import { ProgressBarWithElement } from './ProgressBarWithElement.js';

/**
 * Describes a progress bar which delegates to one progress bar when the task has
 * time remaining, and delegates to a different progress bar when there is no time
 * (or there is negative time) remaining.
 */
export class TwoPartProgressBar implements ProgressBar {
  /**
   * The element this view is attached to
   */
  readonly element: Element;
  /**
   * The progress bar which is shown while there is time remaining
   */
  readonly haveTimeRemaining: ProgressBarWithElement;

  /**
   * The progress bar which is shown when there is no time remaining
   */
  readonly noTimeRemaining: ProgressBarWithElement;

  /**
   * True if we are currently showing the haveTimeRemaining progress bar,
   * false if we are currently showing the noTimeRemaining progress bar
   */
  private currentlyShowingHaveTimeRemaining: boolean;

  /**
   * The total remaining time for the progress to complete in seconds
   */
  private _remainingEtaSeconds: number;

  constructor(haveTimeRemaining: ProgressBarWithElement, noTimeRemaining: ProgressBarWithElement) {
    this.element = document.createElement('div');
    this.element.appendChild(haveTimeRemaining.element);

    this.currentlyShowingHaveTimeRemaining = true;

    this.haveTimeRemaining = haveTimeRemaining;
    this.noTimeRemaining = noTimeRemaining;

    this._remainingEtaSeconds = 100;
  }
  set overallEtaSeconds(eta: number) {
    this.haveTimeRemaining.overallEtaSeconds = eta;
    this.noTimeRemaining.overallEtaSeconds = eta;

    this.update();
  }
  set remainingEtaSeconds(eta: number) {
    this.haveTimeRemaining.remainingEtaSeconds = eta;
    this.noTimeRemaining.remainingEtaSeconds = eta;
    this._remainingEtaSeconds = eta;

    this.update();
  }

  set stepName(name: string) {
    this.haveTimeRemaining.stepName = name;
    this.noTimeRemaining.stepName = name;
  }
  set stepOverallEtaSeconds(eta: number) {
    this.haveTimeRemaining.stepOverallEtaSeconds = eta;
    this.noTimeRemaining.stepOverallEtaSeconds = eta;
  }
  set stepRemainingEtaSeconds(eta: number) {
    this.haveTimeRemaining.stepRemainingEtaSeconds = eta;
    this.noTimeRemaining.stepRemainingEtaSeconds = eta;
  }

  onError(err: Error): void {
    console.error(err);
  }

  /**
   * updates which progress bar is delegated to based on the remaining time
   *
   * if there is still time remaining on the progress bar, a linear progress bar
   * is shown. If there is no time remaining (or negative time), a spinner is shown.
   */
  private update() {
    const shouldShowHaveTimeRemaining = this._remainingEtaSeconds > 0;

    if (shouldShowHaveTimeRemaining && !this.currentlyShowingHaveTimeRemaining) {
      this.element.textContent = '';
      this.element.appendChild(this.haveTimeRemaining.element);
      this.currentlyShowingHaveTimeRemaining = true;
    }

    if (!shouldShowHaveTimeRemaining && this.currentlyShowingHaveTimeRemaining) {
      this.element.textContent = '';
      this.element.appendChild(this.noTimeRemaining.element);
      this.currentlyShowingHaveTimeRemaining = false;
    }
  }
}
