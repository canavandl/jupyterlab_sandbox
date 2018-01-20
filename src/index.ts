import {
  ILayoutRestorer,
  JupyterLab,
  JupyterLabPlugin
} from '@jupyterlab/application'

import {
  ICommandPalette,
  IFrame,
  showDialog,
  Dialog,
  IInstanceTracker,
  InstanceTracker
} from '@jupyterlab/apputils'

import {
  Token,
} from '@phosphor/coreutils';

import {
  Widget
} from '@phosphor/widgets';



// import '../style/index.css';


export class Sandbox extends IFrame {
  private _sandBox: SandboxNS.TSandboxOptions

  constructor() {
    super()
  }

  get iframeNode() {
    return this.node.querySelector('iframe')
  }

  get sandboxAttr() {
    return Object.keys(this._sandBox || {}).join(' ');
  }

  get sandBox() {
    return this._sandBox
  }

  set sandBox(attrs: SandboxNS.TSandboxOptions) {
    this._sandBox = attrs
    this.iframeNode.setAttribute('sandbox', this.sandboxAttr)
  }
}


class SandboxModal extends Widget {
  constructor() {
    let body = document.createElement("div")
    let label = document.createElement("label")
    label.textContent = 'Input a valid url'
    let input = document.createElement("input")
    body.appendChild(label)
    body.appendChild(input)
    super({ node: body })
  }

  get inputNode(): HTMLInputElement {
    return this.node.querySelector('input') as HTMLInputElement;
  }

  getValue(): string {
    return this.inputNode.value;
  }
}


/** A namespace for all `iframe`-related things
 */
export namespace SandboxNS {
  /** The list of HTML iframe sandbox options
   *
   *  https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox
   */
  export type TSandboxPerm = 'allow-forms' | 'allow-modals' | 'orientation-lock' |
    'allow-pointer-lock' | 'allow-popups' | 'allow-popups-to-escape-sandbox' |
    'allow-presentation' | 'allow-same-origin' | 'allow-scripts' | 'allow-top-navigation';


  /** A type that can enable sandbox permissions */
  export type TSandboxOptions = {[P in TSandboxPerm]?: boolean};

  /** Generally useful subset of permissions that can run things like JupyterLab and Bokeh */
  export const DEFAULT_SANDBOX: TSandboxOptions = {
    'allow-forms': true,
    'allow-presentation': true,
    'allow-same-origin': true,
    'allow-scripts': true,
  };

  // @todo: implement error handling
  // export type TSandBoxProblem = 'no-src' | 'insecure-origin' | 'protocol-mismatch';
}


namespace Private {
  let counter = 0
  export const namespace = 'sandbox-ext';

  export function createSandbox(url: string, options: SandboxNS.TSandboxOptions): Sandbox {
    let frame = new Sandbox()
    frame.id = `${namespace}-${++counter}`
    frame.title.label = 'Sandbox'
    frame.title.closable = true
    frame.sandBox = options
    frame.url = url
    return frame
  }
}

/**
 * The command IDs used by the launcher plugin.
 */
namespace CommandIDs {
  export const create = 'sandbox:create'
  export const restore = 'sandbox:restore'
}


/**
 * A class that tracks sandbox widgets.
 */
export interface ISandboxTracker extends IInstanceTracker<Sandbox>{}


/**
 * The editor tracker token.
 */
export const ISandboxTracker = new Token<ISandboxTracker>('jupyterlab_sandbox:ISandboxTracker');


const extension: JupyterLabPlugin<ISandboxTracker> = {
  id: 'jupyterlab_sandbox',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  provides: ISandboxTracker,
  activate: (app: JupyterLab, palette: ICommandPalette, restorer: ILayoutRestorer) => {
    const tracker = new InstanceTracker<Sandbox>({ namespace: Private.namespace })

    // Handle state restoration.
    restorer.restore(tracker, {
      command: CommandIDs.restore,
      args: (widget) => ({url: widget.url, sandbox: widget.sandbox}),
      name: () => Private.namespace
    });

    // not added to palette, only exists to reload page without modal creation
    app.commands.addCommand(CommandIDs.restore, {
      execute: (args) => {
        const url = args['url'] as string
        // fixme: should pass in args['sandbox'] to createSandbox but it's always undefined
        // const options = args['sandbox'] as Sandbox.TSandboxOptions
        let frame = Private.createSandbox(url, SandboxNS.DEFAULT_SANDBOX)
        tracker.add(frame)
        app.shell.addToMainArea(frame)
      }
    })

    app.commands.addCommand(CommandIDs.create, {
      label: 'Open Web Page',
      execute: (args) => {
        showDialog({
          title: 'Open a Web Page',
          body: new SandboxModal(),
          buttons: [Dialog.cancelButton(), Dialog.okButton()],
          focusNodeSelector: 'input'
        }).then(result => {
          if (!result.value) {
            return null;
          }
          let frame = Private.createSandbox(result.value, SandboxNS.DEFAULT_SANDBOX)
          tracker.add(frame)
          app.shell.addToMainArea(frame)
          return Promise.resolve()
        })
      }
    })
    palette.addItem({ command: CommandIDs.create, category: 'Sandbox' });
    return tracker
  }
};

export default extension;
