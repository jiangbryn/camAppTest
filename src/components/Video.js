import React from 'react';
import io from 'socket.io-client';
import {Text, View} from 'react-native';
import {mediaDevices, RTCView, RTCPeerConnection, RTCSessionDescription} from 'react-native-webrtc';

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
      waiting: true,
    };
    this.socket = null;
    this.pc = null;
    this.candidates = {};
    this.localStream = {};
    this.remoteStream = {};
    this.localStreamUrl = '';
    this.remoteStreamUrl = '';
  }

  componentDidMount() {
    const socket = io('https://jiangby.xyz');
    this.socket = socket;
    const roomId = 111;
    this.pc = new RTCPeerConnection(pc_config);

    this.pc.onicecandidate = (e) => {
      // send the candidates to the remote peer
      // see addCandidate below to be triggered on the remote peer
      if (e.candidate) {
        this.socket.emit('candidate', {
          candidate: {
            candidate: e.candidate.candidate,
            sdpMLineIndex: e.candidate.sdpMLineIndex,
            sdpMid: e.candidate.sdpMid
          }
        })
      }
    }

    this.pc.onaddstream = (e) => {
      debugger
      this.setState({
        connecting: false,
        waiting: false,
        remoteStreamUrl: e.stream.toURL(),
      });
      this.remoteStream = e.stream;
    }

    this.getUserMedia().then(() => {
      socket.emit('join', {roomId: roomId});
    });
    socket.on('init', () => {
      this.setState({initiator: true});
      console.log('init complete');
    });
    socket.on('ready', () => {
      console.log('enter room: ' + roomId);
      this.enter(roomId);
      console.log('is ready');
    });
    this.socket.on('candidate', (candidate) => {
      this.pc.addIceCandidate(new RTCIceCandidate(candidate))
    });
    socket.on('desc', (data) => {
      if (data.type === 'offer' && this.state.initiator) {
        return;
      }
      if (data.type === 'answer' && !this.state.initiator) {
        return;
      }
      this.call(data);
    });
    socket.on('disconnected', () => {
      this.setState({initiator: true});
    });
    socket.on('full', () => {
      this.setState({full: true});
    });
  }

  getUserMedia() {
    return new Promise((resolve, reject) => {
      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            width: {min: 160, ideal: 640, max: 1280},
            height: {min: 120, ideal: 360, max: 720},
          },
        })
        .then((stream) => {
          this.localStream = stream;
          this.localStreamUrl = stream.toURL();
          this.pc.addStream(stream);
          resolve();
        })
        .catch(() => console.error('the getUserMedia is not supported!'));
    });
  }

  enter(roomId) {
    this.setState({connecting: true});
    if (this.state.initiator) {
      this.createOffer(roomId);
    } else {
      this.createAnswer(roomId);
    }

  }

  call(data) {
    if (data.candidate) {
      console.log("in data.candidate");
      if (this.pc.remoteDescription && this.pc.remoteDescription.type) {
        this.addIceCandidate(data.candidate)
      } else {
        this.candidates.push(data.candidate)
      }
    }
    console.log("in call, candidate: " + data.candidate);
    if (data.sdp) {
      const otherDesc = JSON.stringify(data);
      this.setRemoteDescription(otherDesc);
      this.pc.setRemoteDescription(new RTCSessionDescription(data))
          .then(() => {
            if (this.destroyed) return

            this.addCandidate();
            this.candidates = []
            if (this.pc.remoteDescription.type === 'offer') this.createAnswer()
          })
          .catch(err => {
            console.log(err);
          })
    }
  }

  renderFull() {
    if (this.state.full) {
      return <Text>The room is full</Text>;
    }
  }

  sendSignal = (roomId, data) => {
    const signal = {
      room: roomId,
      desc: data,
    };
    this.socket.emit('signal', signal);
  }

  createOffer = (roomId) => {
    console.log('Offer')
    // initiates the creation of SDP
    this.pc.createOffer({ offerToReceiveVideo: 1 })
        .then(sdp => {
          // console.log(JSON.stringify(sdp));

          // set offer sdp as local description
          this.pc.setLocalDescription(sdp);
          this.sendSignal(roomId, sdp);
        })
  }

  createAnswer = (roomId) => {
    console.log('Answer')
    this.pc.createAnswer({ offerToReceiveVideo: 1 })
        .then(sdp => {
          // console.log(JSON.stringify(sdp))

          // set answer sdp as local description
          this.pc.setLocalDescription(sdp)

          this.sendSignal(roomId, sdp)
        })
  }

  setRemoteDescription = (data) => {
    // retrieve and parse the SDP copied from the remote peer
    const desc = JSON.parse(data)

    // set sdp as remote description
    this.pc.setRemoteDescription(new RTCSessionDescription(desc))
  }

  addCandidate = () => {
    // retrieve and parse the Candidate copied from the remote peer
    // const candidate = JSON.parse(this.textref.value)
    // console.log('Adding candidate:', candidate)

    this.candidates.forEach(candidate => {
      console.log(JSON.stringify(candidate))
      this.pc.addIceCandidate(new RTCIceCandidate(candidate))
    });
  }

  render() {
    return (
      <View className="video-wrapper">
        {console.log('in render local: ' + this.localStreamUrl)}
        {console.log('in render remote: ' + this.remoteStreamUrl)}
        <RTCView streamURL={this.localStreamUrl} />
        <RTCView streamURL={this.remoteStreamUrl} />
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
        {this.renderFull()}
      </View>
    );
  }
}

export default Video;
