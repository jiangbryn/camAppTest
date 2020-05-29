import React from 'react';
import io from 'socket.io-client';
import {Text, View} from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc';

const pc_config = {
  iceServers: [
    {urls: 'stun:stun4.l.google.com:19302'},
    {
      urls: 'turn:numb.viagenie.ca',
      username: 'bingyujiang2021@u.northwestern.edu',
      credential: '8983121',
    },
  ],
};

class Video extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initiator: false,
      full: false,
      connecting: false,
      waiting: true
    }
    this.localStream = null;

    this.isFront = true;
    this.socket = null;
    this.pc = null;
    this.candidates = {};
  }

  componentDidMount() {
    this.socket = io('http://192.168.1.72:3000');
    const roomId = this.props.roomId;
    this.isFront = this.props.isFront;
    this.pc = new RTCPeerConnection(pc_config);

    this.socket.on('init', () => {
      this.setState({ initiator: true });
    })

    this.socket.on('ready', () => {
      this.enterRoom(roomId);
    })

    this.socket.on('full', () => {
      this.setState({ full: true });
    });

    this.socket.on('offerOrAnswer', (sdp) => {
      // set sdp as remote description
      if (sdp.type === 'offer' && this.state.initiator) return
      if (sdp.type === 'answer' && !this.state.initiator) return;
      this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
      this.createAnswer()
    })

    this.socket.on('candidate', (candidate) => {
      // console.log('From Peer... ', JSON.stringify(candidate))
      this.pc.addIceCandidate(new RTCIceCandidate(candidate))
    })

    // triggered when a new candidate is returned
    this.pc.onicecandidate = (e) => {
      // send the candidates to the remote peer
      // see addCandidate below to be triggered on the remote peer
      if (e.candidate) {
        // console.log(JSON.stringify(e.candidate))
        this.sendToPeer('candidate', e.candidate)
      }
    }

    // triggered when there is a change in connection state
    this.pc.oniceconnectionstatechange = (e) => {
      console.log(e)
    }

    // called when getUserMedia() successfully returns - see below
    const success = (stream) => {
      this.socket.emit('join', { roomId: roomId })
      console.log(stream.toURL())
      this.localStream = stream
      this.pc.addStream(stream)
    }

    // called when getUserMedia() fails - see below
    const failure = (e) => {
      console.log('getUserMedia Error: ', e)
    }

    mediaDevices.enumerateDevices().then(sourceInfos => {
      console.log(sourceInfos);
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === "videoinput" && sourceInfo.facing === (this.isFront ? "front" : "environment")) {
          videoSourceId = sourceInfo.deviceId;
        }
      }

      const constraints = {
        // audio: true,
        video: {
          width: { min: 160, ideal: 640, max: 1280 },
          height: { min: 120, ideal: 360, max: 720 },
          facingMode: (this.isFront ? "user" : "environment"),
          optional: (videoSourceId ? [{ sourceId: videoSourceId }] : [])
        }
      }

      mediaDevices.getUserMedia(constraints)
          .then(success)
          .catch(failure);
    });
  }

  enterRoom() {
    this.setState({ connecting: true })
    if(this.state.initiator === true) {
      this.createOffer()
    }
  }

  sendToPeer(messageType, data) {
    this.socket.emit(messageType, data)
  }

  createOffer() {
    console.log('Offer')

    // initiates the creation of SDP
    this.pc.createOffer({ offerToReceiveVideo: 1 })
        .then(sdp => {
          // console.log(JSON.stringify(sdp))
          // set offer sdp as local description
          this.pc.setLocalDescription(sdp)
          this.sendToPeer('offerOrAnswer', sdp)
        })
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
  // creates an SDP answer to an offer received from remote peer
  createAnswer() {
    console.log('Answer')
    this.pc.createAnswer({ offerToReceiveVideo: 1 })
        .then(sdp => {
          // console.log(JSON.stringify(sdp))
          // set answer sdp as local description
          this.pc.setLocalDescription(sdp)
          this.sendToPeer('offerOrAnswer', sdp)
        })
  }

  render() {
    return (
      <View className="video-wrapper">
        <RTCView streamURL={this.localStream && this.localStream.toURL()} />
        {this.state.connecting && (
          <View>
            <Text>Establishing connection...</Text>
          </View>
        )}
        {this.state.waiting && (
          <View>
            <Text>Waiting for remote device...</Text>
          </View>
        )}
      </View>
    );
  }
}

export default Video;
