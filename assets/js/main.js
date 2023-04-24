const section = document.querySelector('.side-right-content');
const section2 = document.querySelector('.side-right-content2');
// Add an event listener for scrolling
window.addEventListener('scroll', function () {
    // Check the scroll position
    const scrollPosition = window.scrollY;

    // Define the threshold for changing the CSS
    const threshold = 200;

    // If the scroll position is greater than the threshold, change the CSS
    if (scrollPosition > threshold) {
        section.style.top = '5%'; 
        section2.style.top = '50%'; 
    } else {
        section.style.top = '10%';  
        section2.style.top = '55%';
    }
});


// Function to open a tab
function openTab(tabIndex) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.style.display = 'none';
    });
  
    // Show the selected tab
    const selectedTab = document.getElementById(`tab${tabIndex + 1}`);
    selectedTab.style.display = 'block';
  
    // Update active tab button
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(tabButton => {
      tabButton.classList.remove('active');
    });
    tabButtons[tabIndex].classList.add('active');
  }
  

  document.getElementById('openBtn').addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'flex';
});

document.getElementById('closeBtn').addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'none';
});


// swiper cards
var swiper = new Swiper(".mySwiper", {
    slidesPerView: 3.5,
    spaceBetween: 10,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      640: {
        slidesPerView: 1.5,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2.5,
        spaceBetween: 40,
      },
      1024: {
        slidesPerView: 3.5,
        spaceBetween: 50,
      },
    },
  });
// heat map

// json file providing a geometry for each country, differentiated by numerical ID
const urlJSON = 'https://unpkg.com/world-atlas@1.1.4/world/50m.json';
// tsv file providing general information for the different countries of the world
const urlTSV = 'https://unpkg.com/world-atlas@1.1.4/world/50m.tsv';

// array describing the countries which can be selected
// picked from the Formula 1 calendar in 2019
const stages = [
  'monaco',
  'canada',
  'france',
  'austria',
  'singapore', 
  'oman',
  'australia',
  'qatar',
  'china',
  'azerbaijan',
  'spain',
];
const stages2 = [
    'russia',
    'japan',
    'mexico',
    'united states',
    'brazil',
    'united arab emirates',
  ];
const stages3 = [
    'united kingdom',
    'germany',
    'hungary',
    'belgium',
    'italy',
  ];
// variable desribing the current selection
let selection = stages[0];
let selection2 = stages2[0];
let selection3 = stages3[0];

// add an svg element in which to plot the world map
const width = 500;
const height = 250;

const world = d3
  .select('.world')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`);

// function called when the buttons are clicked
function updateSelection(direction) {
  // find the index of the current selection
  const index = stages.findIndex(stage => stage === selection);
  const index2 = stages2.findIndex(stage2 => stage2 === selection2);
  const index3 = stages3.findIndex(stage3 => stage3 === selection3);

  // according to the direction update the selection
  if(direction === 'prev') {
    selection = (index === 0) ? stages[stages.length - 1] : stages[index - 1];
    selection2 = (index2 === 0) ? stages2[stages2.length - 1] : stages2[index2 - 1];
    selection3 = (index3 === 0) ? stages3[stages3.length - 1] : stages3[index3 - 1];

  } else {
    selection  = (index === stages.length - 1) ? stages[0] : stages[index + 1];
    selection2  = (index2 === stages2.length - 1) ? stages2[0] : stages2[index2 + 1];
    selection3  = (index3 === stages3.length - 1) ? stages3[0] : stages3[index3 + 1];
}

  // according to the selection style the matching path and update the text
  d3
    .selectAll('path.stage')
    .attr('id', ({ name }) => name.toLowerCase() === selection ? 'selection' : null);

  d3
    .select('text')
    .text(selection);
}

// function adding countries through the d3.geo module
// called once the data from the url(s) is retrieved
// accepting as argument an object describing the features of the different countries
function addCountries(countries) {
  // projection used in the geoPath generator
  const projection = d3
    .geoEquirectangular()
    // use the size of the svg for the boundaries of the projection
    .fitSize([width, height], countries)
    // scale and translate the projection to focus on the world map sans antartica
    .scale([80])
    .translate([width / 2, height / 2 + 40]);

  // generator function to draw the countries
  const geoPath = d3
    .geoPath()
    .projection(projection);

  // add a text element in the very top of the svg
  // ! the translation included in the projection allows to include the element without risk of overlap
  world
    .append('text')
    .attr('x', width / 3)
    .attr('y', 30)
    .attr('text-anchor', 'middle')
  // immediately describe the first stage
    .text(selection);

  // for each feature of the countries object add a path element
  world
    .selectAll('path.country')
    .data(countries.features)
    .enter()
    .append('path')
    // add a class of stage for the countries listed in the stages array
    .attr('class', ({ name }) => {
        if (stages.includes(name.toLowerCase())) {
            return 'country stage';
        } else if (stages2.includes(name.toLowerCase())) {
            return 'country stage2';
        } else if (stages3.includes(name.toLowerCase())) {
            return 'country stage3';
        } else {
            return 'country';
        }
    })

    // add an identifier to the selection
    .attr('id', ({ name }) => ((selection === name.toLowerCase()) ? 'selection' : null))
    .attr('d', geoPath);

  // select the path elements with a class of .stage and listen for mouseevent on the specific elements
  d3
    .selectAll('path.stage')
    // on hover highlight the element with an identifier and include the name in the prescribed text element
    // ! update the selection variable
    // .on('mouseenter', function ({ name }) {
    //   d3
    //     .selectAll('path.stage')
    //     .attr('id', '');
    //   d3
    //     .select(this)
    //     .attr('id', 'selection');

    //   // include in the text element the name of the selected country
    //   d3
    //     .select('text')
    //     .text(name);

    //   selection = name.toLowerCase();
    // });

  // show the .controls container as the countries are successfully drawn
  d3
    .select('.controls')
    .style('visibility', 'visible')
    .style('opacity', 1);

  // attach event listeners on the buttons to change the selection
  d3
    .select('.controls .prev')
    .on('click', () => updateSelection('prev'));
    d3
    .select('.controls .next')
    .on('click', () => updateSelection('next'));

}

// retrieve the data from the json and tsv references
Promise
  .all([d3.json(urlJSON), d3.tsv(urlTSV)])
  .then(([json, tsv]) => {
    // convert topojson to json features
    const countries = topojson.feature(json, json.objects.countries);

    // add the name of the countries to the matching feature
    countries.features.forEach((feature) => {
      const { name } = tsv.find(({ iso_n3: id }) => id === feature.id);
      // fix a weird specific issue with australia
      // the iso_n3 value for the path seems to describe an australian island instead
      if (name.toLowerCase() === 'ashmore and cartier is.') {
        feature.name = 'australia';
      } else {
        feature.name = name;
      }
    });

    // call the function to draw path elements through the geo module
    addCountries(countries);
  })
  .catch(err => console.error(err));

//   customer review
// JavaScript can be used to fetch customer reviews from a database or an API and dynamically populate the review section with the retrieved data.
// For example, you can use the Fetch API or Axios to fetch reviews from a backend server.

// Sample code using Fetch API to fetch customer reviews

// Fetch reviews from the backend server
fetch('/api/reviews')
  .then(response => response.json())
  .then(reviews => {
    // Loop through the reviews and create review elements
    const reviewContainer = document.querySelector('.review-container');
    reviews.forEach(review => {
      const reviewElement = document.createElement('div');
      reviewElement.className = 'review';
      reviewElement.innerHTML = `
        <p class="review-text">${review.text}</p>
        <p class="review-author">- ${review.author}</p>
      `;
      reviewContainer.appendChild(reviewElement);
    });
  })
  .catch(error => {
    console.error('Error fetching reviews:', error);
  });
// real time series chart 
