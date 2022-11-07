/**
 * describes a progress bar's progress
 */
export type ProgressBar = {
  /**
   * the overall estimation for the total time the task will take to complete
   * from start to finish in seconds
   */
  set overallEtaSeconds(eta: number);
  /**
   * the estimated time remaining for the task to complete in seconds
   */
  set remainingEtaSeconds(eta: number);
  /**
   * the name of the step the task is currently on
   */
  set stepName(name: string);
  /**
   * the overall estimation for the time the step the progress bar is currently
   * on will take to complete in seconds
   */
  set stepOverallEtaSeconds(eta: number);
  /**
   * the estimated time remaining for the step the progress bar is currently on
   * to complete in seconds
   */
  set stepRemainingEtaSeconds(eta: number);

  /**
   * called when an unrecoverable error occurs; such as our authentication being rejected
   * @param err the error that occurred
   */
  onError(err: Error): void;
};
