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
  TouchableHighlight,
  Image,
  ScrollView,
  Modal,
} from 'react-native';

import CameraRoll, {saveToCameraRoll} from '@react-native-community/cameraroll';

class MyCamera extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos_content: [],
      modalVisible: false,
      indexState: null,
      selectedURI: null,
      showing_image: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('rerendering camera.js');
    console.log(this.state.showing_image);
    console.log(this.state.selectedURI);
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
    this.props.socket.emit('upload', data);
    // }
  };
  _getCameraRoll = () => {
    console.log('get camera roll');
    CameraRoll.getPhotos({
      first: 5,
      assetType: 'Photos',
    })
      .then((r) => {
        this.setState({photos_content: r.edges});
        console.log(r.edges);
      })
      .catch((err) => {
        console.log('fail to get camera roll');
      });
  };
  toggleModal = () => {
    this.setState({modalVisible: !this.state.modalVisible});
  };

  indexSelection = (index) => {
    if (index === this.state.indexState) {
      this.setState({indexState: null});
    } else {
      this.setState({indexState: index});
    }
  };

  switch_imageshowing = (flag) => {
    this.setState({showing_image: flag});
  };

  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={
            this.props.isFront
              ? RNCamera.Constants.Type.front
              : RNCamera.Constants.Type.back
          }
          flashMode={
            this.props.flash
              ? RNCamera.Constants.FlashMode.on
              : RNCamera.Constants.FlashMode.off
          }
          exposure={this.props.exposure}
        />
        {this.state.showing_image ? (
          <View>
            <TouchableHighlight
              onLongPress={() => {
                this.setState({showing_image: false});
              }}>
              <Image
                style={{
                  width: winWidth,
                  height: winHeight,
                  resizeMode: 'stretch',
                }}
                source={{uri: this.state.selectedURI}}
              />
            </TouchableHighlight>
          </View>
        ) : (
          <View>
            <Button
              title="View CameraRoll"
              onPress={() => {
                this.toggleModal();
                this._getCameraRoll();
              }}
            />
            <Modal
              animationType={'slide'}
              transparent={false}
              visible={this.state.modalVisible}
              onRequestClose={() => console.log('closed')}>
              <View style={styles.modalContainer}>
                <Button title="Close" onPress={this.toggleModal} />
                {/*<ScrollView contentContainerStyle={styles.scrollView}>*/}
                <ScrollView>
                  {this.state.photos_content.map((p, i) => {
                    return (
                      <TouchableHighlight
                        style={{opacity: i === this.state.indexState ? 0.5 : 1}}
                        key={i}
                        underlayColor="transparent"
                        onPress={() => {
                          this.indexSelection(i);
                          console.log(p.node.image.uri);
                          this.setState({selectedURI: p.node.image.uri});
                        }}>
                        <Image
                          key={i}
                          style={styles.imageView}
                          source={{uri: p.node.image.uri}}
                        />
                      </TouchableHighlight>
                    );
                  })}
                </ScrollView>
                {this.state.indexState !== null && (
                  <View
                    style={{
                      flex: 0,
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        this.switch_imageshowing(true);
                      }}
                      style={{
                        flex: 0,
                        backgroundColor: '#fff',
                        borderRadius: 5,
                        padding: 15,
                        paddingHorizontal: 20,
                        alignSelf: 'center',
                        margin: 5,
                      }}>
                      <Text style={{fontSize: 16}}> Upload </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Modal>
          </View>
        )}
      </View>
    );
  }
}

const {width: winWidth, height: winHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    display: 'none',
    // flex: 1,
    // justifyContent: 'flex-end',
  },
  modalContainer: {
    paddingTop: 20,
    flex: 1,
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
    // alignItems: 'left',
  },
  captureBtn: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 60,
    borderColor: '#ffffff',
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
  imageView: {
    width: winWidth,
    height: winHeight / 2,
    flex: 1,
    flexWrap: 'wrap',
    // alignSelf: 'stretch',
    // width: undefined,
    // height: undefined,
    resizeMode: 'stretch',
  },
});

export default MyCamera;
