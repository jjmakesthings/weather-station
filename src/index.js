import cityObject from "./city.list.json";
import countries from "./countries.json";
import cloudy from "./cloudy.jpeg";
import sunny from "./sunny.jpeg";
import rainy from "./rainy.jpeg";
import snowy from "./snowy.jpeg";

const APIKey = "098aad25ae5f2e1c06ba7db2163ed759";

//
document.body.style.backgroundImage = `url(${cloudy})`;

//list that contains city objects
const cityList = Object.values(cityObject);

//form inputs
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const countryInput = document.getElementById("country");

const formAutofillModule = (function () {
  //elements that hold autofill lists
  const cityListElem = document.getElementById("city-list");
  const stateListElem = document.getElementById("state-list");
  const countryListElem = document.getElementById("country-list");

  //list that contains full country names
  const sortedCountryOptions = countries
    .map((country) => country.name)
    .sort((a, b) => (a > b ? 1 : -1));

  //states in selected country
  let hasStates = true;
  const getHasStates = function () {
    return hasStates;
  };
  const getStateOptions = function (selectedCountry, selectedCity) {
    const cityIfStates = cityList.filter(
      (city) =>
        (selectedCountry ? city.country == selectedCountry : true) && city.state
    );
    hasStates = cityIfStates.length > 0 ? true : false;
    let sortedStateOptions;
    if (hasStates) {
      const stateOptions = cityIfStates.reduce((list, city) => {
        if (
          (selectedCity ? city.name == selectedCity : true) &&
          !list.includes(city.state)
        ) {
          list.push(city.state);
        }
        return list;
      }, []);
      sortedStateOptions = stateOptions.sort((a, b) => (a > b ? 1 : -1));
    } else {
      sortedStateOptions = [];
    }
    return sortedStateOptions;
  };
  const getCityOptions = function (selectedCountry, selectedState) {
    const cityOptions = cityList.reduce((list, city) => {
      if (
        (selectedCountry ? city.country == selectedCountry : true) &&
        (selectedState ? city.state == selectedState : true) &&
        !list.includes(city.name)
      ) {
        list.push(city.name);
      }
      return list;
    }, []);
    let sortedCityOptions = cityOptions.sort((a, b) => (a > b ? 1 : -1));
    return sortedCityOptions;
  };

  //fill country autofill list
  sortedCountryOptions.forEach((country) => {
    const element = document.createElement("option");
    element.value = country;
    countryListElem.appendChild(element);
  });
  // function to get country abbrv out of full name
  const getCountryAbbrv = function (countryName) {
    const query = countries.filter((country) => country.name == countryName);
    if (query.length > 0) {
      return query[0].code;
    }
  };
  // function to put city and state in correct format
  const formatCity = function (cityName) {
    if (cityName) {
      return cityName[0].toUpperCase() + cityName.slice(1);
    }
  };
  const formatState = function (stateName) {
    if (stateName) {
      return stateName.toUpperCase();
    }
  };
  //fill state autofill list
  const fillStateOptions = function (e) {
    const selectedCountry = getCountryAbbrv(countryInput.value);
    const selectedCity = formatCity(cityInput.value);
    const sortedStateOptions = getStateOptions(selectedCountry, selectedCity);
    stateInput.value = sortedStateOptions.includes(stateInput.value)
      ? stateInput.value
      : "";
    stateListElem.innerHTML = "";
    // set class and state options
    if (hasStates) {
      stateInput.classList.remove("no-states");
      sortedStateOptions.forEach((state) => {
        const option = document.createElement("option");
        option.innerText = state;
        stateListElem.appendChild(option);
      });
    } else {
      stateInput.classList.add("no-states");
    }
  };

  //fill city autofill list
  const fillCityOptions = function (e) {
    const selectedCountry = getCountryAbbrv(countryInput.value);
    const selectedState = formatState(stateInput.value);
    const sortedCityOptions = getCityOptions(selectedCountry, selectedState);
    cityListElem.innerHTML = "";
    sortedCityOptions.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      cityListElem.appendChild(option);
    });
  };

  //listeners
  countryInput.addEventListener("change", () => {
    stateInput.value = "";
    cityInput.value = "";
    fillCityOptions();
    fillStateOptions();
  });
  stateInput.addEventListener("change", fillCityOptions);
  cityInput.addEventListener("change", fillStateOptions);

  //initial country set to United States
  countryInput.value = "United States";
  fillCityOptions();
  fillStateOptions();

  //function to extract form values
  const getForm = function () {
    const city = formatCity(cityInput.value);
    const country = getCountryAbbrv(countryInput.value);
    const state = formatState(stateInput.value);
    return [city, country, state];
  };
  return { getHasStates, getForm };
})();

const weatherApiModule = (function () {
  const fetchById = async function (cityId) {
    const url = `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${APIKey}`;
    const response = await fetch(url, { mode: "cors" });
    const data = await response.json();
    return data;
  };
  return { fetchById };
})();

const weatherControlModule = (function () {
  const weatherElement = document.getElementById("weather");
  let cityId;
  let weatherDescription;
  // temps saved in kelvin
  let tempFeels;
  let tempReal;
  let tempHigh;
  let tempLow;
  let locationName;
  const weatherDescriptionElem = document.getElementById("weather-description");
  const tempRealElem = document.getElementById("temp-real");
  const tempHighElem = document.getElementById("temp-high");
  const tempLowElem = document.getElementById("temp-low");
  const locationNameElem = document.getElementById("location-name");
  const kelvinToFarenheit = function (kTemp) {
    const fTemp = (kTemp - 273.15) * (9 / 5) + 32;
    return Math.round(fTemp);
  };
  const kelvinToCelcius = function (kTemp) {
    const cTemp = kTemp - 273.15;
    return Math.round(cTemp);
  };
  const backgrounds = {
    cloud: cloudy,
    rain: rainy,
    clear: sunny,
    snow: snowy,
  };
  const logWeather = function (weather) {
    cityId = weather.id;
    weatherDescription = weather.weather[0].description;
    weatherDescriptionElem.innerText = weatherDescription;
    tempReal = kelvinToFarenheit(weather.main.temp);
    tempRealElem.innerText = tempReal;
    tempHigh = kelvinToFarenheit(weather.main.temp_max);
    tempHighElem.innerText = tempHigh;
    tempLow = kelvinToFarenheit(weather.main.temp_min);
    tempLowElem.innerText = tempLow;
    locationName = weather.name;
    locationNameElem.innerText = locationName;
    Object.keys(backgrounds).forEach((item) => {
      if (weatherDescription.includes(item)) {
        document.body.style.backgroundImage = `url(${backgrounds[item]})`;
      }
    });
    // if (weatherDescription.includes("cloud")) {
    //   document.body.style.backgroundImage = `url(${cloudy})`;
    // } else if (weatherDescription.includes("clear")) {
    //   document.body.style.backgroundImage = `url(${sunny})`;
    // }
    console.log(weather);
  };

  return { logWeather };
})();

const formSubmitModule = (function () {
  const formErrorElem = document.getElementById("errors");
  const getCityId = function (cityName, stateName, countryName) {
    const result = cityList.filter(
      (city) =>
        city.name == cityName &&
        (stateName ? city.state == stateName : true) &&
        city.country == countryName
    );
    if (result.length > 0) {
      return result[0].id;
    }
  };
  const getErrorMessage = function (cityName, stateName, countryName) {
    const countryQuery = cityList.filter((city) => city.country == countryName);
    if (countryQuery.length > 0) {
      const cityQuery = countryQuery.filter((city) => city.name == cityName);
      if (cityQuery.length > 0) {
        const stateQuery = cityQuery.filter((city) => city.state == stateName);
        if (formAutofillModule.getHasStates() && stateQuery.length > 0) {
          return "An error has occured";
        } else {
          stateInput.classList.add("error");
          return "state not found";
        }
      } else {
        cityInput.classList.add("error");
        return "City not found";
      }
    } else {
      countryInput.classList.add("error");
      return "Country not found";
    }
  };
  const validate = function (cityName, stateName, countryName) {
    let cityId = getCityId(cityName, stateName, countryName);
    formErrorElem.innerText = "";
    if (cityId) {
      return cityId;
    }
    formErrorElem.innerText = getErrorMessage(cityName, stateName, countryName);
  };
  const validateAndSubmit = function () {
    console.log("validating");
    const formData = formAutofillModule.getForm();
    console.log(formData);
    const cityName = formData[0];
    const countryName = formData[1];
    const stateName = formData[2];
    let cityId;
    if (
      cityName &&
      countryName &&
      (formAutofillModule.getHasStates() ? stateName : true)
    ) {
      cityId = validate(cityName, stateName, countryName);
      console.log(cityId);
    }
    if (cityId) {
      console.log("submitting");
      weatherApiModule
        .fetchById(cityId)
        .then((weather) => weatherControlModule.logWeather(weather));
    }
  };
  cityInput.addEventListener("change", validateAndSubmit);
  stateInput.addEventListener("change", validateAndSubmit);
})();
