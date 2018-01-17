import {
  JupyterLab,
  JupyterLabPlugin
} from '@jupyterlab/application'

import {
  ICommandPalette,
  IFrame
} from '@jupyterlab/apputils'

import {
  JSONObject
} from '@phosphor/coreutils'

import {
  PanelLayout,
  Widget
} from '@phosphor/widgets'
import { Message } from '@phosphor/messaging';

// import '../style/index.css';

class PanelIFrame extends Widget {
  readonly url: string

  constructor(url: string) {
    super()
    this.url = url

    let layout = this.layout = new PanelLayout()
    let iframe = new IFrame()
    iframe.url = url

    layout.addWidget(iframe)
  }

  protected onActivateRequest(msg: Message): void {
    this.node.tabIndex = -1;
    this.node.focus();
  }

  protected onCloseRequest(msg: Message) {
    this.dispose()
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

        let frame = new PanelIFrame('https://jupyterlab.readthedocs.io/en/stable/')
        frame.title.label = 'my title label'
        frame.title.closable = true
        frame.id = 'my-custom-id-and-stuff'

        app.shell.addToMainArea(frame)
      }
    })
    palette.addItem({ command: CommandIDs.create, category: 'Launcher' });
  }
};

export default extension;
