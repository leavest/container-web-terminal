import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './App';
import WebTerminal from './WebTerminal';

class Routing extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route
            exact
            path="/terminal/kubernetes/:namespace/:pod/:container"
            component={WebTerminal}
          />
          <Route
            exact
            path="/terminal/docker/:container"
            component={WebTerminal}
          />
          <Route component={App} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default Routing;
