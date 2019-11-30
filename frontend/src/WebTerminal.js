import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { webSocket } from './config';
import 'xterm/css/xterm.css';

export default class WebTerminal extends Component {
  constructor(props) {
    super(props);
    const namespace = this.props.match.params.namespace;
    const pod = this.props.match.params.pod;
    const container = this.props.match.params.container;
    this.connected = false;
    if (namespace && pod && container) {
      this.ws_url = `${webSocket}/ws/kubernetes/${namespace}/${pod}/${container}`;
    } else if (container) {
      this.ws_url = `${webSocket}/ws/docker/${container}`;
    }
    this.initTerminal();
  }

  componentDidMount() {
    this.initConnection();
  }

  componentWillUnmount() {
    // 解除监听
    window.removeEventListener('resize', () => this.debouncedFit());
    // 关闭 socket
    if (this.conn && this.connected) {
      this.conn.close();
    }
    // 清理终端
    if (this.term) {
      this.term.destroy();
    }
  }

  initConnection = () => {
    // console.log(this.ws_url);
    this.conn = new WebSocket(this.ws_url);
    this.conn.onopen = this.onConnectionOpen.bind(this);
    this.conn.onmessage = this.onConnectionMessage.bind(this);
    this.conn.onclose = this.onConnectionClose.bind(this);
  };

  onConnectionOpen = () => {
    this.connected = true;
    this.flag = setInterval(() => {
      if (this.connected) {
        this.conn.send(
          JSON.stringify({
            Op: 'resize',
            Cols: this.term.cols,
            Rows: this.term.rows,
          })
        );
      } else {
        clearInterval(this.flag);
      }
    }, 25 * 1000);

    // Make sure the terminal is with correct display size.
    this.onTerminalResize();

    // Focus on connection
    this.term.focus();
  };

  onConnectionMessage = e => {
    this.term.write(e.data);
  };

  onConnectionClose = () => {
    if (!this.connected) {
      return;
    }
    this.conn.close();
    this.connected = false;
    this.term.write('connection cloesd');
  };

  initTerminal = () => {
    const fitAddon = new FitAddon();
    this.term = new Terminal({
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      bellStyle: 'sound',
      cursorBlink: true,
    });

    this.term.loadAddon(fitAddon);

    this.term.open(document.getElementById('root'));
    this.debouncedFit = debounce(() => {
      fitAddon.fit();
    }, 100);
    this.debouncedFit();
    window.addEventListener('resize', () => this.debouncedFit());

    this.term.onData(e => this.onTerminalSendString(e));
    this.term.onResize(this.onTerminalResize);
  };

  onTerminalSendString = value => {
    if (this.connected) {
      this.conn.send(
        JSON.stringify({
          Op: 'stdin',
          Data: value,
          Cols: this.term.cols,
          Rows: this.term.rows,
        })
      );
    }
  };

  onTerminalResize = () => {
    if (this.connected) {
      this.conn.send(
        JSON.stringify({
          Op: 'resize',
          Cols: this.term.cols,
          Rows: this.term.rows,
        })
      );
    }
  };

  render() {
    return <div id="terminal" />;
  }
}
