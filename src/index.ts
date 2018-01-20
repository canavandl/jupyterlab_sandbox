import {
  JupyterLab,
  JupyterLabPlugin
} from '@jupyterlab/application'

import {
  ICommandPalette,
  IFrame
} from '@jupyterlab/apputils'

// import {
//   ElementAttrNames,
// } from '@phosphor/virtualdom';


// import '../style/index.css';


class Sandbox extends IFrame implements Sandbox.IModel {
  private _sandBox: Sandbox.TSandboxOptions

  constructor() {
    super()
  }

  get sandboxAttr() {
    return Object.keys(this._sandBox || {}).join(' ');
  }

  get sandBox() {
    return this._sandBox
  }

  set sandBox(attrs: Sandbox.TSandboxOptions) {
    this._sandBox = attrs
    let iframe = this.node.querySelector('iframe')
    iframe.setAttribute('sandbox', this.sandboxAttr)
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
  export type TSandboxOptions = {[P in TSandboxPerm]?: boolean; };


  /** Generally useful subset of permissions that can run things like JupyterLab and Bokeh */
  export const DEFAULT_SANDBOX: TSandboxOptions = {
    'allow-forms': true,
    'allow-presentation': true,
    'allow-same-origin': true,
    'allow-scripts': true,
  };

  // export type TSandBoxProblem = 'no-src' | 'insecure-origin' | 'protocol-mismatch';

  /** Base frame model */
  export interface IModel {
    // extraAttrs: {[P in ElementAttrNames]?: string};
    // problem: TSandBoxProblem;
    sandBox: TSandboxOptions;
    sandboxAttr: string;
    // shouldDraw: boolean;
    // src: string;
  }
}

/**
 * The command IDs used by the launcher plugin.
 */
namespace CommandIDs {
  export
    const create = 'sandbox:create';
}


/**
 * Initialization data for the jupyterlab_iframe extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_iframe',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterLab, palette: ICommandPalette) => {
    const { commands } = app;
    commands.addCommand(CommandIDs.create, {
      label: 'Load Web Page in a Sandbox',
      execute: () => {
        let frame = new Sandbox()
        frame.sandBox = Sandbox.DEFAULT_SANDBOX
        frame.url = 'https://jupyterlab.readthedocs.io/en/stable/'
        frame.title.label = 'Sandbox'
        frame.title.closable = true
        frame.id = 'my-custom-id-and-stuff'

        app.shell.addToMainArea(frame)
      }
    })
    palette.addItem({ command: CommandIDs.create, category: 'Sandbox' });
  }
};


export default extension;
