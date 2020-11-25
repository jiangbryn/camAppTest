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
      takePhoto: false,
      cameratype: RNCamera.Constants.Type.back,
      flash: RNCamera.Constants.FlashMode.on,
      exposure: -1,
    };
  }

  componentDidMount() {
    const roomId = 111;
    this.socket.emit('join', {roomId: roomId});

    this.socket.on('receive-setting', (data) => {
      console.log(data);
      if (data["flash"] == true) {
        this.setState({flash: RNCamera.Constants.FlashMode.on});
      }
      else {
        this.setState({flash: RNCamera.Constants.FlashMode.off});
      }
      if (data["isFront"] == true) {
        this.setState({cameratype: RNCamera.Constants.Type.front});
      }
      else {
        this.setState({cameratype: RNCamera.Constants.Type.back});
      }
      this.setState({exposure: data["expoTime"]});
    });


    this.socket.on('take-photo', () => {
      console.log('Take a Photo');
      this.switchTakePhoto(true);
    });

    this.socket.on('on-connect', (data) => {
      this.switchOccupy(0);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("rerendering app.js");
  }


  switchOccupy = (state) => {
    console.log('switch occupy', this.state.cameraOccupy);
    this.setState({cameraOccupy: state});
  };
  switchTakePhoto = (state) => {
    console.log('switch takePhoto', this.state.takePhoto);
    this.setState({takePhoto: state});

  };

  render() {
    // To use ios app, it should connect to the ip addr of computer
    this.socket = io('http://172.18.143.250:3000');
    if (this.state.cameraOccupy == 0) {
      return (
        <View style={styles.container}>
          <Video
            isFront={false}
            socket={this.socket}
            switchOccupy={this.switchOccupy}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <MyCamera
              takePhoto={this.state.takePhoto}
              cameratype={this.state.cameratype}
              flash={this.state.flash}
              exposure={this.state.exposure}
              switchOccupy={this.switchOccupy}
              switchTakePhoto={this.switchTakePhoto}
          />
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
