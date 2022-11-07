import { ProgressBar } from './ProgressBar.js';

/**
 * shows a typical progress abr using the progress element, which proceeds from 0 to 100 percent
 * and then stays at 100% until completion; jumps to 100% if it completes before expected.
 */
export class LinearOverallProgressBar implements ProgressBar {
  readonly element: Element;
  private _overallEtaSeconds: number;
  private _remainingEtaSeconds: number;

  constructor() {
    this.element = document.createElement('progress');
    this.element.setAttribute('max', '100');
    this.element.setAttribute('value', '0');

    this._overallEtaSeconds = 100;
    this._remainingEtaSeconds = 100;
  }

  set overallEtaSeconds(eta: number) {
    this._overallEtaSeconds = eta;
    this.update();
  }
  set remainingEtaSeconds(eta: number) {
    this._remainingEtaSeconds = eta;
    this.update();
  }
  set stepName(name: string) {}
  set stepOverallEtaSeconds(eta: number) {}
  set stepRemainingEtaSeconds(eta: number) {}

  onError(err: Error): void {
    console.error(err);
  }

  private update() {
    const progress = 100 - (this._remainingEtaSeconds / this._overallEtaSeconds) * 100;
    this.element.setAttribute('value', progress.toString());
  }
}
