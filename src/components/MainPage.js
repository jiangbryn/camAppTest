'use strict';

import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import Video from './Video';
import MyCamera from './camera';
import Pattern from './Pattern';

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.firstRender = true;
    this.socket = this.props.socket;
    this.state = {
      cameraOccupy: 0, // 0 for preview, 1 for taking pictures.
      takePhoto: false,
      isFront: false,
      flash: true,
      exposure: -1,
    };
  }

  componentDidMount() {
    this.socket.on('receive-setting', (data) => {
      console.log(data);
      this.setState({flash: data.flash});
      this.setState({isFront: data.isFront});
      this.setState({exposure: data.expoTime});
    });

    this.socket.on('take-photo', () => {
      console.log('Take a Photo');
      this.switchTakePhoto(true);
    });

    this.socket.on('app-to-connect', (data) => {
      this.switchOccupy(0);
    });

    this.socket.on('close', () => {
      console.log('closed');
      this.switchOccupy(1);
    });
  }

  componentDidUpdate() {
    this.firstRender = false;
  }

  switchOccupy = (state) => {
    // console.log(`switch occupy to ${state === 0 ? 'preview' : 'take photo'}`);
    this.setState({cameraOccupy: state});
  };

  switchTakePhoto = (state) => {
    // console.log('to take a photo is ', this.state.takePhoto);
    this.setState({takePhoto: state});
  };

  render() {
    return (
      <View style={styles.container}>
        <Pattern />
        <Video
          style={{
            display: 'none',
          }}
          socket={this.socket}
          switchOccupy={this.switchOccupy}
          firstRender={this.firstRender}
          isFront={this.state.isFront}
        />
        {this.state.cameraOccupy === 0 ? null : (
          <MyCamera
            style={{
              display: 'none',
            }}
            socket={this.socket}
            takePhoto={this.state.takePhoto}
            isFront={this.state.isFront}
            flash={this.state.flash}
            exposure={this.state.exposure}
            switchOccupy={this.switchOccupy}
            switchTakePhoto={this.switchTakePhoto}
          />
        )}
      </View>
    );
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
export default MainPage;
