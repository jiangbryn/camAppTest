'use strict';

import React, {Component} from 'react';
import {View} from 'react-native';
import Video from './src/components/Video';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <View>
          <Video />
        </View>
    );
  }
}

export default App;
