import { ProgressBar } from './ProgressBar.js';

/**
 * requires spinner.css
 */
export class Spinner implements ProgressBar {
  /**
   * the element this view is attached to
   */
  readonly element: Element;
  /**
   * the total overall eta for the progress bar to complete from start to finish in seconds
   */
  private _overallEtaSeconds: number;
  /**
   * the total remaining time for the progress to complete in seconds
   */
  private _remainingEtaSeconds: number;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'lds-default';
    for (let i = 0; i < 12; i++) {
      const div = document.createElement('div');
      this.element.appendChild(div);
    }

    this._overallEtaSeconds = 100;
    this._remainingEtaSeconds = 100;
  }
  set overallEtaSeconds(eta: number) {
    this._overallEtaSeconds = eta;
  }
  set remainingEtaSeconds(eta: number) {
    this._remainingEtaSeconds = eta;
  }
  set stepName(name: string) {}
  set stepOverallEtaSeconds(eta: number) {}
  set stepRemainingEtaSeconds(eta: number) {}

  onError(err: Error): void {
    console.error(err);
  }
}
