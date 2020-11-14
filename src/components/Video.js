import React from 'react';
import {View} from 'react-native';
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
      connected: false
    }
    this.localStream = null;
    this.isFront = true;
    this.socket = this.props.socket;
    this.pc = null;
    this.candidates = {};
    this.initiator = false;
  }

  componentDidMount() {
    this.socket.on('app-to-connect', () => {
      this.setupPC();
      this.socket.emit('on-connect');
    })

    this.socket.on('on-connect', (data) => {
      this.initiator = data.initiator;
      this.setState({connected: true});
      console.log(`on-connect: is the ${data.initiator ? 'caller' : 'callee'}`);
    });

    this.socket.on('established', () => {
      console.log('established');
      if (this.initiator) {
        this.createOffer();
      }
    })

    this.socket.on('offer-or-answer', (sdp) => {
      // if (!this.state.connected) return;
      // set sdp as remote description
      console.log(`received an ${sdp.type}`);
      this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
        .then(() => {
          if (sdp.type === 'offer') {
            this.createAnswer();
          }
        })
        .catch((e) => console.log(e));
      // console.log(this.pc.currentRemoteDescription);
    })

    this.socket.on('candidate', (candidate) => {
      // console.log('From Peer... ', JSON.stringify(candidate))
      this.pc.addIceCandidate(new RTCIceCandidate(candidate))
        .catch((e) => console.log(e))
    })

    this.socket.on('close', () => {
      console.log('closed')
    });
  }

  setupPC() {
    this.isFront = this.props.isFront;
    this.pc = new RTCPeerConnection(pc_config);

    // triggered when there is a change in connection state
    this.pc.oniceconnectionstatechange = (e) => {
      if (this.pc.iceConnectionState === 'disconnected') {
        this.setState({ connected: false });
        this.releaseStream();
      }
    }

    // triggered when a new candidate is returned
    this.pc.onicecandidate = (e) => {
      // send the candidates to the remote peer
      if (e.candidate) {
        // console.log(JSON.stringify(e.candidate))
        this.sendToPeer('candidate', e.candidate)
      }
    }

    // called when getUserMedia() successfully returns
    const success = (stream) => {
      console.log('local stream: ' + stream.toURL())
      this.localStream = stream
      this.pc.addStream(stream)
    }

    // called when getUserMedia() fails
    const failure = (e) => {
      console.log('getUserMedia Error: ', e)
    }

    mediaDevices.enumerateDevices().then(sourceInfos => {
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === "videoinput" && sourceInfo.facing === (this.isFront ? "front" : "environment")) {
          videoSourceId = sourceInfo.deviceId;
          console.log('source info: ' + JSON.stringify(sourceInfo))
        }
      }

      const constraints = {
        video: {
          width: { min: 160, ideal: 640, max: 1280 },
          height: { min: 120, ideal: 360, max: 720 },
          facingMode: (this.isFront ? "user" : "environment"),
          optional: (videoSourceId ? [{ sourceId: videoSourceId }] : [])
        }
      };
      mediaDevices.getUserMedia(constraints)
        .then(success)
        .catch(failure);
    });
  }

  releaseStream() {
    this.setState({connected: false});
    this.localStream.getTracks().forEach(track => track.stop());
    this.localStream = null;
    console.log('Stream is released')
  }

  sendToPeer(messageType, data) {
    this.socket.emit(messageType, data)
  }

  createOffer() {
    console.log('Create offer: initiator is ' + this.initiator)
    // initiates the creation of SDP
    this.pc.createOffer({ offerToReceiveVideo: 1 })
      .then(sdp => {
        // console.log(JSON.stringify(sdp))
        // set offer sdp as local description
        this.pc.setLocalDescription(sdp)
        this.sendToPeer('offer-or-answer', sdp)
      }).catch((e) => console.log(e))
  }

  // creates an SDP answer to an offer received from remote peer
  createAnswer() {
    console.log('Create answer: initiator is ' + this.initiator)
    this.pc.createAnswer({ offerToReceiveVideo: 1 })
      .then(sdp => {
        // console.log(JSON.stringify(sdp))
        // set answer sdp as local description
        this.pc.setLocalDescription(sdp).catch(e => console.log(e))
        this.sendToPeer('offer-or-answer', sdp)
      }).catch((e) => console.log(e))
  }

  render() {
    return (
      <View className="video-wrapper">
        <RTCView streamURL={this.localStream && this.localStream.toURL()} />
      </View>
    );
  }
}

export default Video;
