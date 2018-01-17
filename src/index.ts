import {
  JupyterLab,
  JupyterLabPlugin
} from '@jupyterlab/application'

import {
  ICommandPalette
} from '@jupyterlab/apputils'

import {
  DocumentRegistry
} from '@jupyterlab/docregistry'

import {
  JSONObject,
  PromiseDelegate
} from '@phosphor/coreutils'

import {
  Widget
} from '@phosphor/widgets'

// import '../style/index.css';


class IFrame extends Widget implements DocumentRegistry.IReadyWidget {
  private _element: HTMLIFrameElement
  private _ready = new PromiseDelegate<void>();

  constructor(args: JSONObject) {
    super()

    this._element = document.createElement("iframe")

    this._render()
  }

  get ready(): Promise<void> {
    return this._ready.promise;
  }

  private _render(): void {
    this._element.src = 'https://www.google.com'

    this.node.appendChild(this._element)

  }
}

/**
 * The command IDs used by the launcher plugin.
 */
namespace CommandIDs {
  export
    const create = 'iframe:create';
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
      label: 'Load IFrame',
      execute: (args: JSONObject) => {
        let frame = new IFrame(args)
        app.shell.addToMainArea(frame)
      }
    })
    palette.addItem({ command: CommandIDs.create, category: 'Launcher' });
  }
};

export default extension;
