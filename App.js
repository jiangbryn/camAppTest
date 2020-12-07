'use strict';

import React, {Component} from 'react';
import io from 'socket.io-client';
import MainPage from "./src/components/MainPage";

class App extends Component {
  constructor(props) {
    super(props);
    this.socket = null;
  }

  componentDidMount() {
    const roomId = 111;
    this.socket.emit('join', {roomId: roomId});
  }

  render() {
    this.socket = io.connect('http://10.0.0.152:3000');
    return (
      <MainPage socket={this.socket}/>
    );
  }
}

export default App;
