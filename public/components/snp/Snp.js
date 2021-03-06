import React from 'react';
import axios from 'axios';
import ParkPhotoPost from './ParkPhotoPost.js'
import {browserHistory} from 'react-router'
import Parkcomment from './Parkcomment.js'
import ParkPhoto from './ParkPhoto.js'
import ParkMap from './ParkMap.js'
import RatingPark from './Rating.js'
import Info from './Info.js';
import { Rating } from 'semantic-ui-react';
import ReviewCommentBox from './ReviewCommentBox.js'
import loadMore from './../loadMore.js';
import sort from './../sort.js';



export default class Snp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: this.props.params.parkName,
      park: {
        id: 1,
        name: 'null',
        info: 'null',
        twitterHandle: 'undefined',
        hours: 'null',
        contact: 'null',
        location: 'null',
        rating: 'null',
        hero: 'https://www.doi.gov/sites/doi.gov/files/press-release/thumbnail-images/Denali%20-%20Landscape.jpg'
      },
      view: 'Photos',
      photosRemaining: [],
      photosDisplay: [],
      commentsRemaining: [],
      commentsDisplay: [],
      officialPhotos: [],
      averageRating: 0,
      photoCount: 10,
      didUserRate: false,
      totalReviews: 0,
      user: {
        id: 1,
        firstName: 'null',
        email: 'null@gmail.com'
      },
      loadMorePhotosStyle: 'block',
      loadMoreCommentsStyle: 'block',
    }
  }



  componentWillReceiveProps(nextProps) {
    this.updateParkInfo(nextProps.params.parkName);

  }

  componentWillMount() {
    this.updateParkInfo(this.props.params.parkName);
  }

  capFirstLetter(string) {
    string = string.split(' ');
    string.forEach(function(word, index, array) {
      if (word !== 'of' && word !== 'the' && word !== 'and') {
        array[index] = word.charAt(0).toUpperCase() + word.slice(1);
      }
    })
    string = string.join(' ');
    //Wrangell-St. Elias code:
    string = string.split('–');
    string.forEach(function(word, index, array) {
      if (word !== 'of' && word !== 'the' && word !== 'and') {
        array[index] = word.charAt(0).toUpperCase() + word.slice(1);
      }
    });
    string = string.join('–');
    return string;
  }

  changeViewToPhotos() {
    this.setState({view: 'Photos'})
  }

  changeViewToReviews() {
    this.setState({view: 'Reviews'})
  }

  updateParkInfo(parkName) {
    var context = this;
    parkName = parkName.split(' ');
    parkName = parkName.join('%20');
    //Get the park  object and set state to the new object
    axios.get('/api/park/' + parkName).then(function(res) {
      if (res.data) {
        context.setState({park: res.data})
        context.setState({averageRating: res.data.rating})
      } else {
        context.setState({park: {
          id: false,
          name: 'blue',
          info: 'not a park!',
          twitterHandle: 'notvalidtwitterHandle'
        }})
      } // then get parkPhotos, posts, and comments
    }).then(function(){
      if (context.state.park.id) {
        axios.get('/api/session').then(function(user) {
          context.setState({
            user: user.data
          })
        })
        axios.get('/api/parkPhoto/' + context.state.park.id).then(function(res) {
          if (res.data) {
            let photoUrls = [];
            for (var i = 0; i < res.data.length; i++) {
              photoUrls.push(res.data[i].photoUrl);
            }
            context.setState({officialPhotos: photoUrls});
          }
        })
        axios.get('/api/parkPhotoPost/' + context.state.park.id).then(function(res) {
          if (res.data) {
            var sortedPhotos = sort(res.data, 'activity');
            var arrays = loadMore(context.state.photoCount, [], sortedPhotos);
            if (arrays[1].length === 0) {
              context.setState({loadMorePhotosStyle: 'none'})
            } else {
              context.setState({loadMorePhotosStyle: 'block'})
            }
            context.setState({
              photosDisplay: arrays[0],
              photosRemaining: arrays[1],
            })
          }
        })
        axios.get('/api/parkComment/' + context.state.park.id).then(function(res) {
          if (res.data) {
            var commentArr = res.data.reverse();
            var sortedComment = sort(res.data, 'activity');
            var arrays = loadMore(context.state.photoCount, [], sortedComment);
            if (arrays[1].length === 0) {
              context.setState({loadMoreCommentsStyle: 'none'})
            } else {
              context.setState({loadMoreCommentsStyle: 'block'})
            }
            context.setState({
              commentsDisplay: arrays[0],
              commentsRemaining: arrays[1],
            })
          }
        })
        axios.get('/api/totalReviews', {params: {
          parkId: context.state.park.id
        }}).then(function(res) {
          context.setState({totalReviews: res.data.reviews})
        })
        axios.get('/api/parkAverageRating/' + context.state.park.id).then(function(res){
          context.setState({averageRating: Math.round(res.data.rating)})
        })
      } else { //if data comes back without an id it's not a valid park name
        browserHistory.replace('/notavalidpark/' + parkName);
      }
    })
  }

  didUserRate(bool) {
    this.setState({didUserRate: bool});
  }

  updateAverageRating (avgRate) {
    this.setState({averageRating: avgRate});
  }

  getCommentsAfterPost (review) {
    var addNewComment = this.state.commentsDisplay;
    addNewComment.unshift(review)
    this.setState({commentsDisplay: addNewComment});
  }

  loadMorePhotos () {
    var arrays = loadMore(this.state.photoCount, this.state.photosDisplay, this.state.photosRemaining);
    if (arrays[1].length === 0) {
      this.setState({loadMorePhotosStyle: 'none'})
    }
    this.setState({
      photosDisplay: arrays[0],
      photosRemaining: arrays[1],
    });
  }

  loadMoreComments () {
    var arrays = loadMore(this.state.photoCount, this.state.commentsDisplay, this.state.commentsRemaining);
    if (arrays[1].length === 0) {
      this.setState({loadMoreCommentsStyle: 'none'})
    }
    this.setState({
      commentsDisplay: arrays[0],
      commentsRemaining: arrays[1],
    });
  }

  mediaView (view) {
    if (view === 'Photos') {
      return (
        <div className='photo-view'>
          <div className='photo-view-header'>
            <h4 className='photo-view-title'>Community Photos</h4>
            <p className='photo-view-para'>{'See what other community members are discovering at ' + this.capFirstLetter(this.state.park.name) + ' National Park.' }</p>
          </div>
          <div className='photo-view-container'>
          {this.state.photosDisplay.map((photo, i) =>
            <ParkPhotoPost photo={photo.filePath}
              key={i}
              index={i}
              description={photo.description}
              parkName={this.capFirstLetter(this.state.park.name)}
              userPhotos={this.state.photosDisplay}
              postId={photo.id}
              parkId={photo.parkId}
              userId={this.state.user.id}
              length={this.state.photosDisplay.length}
            />
          )}
        </div>
        <button className='snp-load-btn' onClick={this.loadMorePhotos.bind(this)} style={{display: this.state.loadMorePhotosStyle}}>Load More</button>
      </div>
      )
    } else {
      return (
        <div className='review-view-container'>
          <div className='review-view-left' >
            <div className='review-header'>
              <div className='review-center'>
                <div className='review-title'>{this.capFirstLetter(this.state.park.name) + ' National Park'}</div>
                <Rating
                  icon={'star'}
                  maxRating={5}
                  rating={this.state.averageRating}
                  size= {'huge'}
                  disabled={true}
                />
                <span>{this.state.totalReviews} reviews</span>
                <div className='review-section-snp'>
                  <h3 className='write-review'>Write a review</h3>
                </div>
                <div className='review-rating-box'>
                  <RatingPark parkId={this.state.park.id}
                    size={'huge'}
                    styleBox={'rating-container-review'}
                    didUserRate={this.didUserRate.bind(this)}
                    updateAverageRating={this.updateAverageRating.bind(this)}
                    userId={this.state.user.id}
                    />
                  <h3>{this.state.didUserRate ? 'Thanks for rating ' + this.capFirstLetter(this.state.park.name) + ' National Park' : 'Rate your experience'}</h3>
                </div>
                <div className='reviewCommentBox'>
                  <ReviewCommentBox
                    didUserRate={this.state.didUserRate}
                    parkId={this.state.park.id}
                    userId={this.state.user.id}
                    firstName={this.state.user.firstName}
                    userEmail={this.state.user.email}
                    getCommentsAfterPost={this.getCommentsAfterPost.bind(this)}
                  />
                </div>
              </div>
              <div className='parkLogisticsContainer'>
                <Info
                  title={'Hours'}
                  detail={this.state.park.hours}
                />
                <Info
                  title={'Location'}
                  detail={this.state.park.location}
                />
                <Info
                  title={'Contact'}
                  detail={this.state.park.contact}
                />
              </div>
            </div>
          </div>
          <div className='review-comments'>
            {this.state.commentsDisplay.map((comment, i) =>
              <Parkcomment parkId={comment.parkId} userId={comment.userId} firstName={comment.firstName} text={comment.text} datePosted={comment.createdAt} key={i}/>
            )}
          </div>
          <button className='snp-load-btn' onClick={this.loadMoreComments.bind(this)} style={{display: this.state.loadMoreCommentsStyle}}>Load More</button>
        </div>
      )
    }
  }

  render() {
    var boldPhotos = {fontWeight: 'normal'};
    var boldReviews = {fontWeight: 'normal'};
    (this.state.view === 'Photos') ? boldPhotos = {fontWeight: 'bold'} : boldPhotos = {fontWeight: 'normal'};
    (this.state.view === 'Reviews') ? boldReviews = {fontWeight: 'bold'} : boldReviews = {fontWeight: 'normal'};
    return (
      <div className='snp'>
        <div className='hero'>
          <img className='hero-photo' src={this.state.park.hero} />
          <div className='park-title-box'>
            <h2 className="park-title">{this.capFirstLetter(this.state.park.name)} National Park</h2>
            <div className="park-rating">
              <RatingPark parkId={this.state.park.id}
                size={'large'}
                didUserRate={this.didUserRate.bind(this)}
                updateAverageRating={this.updateAverageRating.bind(this)}
                userId={this.state.user.id}
              />
            </div>
          </div>

        </div>
        <ParkMap park={this.state.park} />
        <section className="park-info">
          <h3>About the park</h3>
          {this.state.park.info}
        </section>
        <hr/>
        <h2 className='glimpse'>{'A glimpse into ' + this.capFirstLetter(this.state.park.name) + ' National Park...'}</h2>
        <div className="official-photo-container">
          {this.state.officialPhotos.map((photo, i) =>
            <ParkPhoto photo={photo}
              key={i}
              index={i}
              parkName={this.capFirstLetter(this.state.park.name)}
              allPhotos={this.state.officialPhotos} />
          )}
        </div>
        <hr/>
        <div className="snp-navlinks">
          <button className="photo-link" style= {boldPhotos} onClick={this.changeViewToPhotos.bind(this)}>Community Photos</button>
          <span className="vertical-bar">|</span>
          <button className="review-link" style= {boldReviews} onClick={this.changeViewToReviews.bind(this)}>Reviews & Info</button>
        </div>
        <div className="mediaview-container">
          {this.mediaView.call(this, this.state.view)}
        </div>
      </div>
    )
  }
}
