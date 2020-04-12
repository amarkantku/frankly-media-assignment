import React, { Component } from 'react';
import fetch from 'cross-fetch';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import Cache from './utils/Cache';
import cities from './city.json';
import './Weather.css';

const KELVIN_VALUE = 273.15;
const API_KEY='13fdb39fa4267ca2300edbfdd1e93501';
const API_END_POINT='https://api.openweathermap.org/data/2.5/weather';

class Weather extends Component {
  constructor(props){
    super(props);
    this.state = {
        current: 0,
        locaction: [
            'San Diego, CA',
            'New York, NY',
            'Meadville, MS'
        ],
        city: '',
        weatherInfo: {},
    };
    this.time = null;
    this.getWeather();
  }

  componentDidMount() {
    this.time = setInterval(() => {
      const { current, locaction } = this.state;
      const next = (current + 1) % locaction.length;
      this.setState({ current: next }, () => {
          this.getWeather();
      });
    }, process.env.DURATION || 5000);
  }

  componentWillUnmount() {
    clearInterval(this.time);
  }

  getCityInfo() {
    const { current, locaction } = this.state;
    const [ name, state ] = locaction[current].split(',');
    let cityInfo = Cache.read(name);
    if(!cityInfo) {
        cityInfo = find(cities, { 'name': name.trim(), 'state': state.trim() })
        if(cityInfo && cityInfo.hasOwnProperty('id')) {
            Cache.write(name, cityInfo);
        }
    }
    return cityInfo;
  }

  getWeather = () => {
    const city =  this.getCityInfo();
    if(city && city.id) {
      fetch(`${API_END_POINT}?id=${city.id}&appid=${API_KEY}`)
      .then(response => response.json())
      .then(weatherInfo => {
          this.setState({ ...this.state, weatherInfo });
      });
    }
  }


  onChange = (e) => {
      const { name, value } = e.target;
      this.setState({ [name]: value });
  }

  onClick = () => {
      const { city, locaction } = this.state;
      if (city) {
          locaction.push(city);
          this.setState({
              ...this.state,
              locaction,
              city: '',
          });
      }
  }

  render () {
    const { city, weatherInfo } = this.state;
    const {name, weather, main, sys} = weatherInfo;
    const temp = main && (main.temp - KELVIN_VALUE).toFixed(2);
    const temp_max = main && (main.temp_max - KELVIN_VALUE).toFixed(2);
    const temp_min = main && (main.temp_min - KELVIN_VALUE).toFixed(2);
    return (
        <div className="wrapper">
            <div className="container">
                <input value={city} onChange={this.onChange} type="text" name="city" placeholder="Enter city name"/>
                <button onClick={this.onClick} type="button">Submit</button>
            </div>
            {!isEmpty(weatherInfo) && (<div className="weatherInfo">
                <div className="column">
                    <p className="cityName">{name}, {sys && sys.country}</p>
                    <p>{weather && weather[0].main}</p>
                </div>
                <div className="column">
                    <div className="temp">
                        {temp}<sup>o</sup>C
                    </div>
                </div>
                <div className="column">
                    <p><strong>H</strong> {temp_max}<sup>o</sup>C</p>
                    <p><strong>L</strong> {temp_min}<sup>o</sup>C</p>
                </div>
            </div>)}
        </div>
    );
  }
}

export default Weather;
