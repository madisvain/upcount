const countries = [
  {
    name: "Afghanistan",
    currency_code: "AFN",
  },
  {
    name: "Albania",
    currency_code: "ALL",
  },
  {
    name: "Algeria",
    currency_code: "DZD",
  },
  {
    name: "American Samoa",
    currency_code: "USD",
  },
  {
    name: "Andorra",
    currency_code: "EUR",
  },
  {
    name: "Angola",
    currency_code: "AOA",
  },
  {
    name: "Anguilla",
    currency_code: "XCD",
  },
  {
    name: "Antarctica",
    currency_code: "XCD",
  },
  {
    name: "Antigua and Barbuda",
    currency_code: "XCD",
  },
  {
    name: "Argentina",
    currency_code: "ARS",
  },
  {
    name: "Armenia",
    currency_code: "AMD",
  },
  {
    name: "Aruba",
    currency_code: "AWG",
  },
  {
    name: "Australia",
    currency_code: "AUD",
  },
  {
    name: "Austria",
    currency_code: "EUR",
  },
  {
    name: "Azerbaijan",
    currency_code: "AZN",
  },
  {
    name: "Bahamas",
    currency_code: "BSD",
  },
  {
    name: "Bahrain",
    currency_code: "BHD",
  },
  {
    name: "Bangladesh",
    currency_code: "BDT",
  },
  {
    name: "Barbados",
    currency_code: "BBD",
  },
  {
    name: "Belarus",
    currency_code: "BYR",
  },
  {
    name: "Belgium",
    currency_code: "EUR",
  },
  {
    name: "Belize",
    currency_code: "BZD",
  },
  {
    name: "Benin",
    currency_code: "XOF",
  },
  {
    name: "Bermuda",
    currency_code: "BMD",
  },
  {
    name: "Bhutan",
    currency_code: "BTN",
  },
  {
    name: "Bolivia",
    currency_code: "BOB",
  },
  {
    name: "Bosnia and Herzegovina",
    currency_code: "BAM",
  },
  {
    name: "Botswana",
    currency_code: "BWP",
  },
  {
    name: "Bouvet Island",
    currency_code: "NOK",
  },
  {
    name: "Brazil",
    currency_code: "BRL",
  },
  {
    name: "British Indian Ocean Territory",
    currency_code: "USD",
  },
  {
    name: "Brunei",
    currency_code: "BND",
  },
  {
    name: "Bulgaria",
    currency_code: "BGN",
  },
  {
    name: "Burkina Faso",
    currency_code: "XOF",
  },
  {
    name: "Burundi",
    currency_code: "BIF",
  },
  {
    name: "Cambodia",
    currency_code: "KHR",
  },
  {
    name: "Cameroon",
    currency_code: "XAF",
  },
  {
    name: "Canada",
    currency_code: "CAD",
  },
  {
    name: "Cape Verde",
    currency_code: "CVE",
  },
  {
    name: "Cayman Islands",
    currency_code: "KYD",
  },
  {
    name: "Central African Republic",
    currency_code: "XAF",
  },
  {
    name: "Chad",
    currency_code: "XAF",
  },
  {
    name: "Chile",
    currency_code: "CLP",
  },
  {
    name: "China",
    currency_code: "CNY",
  },
  {
    name: "Christmas Island",
    currency_code: "AUD",
  },
  {
    name: "Cocos (Keeling) Islands",
    currency_code: "AUD",
  },
  {
    name: "Colombia",
    currency_code: "COP",
  },
  {
    name: "Comoros",
    currency_code: "KMF",
  },
  {
    name: "Congo",
    currency_code: "XAF",
  },
  {
    name: "Cook Islands",
    currency_code: "NZD",
  },
  {
    name: "Costa Rica",
    currency_code: "CRC",
  },
  {
    name: "Croatia",
    currency_code: "EUR",
  },
  {
    name: "Cuba",
    currency_code: "CUP",
  },
  {
    name: "Cyprus",
    currency_code: "EUR",
  },
  {
    name: "Czech Republic",
    currency_code: "CZK",
  },
  {
    name: "Denmark",
    currency_code: "DKK",
  },
  {
    name: "Djibouti",
    currency_code: "DJF",
  },
  {
    name: "Dominica",
    currency_code: "XCD",
  },
  {
    name: "Dominican Republic",
    currency_code: "DOP",
  },
  {
    name: "East Timor",
    currency_code: "USD",
  },
  {
    name: "Ecuador",
    currency_code: "ECS",
  },
  {
    name: "Egypt",
    currency_code: "EGP",
  },
  {
    name: "El Salvador",
    currency_code: "SVC",
  },
  {
    name: "England",
    currency_code: "GBP",
  },
  {
    name: "Equatorial Guinea",
    currency_code: "XAF",
  },
  {
    name: "Eritrea",
    currency_code: "ERN",
  },
  {
    name: "Estonia",
    currency_code: "EUR",
  },
  {
    name: "Ethiopia",
    currency_code: "ETB",
  },
  {
    name: "Falkland Islands",
    currency_code: "FKP",
  },
  {
    name: "Faroe Islands",
    currency_code: "DKK",
  },
  {
    name: "Fiji Islands",
    currency_code: "FJD",
  },
  {
    name: "Finland",
    currency_code: "EUR",
  },
  {
    name: "France",
    currency_code: "EUR",
  },
  {
    name: "French Guiana",
    currency_code: "EUR",
  },
  {
    name: "French Polynesia",
    currency_code: "XPF",
  },
  {
    name: "French Southern territories",
    currency_code: "EUR",
  },
  {
    name: "Gabon",
    currency_code: "XAF",
  },
  {
    name: "Gambia",
    currency_code: "GMD",
  },
  {
    name: "Georgia",
    currency_code: "GEL",
  },
  {
    name: "Germany",
    currency_code: "EUR",
  },
  {
    name: "Ghana",
    currency_code: "GHS",
  },
  {
    name: "Gibraltar",
    currency_code: "GIP",
  },
  {
    name: "Greece",
    currency_code: "EUR",
  },
  {
    name: "Greenland",
    currency_code: "DKK",
  },
  {
    name: "Grenada",
    currency_code: "XCD",
  },
  {
    name: "Guadeloupe",
    currency_code: "EUR",
  },
  {
    name: "Guam",
    currency_code: "USD",
  },
  {
    name: "Guatemala",
    currency_code: "QTQ",
  },
  {
    name: "Guinea",
    currency_code: "GNF",
  },
  {
    name: "Guinea-Bissau",
    currency_code: "CFA",
  },
  {
    name: "Guyana",
    currency_code: "GYD",
  },
  {
    name: "Haiti",
    currency_code: "HTG",
  },
  {
    name: "Heard Island and McDonald Islands",
    currency_code: "AUD",
  },
  {
    name: "Holy See (Vatican City State)",
    currency_code: "EUR",
  },
  {
    name: "Honduras",
    currency_code: "HNL",
  },
  {
    name: "Hong Kong",
    currency_code: "HKD",
  },
  {
    name: "Hungary",
    currency_code: "HUF",
  },
  {
    name: "Iceland",
    currency_code: "ISK",
  },
  {
    name: "India",
    currency_code: "INR",
  },
  {
    name: "Indonesia",
    currency_code: "IDR",
  },
  {
    name: "Iran",
    currency_code: "IRR",
  },
  {
    name: "Iraq",
    currency_code: "IQD",
  },
  {
    name: "Ireland",
    currency_code: "EUR",
  },
  {
    name: "Israel",
    currency_code: "ILS",
  },
  {
    name: "Italy",
    currency_code: "EUR",
  },
  {
    name: "Ivory Coast",
    currency_code: "XOF",
  },
  {
    name: "Jamaica",
    currency_code: "JMD",
  },
  {
    name: "Japan",
    currency_code: "JPY",
  },
  {
    name: "Jordan",
    currency_code: "JOD",
  },
  {
    name: "Kazakhstan",
    currency_code: "KZT",
  },
  {
    name: "Kenya",
    currency_code: "KES",
  },
  {
    name: "Kiribati",
    currency_code: "AUD",
  },
  {
    name: "Kuwait",
    currency_code: "KWD",
  },
  {
    name: "Kyrgyzstan",
    currency_code: "KGS",
  },
  {
    name: "Laos",
    currency_code: "LAK",
  },
  {
    name: "Latvia",
    currency_code: "EUR",
  },
  {
    name: "Lebanon",
    currency_code: "LBP",
  },
  {
    name: "Lesotho",
    currency_code: "LSL",
  },
  {
    name: "Liberia",
    currency_code: "LRD",
  },
  {
    name: "Libyan Arab Jamahiriya",
    currency_code: "LYD",
  },
  {
    name: "Liechtenstein",
    currency_code: "CHF",
  },
  {
    name: "Lithuania",
    currency_code: "EUR",
  },
  {
    name: "Luxembourg",
    currency_code: "EUR",
  },
  {
    name: "Macau",
    currency_code: "MOP",
  },
  {
    name: "North Macedonia",
    currency_code: "MKD",
  },
  {
    name: "Madagascar",
    currency_code: "MGF",
  },
  {
    name: "Malawi",
    currency_code: "MWK",
  },
  {
    name: "Malaysia",
    currency_code: "MYR",
  },
  {
    name: "Maldives",
    currency_code: "MVR",
  },
  {
    name: "Mali",
    currency_code: "XOF",
  },
  {
    name: "Malta",
    currency_code: "EUR",
  },
  {
    name: "Marshall Islands",
    currency_code: "USD",
  },
  {
    name: "Martinique",
    currency_code: "EUR",
  },
  {
    name: "Mauritania",
    currency_code: "MRO",
  },
  {
    name: "Mauritius",
    currency_code: "MUR",
  },
  {
    name: "Mayotte",
    currency_code: "EUR",
  },
  {
    name: "Mexico",
    currency_code: "MXN",
  },
  {
    name: "Micronesia, Federated States of",
    currency_code: "USD",
  },
  {
    name: "Moldova",
    currency_code: "MDL",
  },
  {
    name: "Monaco",
    currency_code: "EUR",
  },
  {
    name: "Mongolia",
    currency_code: "MNT",
  },
  {
    name: "Montserrat",
    currency_code: "XCD",
  },
  {
    name: "Morocco",
    currency_code: "MAD",
  },
  {
    name: "Mozambique",
    currency_code: "MZN",
  },
  {
    name: "Myanmar",
    currency_code: "MMR",
  },
  {
    name: "Namibia",
    currency_code: "NAD",
  },
  {
    name: "Nauru",
    currency_code: "AUD",
  },
  {
    name: "Nepal",
    currency_code: "NPR",
  },
  {
    name: "Netherlands",
    currency_code: "EUR",
  },
  {
    name: "Netherlands Antilles",
    currency_code: "ANG",
  },
  {
    name: "New Caledonia",
    currency_code: "XPF",
  },
  {
    name: "New Zealand",
    currency_code: "NZD",
  },
  {
    name: "Nicaragua",
    currency_code: "NIO",
  },
  {
    name: "Niger",
    currency_code: "XOF",
  },
  {
    name: "Nigeria",
    currency_code: "NGN",
  },
  {
    name: "Niue",
    currency_code: "NZD",
  },
  {
    name: "Norfolk Island",
    currency_code: "AUD",
  },
  {
    name: "North Korea",
    currency_code: "KPW",
  },
  {
    name: "Northern Ireland",
    currency_code: "GBP",
  },
  {
    name: "Northern Mariana Islands",
    currency_code: "USD",
  },
  {
    name: "Norway",
    currency_code: "NOK",
  },
  {
    name: "Oman",
    currency_code: "OMR",
  },
  {
    name: "Pakistan",
    currency_code: "PKR",
  },
  {
    name: "Palau",
    currency_code: "USD",
  },
  {
    name: "Palestine",
    currency_code: null,
  },
  {
    name: "Panama",
    currency_code: "PAB",
  },
  {
    name: "Papua New Guinea",
    currency_code: "PGK",
  },
  {
    name: "Paraguay",
    currency_code: "PYG",
  },
  {
    name: "Peru",
    currency_code: "PEN",
  },
  {
    name: "Philippines",
    currency_code: "PHP",
  },
  {
    name: "Pitcairn Islands",
    currency_code: "NZD",
  },
  {
    name: "Poland",
    currency_code: "PLN",
  },
  {
    name: "Portugal",
    currency_code: "EUR",
  },
  {
    name: "Puerto Rico",
    currency_code: "USD",
  },
  {
    name: "Qatar",
    currency_code: "QAR",
  },
  {
    name: "Reunion",
    currency_code: "EUR",
  },
  {
    name: "Romania",
    currency_code: "RON",
  },
  {
    name: "Russian Federation",
    currency_code: "RUB",
  },
  {
    name: "Rwanda",
    currency_code: "RWF",
  },
  {
    name: "Saint Helena",
    currency_code: "SHP",
  },
  {
    name: "Saint Kitts and Nevis",
    currency_code: "XCD",
  },
  {
    name: "Saint Lucia",
    currency_code: "XCD",
  },
  {
    name: "Saint Pierre and Miquelon",
    currency_code: "EUR",
  },
  {
    name: "Saint Vincent and the Grenadines",
    currency_code: "XCD",
  },
  {
    name: "Samoa",
    currency_code: "WST",
  },
  {
    name: "San Marino",
    currency_code: "EUR",
  },
  {
    name: "Sao Tome and Principe",
    currency_code: "STD",
  },
  {
    name: "Saudi Arabia",
    currency_code: "SAR",
  },
  {
    name: "Scotland",
    currency_code: "GBP",
  },
  {
    name: "Senegal",
    currency_code: "XOF",
  },
  {
    name: "Serbia",
    currency_code: "RSD",
  },
  {
    name: "Seychelles",
    currency_code: "SCR",
  },
  {
    name: "Sierra Leone",
    currency_code: "SLL",
  },
  {
    name: "Singapore",
    currency_code: "SGD",
  },
  {
    name: "Slovakia",
    currency_code: "EUR",
  },
  {
    name: "Slovenia",
    currency_code: "EUR",
  },
  {
    name: "Solomon Islands",
    currency_code: "SBD",
  },
  {
    name: "Somalia",
    currency_code: "SOS",
  },
  {
    name: "South Africa",
    currency_code: "ZAR",
  },
  {
    name: "South Georgia and the South Sandwich Islands",
    currency_code: "GBP",
  },
  {
    name: "South Korea",
    currency_code: "KRW",
  },
  {
    name: "South Sudan",
    currency_code: "SSP",
  },
  {
    name: "Spain",
    currency_code: "EUR",
  },
  {
    name: "Sri Lanka",
    currency_code: "LKR",
  },
  {
    name: "Sudan",
    currency_code: "SDG",
  },
  {
    name: "Suriname",
    currency_code: "SRD",
  },
  {
    name: "Svalbard and Jan Mayen",
    currency_code: "NOK",
  },
  {
    name: "Swaziland",
    currency_code: "SZL",
  },
  {
    name: "Sweden",
    currency_code: "SEK",
  },
  {
    name: "Switzerland",
    currency_code: "CHF",
  },
  {
    name: "Syria",
    currency_code: "SYP",
  },
  {
    name: "Tajikistan",
    currency_code: "TJS",
  },
  {
    name: "Tanzania",
    currency_code: "TZS",
  },
  {
    name: "Thailand",
    currency_code: "THB",
  },
  {
    name: "The Democratic Republic of Congo",
    currency_code: "CDF",
  },
  {
    name: "Togo",
    currency_code: "XOF",
  },
  {
    name: "Tokelau",
    currency_code: "NZD",
  },
  {
    name: "Tonga",
    currency_code: "TOP",
  },
  {
    name: "Trinidad and Tobago",
    currency_code: "TTD",
  },
  {
    name: "Tunisia",
    currency_code: "TND",
  },
  {
    name: "Turkey",
    currency_code: "TRY",
  },
  {
    name: "Turkmenistan",
    currency_code: "TMT",
  },
  {
    name: "Turks and Caicos Islands",
    currency_code: "USD",
  },
  {
    name: "Tuvalu",
    currency_code: "AUD",
  },
  {
    name: "Uganda",
    currency_code: "UGX",
  },
  {
    name: "Ukraine",
    currency_code: "UAH",
  },
  {
    name: "United Arab Emirates",
    currency_code: "AED",
  },
  {
    name: "United Kingdom",
    currency_code: "GBP",
  },
  {
    name: "United States",
    currency_code: "USD",
  },
  {
    name: "United States Minor Outlying Islands",
    currency_code: "USD",
  },
  {
    name: "Uruguay",
    currency_code: "UYU",
  },
  {
    name: "Uzbekistan",
    currency_code: "UZS",
  },
  {
    name: "Vanuatu",
    currency_code: "VUV",
  },
  {
    name: "Venezuela",
    currency_code: "VEF",
  },
  {
    name: "Vietnam",
    currency_code: "VND",
  },
  {
    name: "Virgin Islands, British",
    currency_code: "USD",
  },
  {
    name: "Virgin Islands, U.S.",
    currency_code: "USD",
  },
  {
    name: "Wales",
    currency_code: "GBP",
  },
  {
    name: "Wallis and Futuna",
    currency_code: "XPF",
  },
  {
    name: "Western Sahara",
    currency_code: "MAD",
  },
  {
    name: "Yemen",
    currency_code: "YER",
  },
  {
    name: "Zambia",
    currency_code: "ZMW",
  },
  {
    name: "Zimbabwe",
    currency_code: "ZWD",
  },
];

const getCountryByCurrency = (currency_code: string) => {
  return countries.find((c) => c.currency_code === currency_code);
};

const getCurrencyByCountry = (country_name: string) => {
  return countries.find((c) => c.name === country_name);
};

export { countries, getCountryByCurrency, getCurrencyByCountry };
