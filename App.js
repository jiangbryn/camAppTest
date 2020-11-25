'use strict';

import React, {Component} from 'react';
import {View} from 'react-native';
import Video from './src/components/Video';
import io from 'socket.io-client';

class App extends Component {
  constructor(props) {
    super(props);
    this.socket = null;
    this.state = {
      takePhoto: false,
      cameraOccupy: 0
    }
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

  setTakePhoto = (state) => {
    this.setState({
      takePhoto: state
    })
  }

  setCameraOccupy = (state) => {
    this.setState({
      cameraOccupy: state
    })
  }

  render() {
    // To use ios app, it should connect to the ip addr of computer
    this.socket = io('http://172.18.143.250:3000');
    console.log(`is occupy: ${this.state.cameraOccupy}`)
    return (
      <View>
        <Video isFront={false} socket={this.socket} setCameraOccupy={this.setCameraOccupy}/>
      </View>
    );
  }
}

export default App;
