import {
  JupyterLab,
  JupyterLabPlugin
} from '@jupyterlab/application'

import {
  ICommandPalette,
  IFrame,
  showDialog,
  Dialog
} from '@jupyterlab/apputils'

import {
  Widget
} from '@phosphor/widgets';


// import '../style/index.css';


class Sandbox extends IFrame implements Sandbox.IModel {
  private _sandBox: Sandbox.TSandboxOptions

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

  set sandBox(attrs: Sandbox.TSandboxOptions) {
    this._sandBox = attrs
    this.iframeNode.setAttribute('sandbox', this.sandboxAttr)
  }
}


/** A namespace for all `iframe`-related things
 */
namespace Sandbox {
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

  // todo implement error handling?
  // export type TSandBoxProblem = 'no-src' | 'insecure-origin' | 'protocol-mismatch';

  /** Base sandbox model */
  export interface IModel {
    // problem: TSandBoxProblem;
    sandBox: TSandboxOptions;
    sandboxAttr: string;
  }
}

/**
 * The command IDs used by the launcher plugin.
 */
namespace CommandIDs {
  export
    const create = 'sandbox:create';
}


class SandboxModal extends Widget {
  constructor() {
    let body = document.createElement("div")
    let label = document.createElement("label")
    label.textContent = 'Input a valid url'
    let input = document.createElement("input")
    body.appendChild(label)
    body.appendChild(input)
    super( { node: body })
  }

  get inputNode(): HTMLInputElement {
    return this.node.querySelector('input') as HTMLInputElement;
  }

  getValue(): string {
    return this.inputNode.value;
  }
}


const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_sandbox',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterLab, palette: ICommandPalette) => {
    let counter = 0;
    const namespace = 'sandbox-ext';

    app.commands.addCommand(CommandIDs.create, {
      label: 'Web Page',
      execute: () => {
        showDialog({
          title: 'Open a Web Page',
          body: new SandboxModal(),
          buttons: [Dialog.cancelButton(), Dialog.okButton()]
        }).then(result => {
          if (!result.value) {
            return null;
          }
          let frame = new Sandbox()
          frame.sandBox = Sandbox.DEFAULT_SANDBOX
          frame.title.label = 'Sandbox'
          frame.title.closable = true
          frame.id = `${namespace}-${++counter}`
          frame.url = result.value

          app.shell.addToMainArea(frame)
          return Promise.resolve()
        })
      }
    })
    palette.addItem({ command: CommandIDs.create, category: 'Sandbox' });
  }
};


export default extension;
