import {Col, Row, Grid} from 'react-native-easy-grid';
import React, {useState, useEffect, Component, PureComponent} from 'react';
import {RNCamera} from 'react-native-camera';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Button,
  TouchableWithoutFeedback,
  Dimensions,
  CameraRoll
} from 'react-native';

// import CameraRoll, {saveToCameraRoll} from '@react-native-community/cameraroll';

class MyCamera extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('rerendering camera.js');
    if (this.props.takePhoto === true) {
      console.log('update taking picutre.');
      // this.takePicture();
      // this.props.switchTakePhoto(false);
      this.takePicture.bind(this)();
      this.props.switchTakePhoto(false);
    } else {
      console.log('not updating taking picture');
    }

  }
  takePicture = async () => {
    // if (this.camera && !this.props.takePhoto) {
    const options = {quality: 0.5, base64: true};
    const data = await this.camera.takePictureAsync(options);
    // CameraRoll.saveToCameraRoll(data.uri, 'photo');
    console.log('taking a picture');
    console.log(data.base64);
    // }
  };
  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={this.props.cameratype}
          flashMode={this.props.flash}
          exposure={this.props.exposure}
        />
        <View>
          <Grid style={styles.bottomToolbar}>
            <Row>
              <Col size={2}>
                <Button
                  title="switch"
                  onPress={() => this.props.switchOccupy(0)}
                />
              </Col>
              <Col size={2}>
                <TouchableOpacity>
                  <Button
                    style={styles.captureBtn}
                    title={'Snap'}
                    onPress={this.takePicture.bind(this)}
                  />
                </TouchableOpacity>
              </Col>
            </Row>
          </Grid>
        </View>
      </View>
    );
  }
}

const {width: winWidth, height: winHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
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
  bottomToolbar: {
    width: winWidth,
    position: 'absolute',
    height: 100,
    bottom: 0,
    // flex: 1,
    // justifyContent: 'flex-end',
    // alignItems: 'center',
  },
  captureBtn: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 60,
    borderColor: '#FFFFFF',
  },
  captureBtnActive: {
    width: 80,
    height: 80,
  },
  captureBtnInternal: {
    width: 76,
    height: 76,
    borderWidth: 2,
    borderRadius: 76,
    backgroundColor: 'red',
    borderColor: 'transparent',
  },
});

export default MyCamera;
