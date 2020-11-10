'use strict';

import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Button,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import Video from './src/components/Video';
import MyCamera from './src/components/camera';
import io from 'socket.io-client';
import {RNCamera} from 'react-native-camera';

class App extends Component {
  constructor(props) {
    super(props);
    this.para = null;
    this.socket = null;
    this.state = {
      cameraOccupy: 0, // 0 for preview, 1 for taking pictures.
    };
  }

  componentDidMount() {
    this.socket.on('receiveSetting', (data) => {
      console.log(data);
    });

    this.socket.on('takePhoto', () => {
      console.log('Take a Photo');
      this.switchOccupy();
    });
  }

  switchOccupy = () => {
    console.log('switch occupy');
    this.setState({cameraOccupy: 1 - this.state.cameraOccupy});
  };

  render() {
    // To use ios app, it should connect to the ip addr of computer
    this.socket = io('http://192.168.0.102:3000');
    if (this.state.cameraOccupy == 0) {
      return (
        <View style={styles.container}>
          <Video
            roomId={111}
            isFront={false}
            socket={this.socket}
            switchOccupy={this.switchOccupy}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <MyCamera switchOccupy={this.switchOccupy} />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});
export default App;
