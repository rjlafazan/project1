//expected props:
// markers : a list of events to display on the map
// getMarkerClick : a callback function that returns which marker was clicked to the parent
// createServices : a callback function that is called when map is ready. Will create the places and geocoder services
// getMarkerClick : a callback function that supplies the index of which marker was clicked


import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';

export class MapContainer extends Component {
    constructor(props){
        super(props)
        this.onMapClick = this.onMapClick.bind(this);
        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.state = {
            activeMarker: null,
            showingInfoWindow: false,
            search: '',
            num: 0
        }
    }
onMarkerClick(props, marker, e){
    this.props.getMarkerClick({
        activeMarker: props.num,
    });
    this.setState({
        activeMarker: marker,
        showingInfoWindow: true,
        num: props.num
    })
}
onMapClick(mapProps, map, clickEvent){
    if(this.state.showingInfoWindow){
        this.setState({
            showingInfoWindow: false,
            activeMarker: null
        })
    }
}
shouldComponentUpdate(nextProps, nextState){
    if(this.state === nextState && this.props.markers === nextProps.markers && this.props.loaded === nextProps.loaded){
        return false;
    }
    return true;
}
render() {
    const style = {
        width: '100%',
        height: '100%',
        position: 'initial'
      };
      const initialCenter = {
        lat: this.props.center.lat,
        lng: this.props.center.lng
      };
    
    return (
      <Map 
        google={this.props.google}
        zoom={14}
        containerStyle={style}
        // centerAroundCurrentLocation={true}
        onClick={this.onMapClick}
        initialCenter={initialCenter}
        visible={true}
        onReady={this.props.createServices}
        >

        {this.props.markers.map( (marker, index) => 
            <Marker 
                onClick={this.onMarkerClick}
                num={index}
                name={marker.name}
                title={marker.title}
                position={{lat: marker.lat, lng: marker.lng}} 
                key={marker.key} 
                description={marker.description}
                
            />
        )}
        <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showingInfoWindow}>           
            <div>
            {this.state.showingInfoWindow &&
            <div>
                <h3>{this.props.markers[this.state.num].name}</h3>
                <div
                    dangerouslySetInnerHTML={{__html: this.props.markers[this.state.num].description}}>
                </div>
                <a href={this.props.markers[this.state.num].link}>Learn More</a>
            </div>
            }
            </div> 
        </ InfoWindow>
      </Map>
    );
  }
}

//expected props:
// markers : a list of events to display on the map
// getMarkerClick : a callback function that returns which marker was clicked to the parent
// createServices : a callback function that is called when map is ready. Will create the places and geocoder services
// getMarkerClick : a callback function that supplies the index of which marker was clicked

MapContainer.propTypes = {
    markers: PropTypes.array,
    getMarkerClick: PropTypes.func,
    createServices: PropTypes.func,
    getMarkerClick: PropTypes.func,
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyDLG4_hYBIcKhGyWq1bvypGZYUbzNi0yZM"
})(MapContainer)