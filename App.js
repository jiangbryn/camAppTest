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
    this.socket.on('receiveSetting', (data) => {
      console.log(data);
    })
  }

  render() {
    this.socket = io('http://192.168.1.72:3000');
    return (
      <View>
        <Video roomId={111} isFront={false} socket={this.socket}/>
      </View>
    );
  }
}

export default App;
