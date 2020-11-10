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
} from 'react-native';
// import CameraRoll, {saveToCameraRoll} from '@react-native-community/cameraroll';

class MyCamera extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.on}
        />
        <View>
          <Grid style={styles.bottomToolbar}>
            <Row>
              <Col size={2}>
                <Button title="switch" onPress={this.props.switchOccupy} />
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
  takePicture = async () => {
    if (this.camera) {
      const options = {quality: 0.5, base64: true};
      const data = await this.camera.takePictureAsync(options);
      console.log('taking a picture');
    }
  };
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
