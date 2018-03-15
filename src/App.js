import React, { Component } from 'react';
import queryString from 'query-string'
import {Redirect} from 'react-router-dom'
//Theme and styling
import BeastTheme from './style/BeastTheme';
import NewZIndex from './style/NewZIndex';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import './style/App.css';
import {CSSTransitionGroup} from 'react-transition-group'; //entering animation
//Components
import Nav from './components/NavBar';
import SearchBar from './components/SearchBar';
import SideBar from './components/SideBar';
import GoogleMap from './components/GoogleMap';
import MeetUp from './components/MeetUp'

//API
import {
  parseMeetup,
  MeetUpCategories,
  categories,
} from './api/MeetUpAPI';
import DarkSkyApi, { getWeatherData } from './api/DarkSkyApi';
import { log } from 'util';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      eventCategories: [],
      events: [],
      loading: false,
      activeEvent: null,
      sidebar: true,
      center: {
        lat: 38.58011,
        lng: -121.487503,
      },
      search: {
        city: '',
        radius: 1,
        category: 0,
      },
      query: {
        update: false,
        loc: '',
        rad: null,
        cat: null,
      },
      searchError: '',
      showingInfoWindow: false,
    }
    this.pushHistory = this.pushHistory.bind(this);
    this.getMeetUps = this.getMeetUps.bind(this);
    this.callBack = this.callBack.bind(this);
    this.createServices = this.createServices.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.onRadiusChange = this.onRadiusChange.bind(this);
    this.setPlace = this.setPlace.bind(this);
    this.getMarkerClick = this.getMarkerClick.bind(this);
    this.getMapClick = this.getMapClick.bind(this);
    this.setSearch = this.setSearch.bind(this);
  }
  pushHistory(){
    var searchQuery = {
      loc: this.state.search.city,
      rad: this.state.search.radius,
      cat: this.state.search.category
    }
    var qstr = queryString.stringify(searchQuery);
    
    var qstrcmp = "?"+qstr;
    if(qstrcmp.localeCompare(this.props.location.search) !== 0){
      this.props.history.push({
        pathname: '/project1/search',
        search: qstrcmp
      })
    }
  }
  getMeetUps(status, circleOptions, meetupArray){
    if(status === 'OK'){
      var radius = this.milesToMeters(circleOptions.radius);
      var newLatLng = new this.google.maps.LatLng(circleOptions.center.lat, circleOptions.center.lng);
      var circleOpts = {
        center: newLatLng,
        radius: radius
      };
      var circle = new this.google.maps.Circle(circleOpts);
      this.map.fitBounds(circle.getBounds());
      this.setState({
        searchError: '',
        events: meetupArray,
        showingInfoWindow: false,
        activeEvent: null,
        loading: false,
        query: {
          update: false
        }
      })
      this.pushHistory()
    }
    else{
      this.setState({searchError: status, loading: false, query:{update: false}})
    }
  }
  getRadius(rad){
    switch(rad){
      case 1:
        return 10;
      case 2:
        return 25;
      case 3:
        return 50;
      default:
        return 1000;
    }
  }
  milesToMeters(miles) {
    return miles * 1609;
  }


  callBack(){
    this.setState({
      query: {
        update: true,
        loc: this.state.search.city,
        rad: this.getRadius(parseInt(this.state.search.radius)),
        cat: parseInt(this.state.search.category)
      },
      loading: true
    })
  }

  setPlace(){
    if(this.autoComplete.getPlace().formatted_address){
      this.setState({
        search: {
          city: this.autoComplete.getPlace().formatted_address,
          radius: this.state.search.radius,
          category: this.state.search.category,
        },
      });
    }
  }
  createServices(mapProps, map) {
    const { google } = mapProps;
    this.google = google;
    this.map = map;
    this.autoComplete = new google.maps.places.Autocomplete(
      document.getElementById('citySearchField')
    );
    this.autoComplete.bindTo('bounds', this.map);
    this.autoComplete.addListener('place_changed', this.setPlace);
    this.geocoder = new google.maps.Geocoder();
    this.forceUpdate();
  }
  onSearchChange(event) {
    this.setState({
      search: {
        city: event.target.value,
        radius: this.state.search.radius,
        category: this.state.search.category,
      },
    });
  }
  onCategoryChange(event, index, value) {
    this.setState({
      search: {
        city: this.state.search.city,
        radius: this.state.search.radius,
        category: value,
      },
    });
  }
  onRadiusChange(event, index, value) {
    this.setState({
      search: {
        city: this.state.search.city,
        radius: value,
        category: this.state.search.category,
      },
    });
  }
  getMarkerClick(marker) {
    //get weather data for the event clicked append to clicked event and return
    var meets = this.state.events.slice(0);
    getWeatherData(meets[marker.activeMarker]).then((meetWithWeather) => {
      meets[marker.activeMarker] = meetWithWeather;

      this.setState(
        {
          events: meets,
          activeEvent: marker.activeMarker,
          showingInfoWindow: true,
        },
        () => {
          console.log(this.state);
        }
      );
    });
  }

  getMapClick() {
    this.setState({
      showingInfoWindow: false,
    });
  }

  setSearch(){
    var searchQuery = queryString.parse(this.props.location.search)
    this.setState({
        search: {
          city: searchQuery.loc,
          radius: parseInt(searchQuery.rad),
          category: parseInt(searchQuery.cat)
        },
        query: {
          update: true,
          loc: searchQuery.loc,
          rad: parseInt(this.getRadius(parseInt(searchQuery.rad))),
          cat: parseInt(searchQuery.cat)
        },
        loading: true
    })
  }

  componentDidMount(){
    if(this.props.location.search){
      this.setSearch();
    }
  }
  componentDidUpdate(prevProps, prevState){
    var searchQuery;
    if(this.props.history.action === "POP" && this.props.location.search && this.props.location.search !== prevProps.location.search){
      this.setSearch();
    }
  }


  render() {
    return (
      <CSSTransitionGroup
      transitionName = "tunnelIn"
      transitionAppear={true}
      transitionAppearTimeout={2000}
      transitionEnter={false}
      transitionLeave={false}>

      <div className = 'wrapper'>
        <MuiThemeProvider muiTheme = {getMuiTheme(BeastTheme)}>
          <Nav className = 'navBar'/>
          </MuiThemeProvider>
          <MuiThemeProvider muiTheme = {getMuiTheme(BeastTheme, NewZIndex)}>
          <SideBar
            open = {this.state.sidebar}
            events={this.state.events}
          />
          </MuiThemeProvider>
          <MuiThemeProvider muiTheme = {getMuiTheme(BeastTheme, NewZIndex)}>
          <SearchBar
            callback={this.callBack}
            onSearchChange={this.onSearchChange}
            onCategoryChange={this.onCategoryChange}
            onRadiusChange={this.onRadiusChange}
            search={this.state.search}
            searchError={this.state.searchError}
            categories={categories}
          />
          </MuiThemeProvider>
            <GoogleMap
              center={this.state.center}
              markers={this.state.events}
              createServices={this.createServices}
              getMarkerClick={this.getMarkerClick}
              getMapClick={this.getMapClick}
              showingInfoWindow={this.state.showingInfoWindow}
              activeMarker={this.state.activeEvent}
              visible={true}
            />
            {this.state.loading && 
              <div 
                style={{
                    zIndex:5,
                    position: 'absolute',
                    backgroundColor: '#fff',
                    top: '50%',
                    left: '50%',
                    fontSize: '64px'
                  }}
                >Loading...
              </div>}
          </div>
          {this.geocoder && <MeetUp geocoder={this.geocoder} search={this.state.query} getMeetUps={this.getMeetUps} />}
        </CSSTransitionGroup>
      );
    }
}

export default App;
