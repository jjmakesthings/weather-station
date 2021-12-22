import cityObject from "./city.list.json";
const APIKey = "098aad25ae5f2e1c06ba7db2163ed759";

const dropDownModule = (function () {
  //complete list of city ids
  const cityList = Object.values(cityObject);

  //complete list of countries
  const countryOptions = cityList.reduce((list, city) => {
    if (city.country && !list.includes(city.country)) {
      list.push(city.country);
    }
    return list;
  }, []);
  const sortedCountryOptions = countryOptions.sort((a, b) => (a > b ? 1 : -1));

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

  //fill country drop down
  const countryDropDown = document.getElementById("country");
  sortedCountryOptions.forEach((country) => {
    const option = document.createElement("option");
    option.innerText = country;
    countryDropDown.appendChild(option);
  });

  //listener on country and fill state drop down
  const stateDropDown = document.getElementById("state");
  const fillStateDropDown = function (e) {
    const selectedCountry = e.target.value;
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
  countryDropDown.addEventListener("change", fillStateDropDown);

  // listener on country and state to fill city autofill list
  let cityOptions = [];
  const cityInput = document.getElementById("city-list");
  const fillCityOptions = function () {
    const selectedCountry = countryDropDown.value;
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
    cityInput.innerHTML = "";
    cityOptions.forEach((city) => {
      const element = document.createElement("option");
      element.value = city;
      cityInput.appendChild(element);
    });
  };
  countryDropDown.addEventListener("change", fillCityOptions);
  stateDropDown.addEventListener("change", fillCityOptions);

  return { cityList };
})();

// functions to find weather
const getCityId = function (cityName, state, country) {
  const result = dropDownModule.cityList.filter(
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

fetchById(getCityId("Buffalo", "NY", "US")).then((data) => console.log(data));
