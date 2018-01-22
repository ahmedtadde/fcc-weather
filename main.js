let degreeUnitState = {
  last:'degree-f',
  current: 'degree-f'
};
let graphTemparatures;
let browserLocation = {};
let locationInput = document.getElementById('location-input');
let locationParams = {
  types: ['(regions)']
};

autocomplete = new google.maps.places.Autocomplete(locationInput, locationParams);

(function() {
    let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    let months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    Date.prototype.getMonthName = function() {
        return months[ this.getMonth() ];
    };
    Date.prototype.getDayName = function() {
        return days[ this.getDay() ];
    };

    Date.prototype.getFormatedDate = function(){
      let day = this.getDate();
      let str = 'th';
      let lastDigit = day % 10;
      if ([1,2,3].includes(lastDigit)){
        if( lastDigit  === 1){
          str = 'st';
        }else {
          if( lastDigit === 2){
            str = 'nd';
          }else{
            str = 'rd';
          }
        }
      }

      return `${day}${str}`;
    }

    Date.prototype.getNextFourDays = function(){
      let today = this.getDay();
      let inFourDays = (today+4)%7;
      let indexRange = [inFourDays-3,inFourDays-2,inFourDays-1,inFourDays];
      indexRange = indexRange.map((el) => {
        if (el < 0) return el+7;
        return el;
      });

      return indexRange.map((el) => {
        return days[el];
      });
    }
})();

window.onload = (() => {
  google.maps.event.addListener(autocomplete, 'place_changed', updateCard);

  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition((position) => {
      if (position.coords.latitude && position.coords.longitude){
        browserLocation.lat = position.coords.latitude;
        browserLocation.lon = position.coords.longitude;
        let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${browserLocation.lat},${browserLocation.lon}&result_type=locality&key=AIzaSyCthCggpjlXE_ztlKMW0SmcYKV6nro7vD0`;
        fetch(url).then((response) => response.json()).then((data) => {
          let items = data.results[0].address_components;
          if (items){
            let targetItems = items.filter((item) => item.types.includes('locality'));
            if(targetItems){
              browserLocation.name = targetItems[0].long_name;
              makeDefaultCard();
            }else{
              console.log('no items of type "locality"');
            }
          }else{
            console.log('issue with data.results[0].address_components');
          }

        }).catch((error) => console.log(error));
      }else{
        console.log('geolocation supported but user not allowing access to location data');
      }
    });

  }else{
    console.log('navigator.geolocation not supported.');
  }

})();


document.getElementById('degree-f').addEventListener('click', () =>{
  degreeUnitState.last = degreeUnitState.current;
  degreeUnitState.current = 'degree-f';
  updateDegreeUnit(degreeUnitState);
});

document.getElementById('degree-c').addEventListener('click', () =>{
  degreeUnitState.last = degreeUnitState.current;
  degreeUnitState.current = 'degree-c';
  updateDegreeUnit(degreeUnitState);
});


let detailsIcons = document.getElementsByClassName('fa-arrow-circle-o-down');
Array.prototype.map.call(detailsIcons, (el) => {
  el.onclick = (e) => {
    let icon = e.target;
    let forecastContainer = icon.parentElement.parentElement.parentElement.parentElement;


    [
      'forecast-day-summary-1',
      'forecast-day-summary-2',
      'forecast-day-summary-3',
      'forecast-day-summary-4'
    ].filter(id => id !== forecastContainer.lastElementChild.id).map((id) => {

      let domElement = document.getElementById(id);
      if(!domElement.classList.contains('hide')){
        domElement.classList.add('hide');
      }
    });

    if (forecastContainer.lastElementChild.classList.contains('hide')){
      forecastContainer.lastElementChild.classList.remove('hide');
    }else{
      forecastContainer.lastElementChild.classList.add('hide');
    }
  }
});




function updateDegreeUnit(selection){
  let fahrenheit = document.getElementById('degree-f');
  let celcius = document.getElementById('degree-c');
  if(selection.current === 'degree-f'){
    fahrenheit.classList.add('active-degree-unit');
    celcius.classList.remove('active-degree-unit');
    if (selection.last === 'degree-c'){
      updateDegreeValues('C-to-F');
    }
  }else{
    fahrenheit.classList.remove('active-degree-unit');
    celcius.classList.add('active-degree-unit');
    if (selection.last === 'degree-f'){
      updateDegreeValues('F-to-C');
    }
  }
}

function updateDate(){
  let dayName = document.getElementById('day-name');
  let monthAndDay = document.getElementById('month-and-day');

  let date = new Date();
  dayName.textContent = date.getDayName();
  monthAndDay.textContent = `${date.getMonthName()} ${date.getFormatedDate()}`;
}


function updateForecastDays(){
  let forecastDays = ['forecast-day-1','forecast-day-2','forecast-day-3','forecast-day-4']
  let date = new Date();
  let dayNames = date.getNextFourDays();

  forecastDays.map((domObjId,domObjIdx) => {
    document.getElementById(domObjId).textContent = dayNames[domObjIdx];
  });
}


function updateLocationName(){
  let location;
  if (autocomplete.getPlace().formatted_address){
    location = autocomplete.getPlace().formatted_address.split(",")[0];
  }

  document.getElementById("city").textContent = location
  return location;
}


function updateLocationCoordinates(){
  let location = autocomplete.getPlace();
  return {
    lat:location.geometry.location.lat(),
    lon:location.geometry.location.lng()
  }
}


function updateWeatherSummary(data){
  document.getElementById('weather-summary').textContent = `${data.hourly.summary}`;
  document.getElementById('weather-icon-description').textContent = `${data.currently.summary}`;

  document.getElementById('forecast-day-summary-1').textContent = `${data.daily.data[1].summary}`;
  document.getElementById('forecast-day-summary-2').textContent = `${data.daily.data[2].summary}`;
  document.getElementById('forecast-day-summary-3').textContent = `${data.daily.data[3].summary}`;
  document.getElementById('forecast-day-summary-4').textContent = `${data.daily.data[4].summary}`;

}


function updateDegreeValues(flag){

  //FOR ALL Temp VALUES except graph's
  const degree = '&#176';
  [
      'weather-status-now-temp',
      'weather-status-low-temp',
      'weather-status-high-temp',
      'forecast-low-1',
      'forecast-high-1',
      'forecast-low-2',
      'forecast-high-2',
      'forecast-low-3',
      'forecast-high-3',
      'forecast-low-4',
      'forecast-high-4'
    ].map((element, idx) => {
      let currentVal = Number.parseInt(document.getElementById(element).textContent);
      let convertedVal = currentVal;

      if (flag === 'C-to-F'){
        convertedVal = Math.round((9/5) * currentVal+ 32);
      }else if(flag === 'F-to-C'){
        convertedVal = Math.round((5/9) * (currentVal - 32));
      }else{

      }

      if (idx === 0){
        document.getElementById(element).innerHTML = `${convertedVal}${degree}`;
      }else{
        document.getElementById(element).textContent = convertedVal;
      }
    });

    // FOR GRAPH
    if (flag === 'C-to-F'){
      graphTemparatures = graphTemparatures.map((el) => {
        return Math.round((9/5) * el + 32);
      });

      drawGraph(graphTemparatures);

    }else if(flag === 'F-to-C'){
      graphTemparatures = graphTemparatures.map((el) => {
        return  Math.round((5/9) * (el - 32));
      });

      drawGraph(graphTemparatures);

    }else{

    }

}

function formatPercentValue(value){
  return Math.round(Number.parseFloat(value) * 100);
}

function formatTempValue(value){
  if (degreeUnitState.current === 'degree-c'){
    return Math.round((5/9) * (Number.parseFloat(value) - 32));
  }
  return Math.round(Number.parseFloat(value));
}


function getWeatherValues(data){
  let result = [];
  result[0] = formatTempValue(data.currently.temperature);
  result[1] = formatTempValue(data.daily.data[0].temperatureMin);
  result[2] = formatTempValue(data.daily.data[0].temperatureMax);
  result[3] = formatPercentValue(data.currently.precipProbability);
  result[4] = formatPercentValue(data.currently.humidity);
  result[5] = Math.round(data.currently.windSpeed);
  result[6] = formatPercentValue(data.daily.data[1].precipProbability);
  result[7] = formatPercentValue(data.daily.data[2].precipProbability);
  result[8] = formatPercentValue(data.daily.data[3].precipProbability);
  result[9] = formatPercentValue(data.daily.data[4].precipProbability);
  result[10] = formatTempValue(data.daily.data[1].temperatureMin);
  result[11] = formatTempValue(data.daily.data[1].temperatureMax);
  result[12] = formatTempValue(data.daily.data[2].temperatureMin);
  result[13] = formatTempValue(data.daily.data[2].temperatureMax);
  result[14] = formatTempValue(data.daily.data[3].temperatureMin);
  result[15] = formatTempValue(data.daily.data[3].temperatureMax);
  result[16] = formatTempValue(data.daily.data[4].temperatureMin);
  result[17] = formatTempValue(data.daily.data[4].temperatureMax);

  return result;

}


function updateWeatherValues(newValuesArray){
  const degree = '&#176';

  [
      'weather-status-now-temp',
      'weather-status-low-temp',
      'weather-status-high-temp',
      'precipitation-value',
      'humidity-value',
      'wind-value',
      'forecast-precipitation-1',
      'forecast-precipitation-2',
      'forecast-precipitation-3',
      'forecast-precipitation-4',
      'forecast-low-1',
      'forecast-high-1',
      'forecast-low-2',
      'forecast-high-2',
      'forecast-low-3',
      'forecast-high-3',
      'forecast-low-4',
      'forecast-high-4'
    ].map((element, idx) => {

      if (idx === 0){
        document.getElementById(element).innerHTML = `${newValuesArray[idx]}${degree}`;
      }else{
        document.getElementById(element).textContent = newValuesArray[idx];
      }

    });

}


function getWeatherIcons(data){

  let result = [];
  result[0] = data.currently.icon;
  result[1] = data.daily.data[1].icon;
  result[2] = data.daily.data[2].icon;
  result[3] = data.daily.data[3].icon;
  result[4] = data.daily.data[4].icon;

  return result;
}

function updateWeatherIcons(newIcons){
  [
    'weather-icon-img',
    'forecast-icon-1',
    'forecast-icon-2',
    'forecast-icon-3',
    'forecast-icon-4'
    ].map((element, idx) => {

      let domElement = document.getElementById(element);
      let classes = domElement.classList;
        domElement.classList.replace(classes[1], `wi-forecast-io-${newIcons[idx]}`);

    });
}

function drawGraph(tempValues){
  let graphContainer = document.getElementById("tertiary-info")
  graphContainer.classList.add('blank');
  graphContainer.innerHTML = '<canvas id="weather-chart"></canvas>';
  new Chart(document.getElementById("weather-chart").getContext('2d'), {
     type: 'line',
     data: {
         labels: ["12am", "4am", "8am", "12pm", "4pm", "8pm", "11pm"],
         datasets: [{
             label: '',
             datalabels: {
               align: 'end',
               anchor: 'start'
             },
             data: tempValues,
             borderColor:'black',
             pointBackgroundColor: 'white',
             pointHoverBackgroundColor: 'black',
             pointBorderColor: 'black',
             borderWidth: 1
         }]
     },
     options: {
       layout: {
            padding: {
                top: 5
            }
        },

       responsive: true,
       plugins: {
         datalabels: {
           backgroundColor: 'transparent',
           color: 'black',
           font: {
             weight: 'bolder',
             family: 'WeblySleekNormal',
             size: 10
           },
           formatter: function(value) {
             return value + '\xB0';
           }
         }
       },
         scales: {
           xAxes: [{
             gridLines: {
                 display: false
               },

               ticks: {
                 fontFamily: 'WeblySleekNormal',
                 fontSize: 10,
               }
           }],
             yAxes: [{
               stacked: true,
               display: false,
               gridLines: {
                   display: false
                 },

                 ticks: {
                   beginAtZero: false,
                   display:false,
                   max: Math.max.apply(null, tempValues) + 10,
                 }
             }]
         },

         legend: {
           display:false
         },
          tooltips: {
           enabled:false
         }
     }
 });
 graphContainer.classList.remove('blank');
}


function updateGraph(coords){

  function unixTimestamp(){
    return Math.round((new Date()).getTime() / 1000);
  }

  let proxy = 'https://cors-anywhere.herokuapp.com/';
  let darkSky = `https://api.darksky.net/forecast/6bf729e87190a68b87ac59112ff3b3b9/${coords.lat},${coords.lon},${unixTimestamp()}?exclude=minutely,daily,currently,flags,alerts`

  fetch(proxy+darkSky)
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    // console.log(data);
    let hours = data.hourly.data.filter((el, idx) => {
      if (idx % 4 === 0 || idx === 23){return true;}
      return false;
    });

    graphTemparatures = hours.map((el) => {
      return formatTempValue(el.temperature);
    });

    return graphTemparatures;


  })
  .then(drawGraph)
  .catch((err) => console.log(err));
}




function makeDefaultCard(){

  updateDate();
  updateForecastDays();
  updateDegreeUnit(degreeUnitState);
  document.getElementById('city').textContent = browserLocation.name;

  let proxy = 'https://cors-anywhere.herokuapp.com/';
  let darkSky = `https://api.darksky.net/forecast/6bf729e87190a68b87ac59112ff3b3b9/${browserLocation.lat},${browserLocation.lon}?exclude=minutely,flags,alerts`
  let url = proxy + darkSky;

  fetch(url)
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    // console.log(data);
    updateWeatherSummary(data);
    updateWeatherValues(getWeatherValues(data));
    updateWeatherIcons(getWeatherIcons(data));

    return {lat: data.latitude, lon: data.longitude};
  })
  .then(updateGraph)
  .catch((err) => console.log(err));

  document.getElementById('weather-card').classList.remove('blank');
}



function updateCard(){
  let weatherCard = document.getElementById('weather-card');
  weatherCard.classList.add('blank');
  updateDate();
  updateForecastDays();
  updateDegreeUnit(degreeUnitState);
  updateLocationName();
  let coords = updateLocationCoordinates();
  let proxy = 'https://cors-anywhere.herokuapp.com/';
  let darkSky = `https://api.darksky.net/forecast/6bf729e87190a68b87ac59112ff3b3b9/${coords.lat},${coords.lon}?exclude=minutely,flags,alerts`
  let url = proxy + darkSky;

  fetch(url)
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    // console.log(data);
    updateWeatherSummary(data);
    updateWeatherValues(getWeatherValues(data));
    updateWeatherIcons(getWeatherIcons(data));
    updateGraph(coords);

    if (weatherCard.classList.contains('hide')){
      weatherCard.classList.remove('hide');
    }
    weatherCard.classList.remove('blank');

  }).catch((err) => console.log(err));
}
