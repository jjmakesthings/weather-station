import cityObject from "./city.list.json";
const APIKey = "098aad25ae5f2e1c06ba7db2163ed759";

const cityList = Object.values(cityObject);
const countryOptions = cityList.reduce((list, city) => {
  if (!list.includes(city.country)) {
    list.push(city.country);
  }
  return list;
}, []);
const sortedCountryOptions = countryOptions.sort((a, b) => (a > b ? 1 : -1));

const countryDropDown = document.getElementById("country");
sortedCountryOptions.forEach((country) => {
  const option = document.createElement("option");
  option.innerText = country;
  countryDropDown.appendChild(option);
});

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

fetchById(getCityId("Buffalo", "NY", "US")).then((data) => console.log(data));
