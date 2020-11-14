'use strict';

import React, {Component} from 'react';
import {View} from 'react-native';
import Video from './src/components/Video';
import io from 'socket.io-client';

class App extends Component {
  constructor(props) {
    super(props);
    this.para = null;
    this.socket = null;
  }

  componentDidMount() {
    const roomId = 111;
    this.socket.emit('join', {roomId: roomId});

    this.socket.on('receive-setting', (data) => {
      console.log(data);
    })

    this.socket.on('take-photo', () => {
      console.log('Take a Photo');
    })
  }

  render() {
    // To use ios app, it should connect to the ip addr of computer
    this.socket = io('http://172.18.143.250:3000');
    return (
      <View>
        <Video isFront={false} socket={this.socket}/>
      </View>
    );
  }
}

export default App;
