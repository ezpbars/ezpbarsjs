import { ProgressBar } from './ProgressBar.js';

/**
 * the arguments for the waitForCompletion function, which is the
 * main entry point for the library
 */
export type WaitForCompletionArgs = {
  /**
   * the name of the progress bar to wait for completion of
   */
  pbarName: string;
  /**
   * the uid of the trace to watch
   */
  uid: string;
  /**
   * the identifier for the account the progress bar belongs to
   */
  sub: string;
  /**
   * checks if your backend is finished processing the trace;
   * used as a fallback if ezpbars is not available.
   *
   * typically, this is implemented using a fetch to your backend,
   * in the same way that you would normally get the result after
   * this library notifies you that the result is ready
   */
  pollResult: () => Promise<boolean>;
  /**
   * the progress bar that's being rendered
   *
   * @default null
   */
  pbar: ProgressBar | null;
  /**
   * the domain to make the websocket connection to
   *
   * @default "ezpbars.com"
   */
  domain: string | null;
  /**
   * indicates the scheme for the url where true is wss and false is ws
   *
   * @default true
   */
  ssl: boolean;
};

/**
 * handles receiving a trace from the websocket
 */
class TraceHandler {
  /**
   * the identifier for the account the progress bar belongs to
   */
  readonly sub: string;
  /**
   * the name of the progress bar to wait for completion of
   */
  readonly pbarName: string;
  /**
   * the uid of the trace to watch
   */
  readonly uid: string;
  /**
   * the domain to make the websocket connection to
   */
  readonly domain: string;
  /**
   * indicates the scheme for the url where true is wss and false is ws
   */
  readonly ssl: boolean;
  /**
   * the connection to ezpbars.com if open
   */
  ws: WebSocket | null;
  /**
   * the progress bar that's being rendered
   */
  pbar: ProgressBar | null;
  /**
   * the number of times the connection has failed in the last minute
   */
  failures: number;
  /**
   * called whenever this has finished, whether from an error, or because the trace has completed
   * @param error the error that occurred, if any
   */
  onComplete: (error: string | null) => void;
  pollResult: () => Promise<boolean>;
  constructor(args: WaitForCompletionArgs, onComplete: (error: string | null) => void) {
    this.sub = args.sub;
    this.pbarName = args.pbarName;
    this.uid = args.uid;
    this.domain = args.domain || 'ezpbars.com';
    this.ssl = args.ssl || true;
    this.onComplete = onComplete;
    this.pollResult = args.pollResult;
    this.onAuthResponse = this.onAuthResponse.bind(this);
    this.onCloseEvent = this.onCloseEvent.bind(this);
    this.onTraceMessage = this.onTraceMessage.bind(this);
    this.sendAuthRequest = this.sendAuthRequest.bind(this);
    this.connect = this.connect.bind(this);
    this.connect();
  }
  /**
   * builds a url for the websocket connection
   * @returns the url to make the websocket connection to
   */
  url(): string {
    return `${'wss' ? this.ssl : 'ws'}://${this.domain}/api/2/progress_bars/traces/`;
  }
  connect() {
    this.ws = new WebSocket(this.url());
    this.ws.addEventListener('open', this.sendAuthRequest);
    this.ws.addEventListener('message', this.onAuthResponse);
    this.ws.addEventListener('close', this.onCloseEvent);
  }
  /**
   * called when the connection to the websocket is closed
   * @param closeEvent the close event received from the websocket
   */
  onCloseEvent(closeEvent: CloseEvent) {
    this.failures++;
    setTimeout(
      (() => {
        this.failures--;
      }).bind(this),
      60 * 1000
    );
    this.retryConnection(this.failures);
  }
  /**
   * handles receiving the authentication response from the websocket
   * @param messageEvent the message event received from the websocket
   */
  onAuthResponse(messageEvent: MessageEvent) {
    const data = JSON.parse(messageEvent.data);
    if (!data.success) {
      this.pbar.onError(new Error(data.error_message));
      this.ws.removeEventListener('close', this.onCloseEvent);
      this.ws.close();
      return this.onComplete(data.error_message);
    }
    this.ws.removeEventListener('message', this.onAuthResponse);
    this.ws.addEventListener('message', this.onTraceMessage);
  }
  /**
   * handles receiving a trace message from the websocket
   * @param messageEvent the message event received from the websocket
   */
  onTraceMessage(messageEvent: MessageEvent) {
    const data = JSON.parse(messageEvent.data);
    if (data.type === 'update') {
      this.pbar.overallEtaSeconds = data.data.overall_eta_seconds;
      this.pbar.remainingEtaSeconds = data.data.remaining_eta_seconds;
      this.pbar.stepName = data.data.step_name;
      this.pbar.stepOverallEtaSeconds = data.data.step_overall_eta_seconds;
      this.pbar.stepRemainingEtaSeconds = data.data.step_remaining_eta_seconds;
    }
    if (data.done) {
      this.ws.removeEventListener('close', this.onCloseEvent);
      this.ws.close();
      return this.onComplete(null);
    }
  }
  /**
   * sends the authentication request to the websocket
   */
  sendAuthRequest() {
    this.ws.addEventListener('message', this.onAuthResponse);
    this.ws.send(
      JSON.stringify({
        sub: this.sub,
        uid: this.uid,
        pbar_name: this.pbarName,
      })
    );
  }
  /**
   * tries to reconnect to the websocket after the connection has been closed.
   * waits up to 15 seconds before trying to reconnect based on how many times it's already tried
   * @param failures the number of times the websocket has failed to connect in the past minute
   */
  async retryConnection(failures: number) {
    let delay = 0;
    if (failures === 3) {
      delay = 1;
    }
    if (failures === 4) {
      delay = 4;
    }
    if (failures >= 5) {
      delay = 15;
      const polledResult = await this.pollResult();
      if (polledResult) {
        return this.onComplete(null);
      }
    }
    setTimeout(this.connect, delay * 1000);
  }
}

/**
 * waits for the given trace to complete, sending progress information to the
 * given progress bar. typically, the progress bar would react to the changes by
 * updating the UI, such as by literally drawing a progress bar, or just using a
 * spinner, or some combination based on context
 *
 * For an implementation of a progress bar, you can try SimpleProgressBar, SimpleSpinner,
 * or StandardProgressDisplay
 *
 * ```ts
 * import { waitForCompletion, StandardProgressDisplay } from 'ezpbars';
 *
 * const pbar = new StandardProgressDisplay();
 * document.body.appendChild(pbar.element);
 * const response = await fetch(
 *   'https://ezpbars.com/api/1/examples/job?duration=5&stdev=1',
 *   {method: 'POST'}
 * )
 * /** @type {{uid: str, sub: str, pbar_name: str}} * /
 * const data = await response.json();
 * const getResult = async () => {
 *   const response = await fetch(`https://ezpbars.com/api/1/examples/job/${data.uid}`)
 *   const result = await response.json();
 *   if (result.status === 'complete') {
 *     return result.data;
 *   }
 *   return null;
 * }
 * const pollResult = async () => (await getResult()) !== null;
 * await waitForCompletion({sub: data.sub, pbarName: data.pbar_name, uid: data.uid, pbar, pollResult});
 * console.log(await getResult());
 * ```
 *
 * @param args the arguments to use when waiting for completion of the progress
 * bar
 */
export function waitForCompletion(args: WaitForCompletionArgs): Promise<void> {
  return new Promise((resolve, reject) => {
    new TraceHandler(args, (error: string | null) => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
}
