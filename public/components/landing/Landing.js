import React from 'react';
import { browserHistory } from 'react-router';

export default class Landing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  linkToExplore() {
    browserHistory.push('/explore');
  }

  signIn() {
    browserHistory.push('/signin');
  }

  signUp() {
    browserHistory.push('/signup');
  }

  render() {
    return (
      <div className="landing-div">
        <div className='splash-landing'>
          <img className='splash-img' src='https://www.adventure-journal.com/wp-content/uploads/2015/07/15155461297_402eeb3fd7_h.jpg' />
          <div className='splash-title hvr-grow' onClick={this.linkToExplore.bind(this)}>START EXPLORING</div>
          <button className='splash-signin hvr-grow' onClick={this.signIn.bind(this)}>Sign In</button>
          <button className='splash-signup hvr-grow' onClick={this.signUp.bind(this)}>Sign Up</button>
          <a className='tom-credit' href='http://www.travelcaffeine.com/' target='_blank'>Photo by Tom Bricker</a>
        </div>
      </div>
    )
  }
}
