import cityObject from "./city.list.json";
import countries from "./countries.json";
const APIKey = "098aad25ae5f2e1c06ba7db2163ed759";

//list that contains city objects
const cityList = Object.values(cityObject);

const locationFormModule = (function () {
  //states in selected country
  let sortedStateOptions = [];
  let hasStates = true;

  const getStateOptions = function (country) {
    const stateOptions = cityList.reduce((list, city) => {
      if (city.country == country && city.state && !list.includes(city.state)) {
        list.push(city.state);
      }
      return list;
    }, []);
    if (stateOptions.length < 1) {
      hasStates = false;
      sortedStateOptions = [];
    } else {
      hasStates = true;
      sortedStateOptions = stateOptions.sort((a, b) => (a > b ? 1 : -1));
    }
    return sortedStateOptions;
  };

  //list that contains full country names
  const sortedCountryOptions = countries
    .map((country) => country.name)
    .sort((a, b) => (a > b ? 1 : -1));
  //fill country autofill list
  const countryListElem = document.getElementById("country-list");
  sortedCountryOptions.forEach((country) => {
    const element = document.createElement("option");
    element.value = country;
    countryListElem.appendChild(element);
  });
  // function to get country abbrv out of form
  const getCountryAbbrv = function (countryName) {
    const query = countries.filter((country) => country.name == countryName);
    if (query.length > 0) {
      return query[0].code;
    }
  };
  //listener on country and fill state drop down
  const stateDropDown = document.getElementById("state");
  const fillStateDropDown = function (e) {
    console.log(e.target.value);
    const selectedCountry = getCountryAbbrv(e.target.value);
    console.log(selectedCountry);
    getStateOptions(selectedCountry);
    stateDropDown.innerHTML = "";
    // add title option
    const option = document.createElement("option");
    option.value = "";
    option.disabled = true;
    option.selected = true;
    option.innerText = "State";
    stateDropDown.appendChild(option);
    // set class and state options
    if (hasStates) {
      stateDropDown.classList.remove("no-states");
      sortedStateOptions.forEach((state) => {
        const option = document.createElement("option");
        option.innerText = state;
        stateDropDown.appendChild(option);
      });
    } else stateDropDown.classList.add("no-states");
  };
  const countryInput = document.getElementById("country");
  countryInput.addEventListener("change", fillStateDropDown);

  // listener on country and state to fill city autofill list
  let cityOptions = [];
  const cityListElem = document.getElementById("city-list");
  const fillCityOptions = function (e) {
    const selectedCountry = getCountryAbbrv(countryInput.value);
    const selectedState = stateDropDown.value;
    cityOptions = cityList.reduce((list, city) => {
      if (
        city.country == selectedCountry &&
        city.state == selectedState &&
        city.name &&
        !list.includes(city.name)
      ) {
        list.push(city.name);
      }
      return list;
    }, []);
    cityListElem.innerHTML = "";
    cityOptions.forEach((city) => {
      const element = document.createElement("option");
      element.value = city;
      cityListElem.appendChild(element);
    });
  };
  countryInput.addEventListener("change", fillCityOptions);
  stateDropDown.addEventListener("change", fillCityOptions);

  const cityInput = document.getElementById("city");

  //function to extract form values
  const getForm = function () {
    const city = cityInput.value;
    const country = getCountryAbbrv(countryInput.value);
    const state = stateDropDown.value;
    return [city, country, state];
  };
  return { cityList, getForm };
})();

// functions to find weather
const getCityId = function (cityName, state, country) {
  const result = cityList.filter(
    (city) =>
      city.name == cityName && city.state == state && city.country == country
  );
  if (result.length > 0) {
    return result[0].id;
  }
};

const fetchById = async function (cityId) {
  const url = `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${APIKey}`;
  const response = await fetch(url, { mode: "cors" });
  const data = await response.json();
  return data;
};

document.getElementById("submit").addEventListener("click", (e) => {
  const location = locationFormModule.getForm();
  fetchById(getCityId(location[0], location[2], location[1])).then((data) =>
    console.log(data)
  );
});
//fetchById(getCityId("Buffalo", "NY", "US")).then((data) => console.log(data));
