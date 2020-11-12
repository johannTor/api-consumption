const gridElement = document.getElementById('episode-grid');
const infoElement = document.getElementById('episode-info');
const characterGrid = document.getElementById('character-grid');
const seasonButtons = document.getElementById('season-buttons');
let allEps = [];
let allSeasons = [];

// When the DOM content is loaded, fetch all the episodes and load them into the grid
document.addEventListener('DOMContentLoaded', async function() {
    allEps = await fetchAllEpisodes();
    fillEpisodeGrid(allEps);
    generateSeasonButtons(allEps);
})

// Gets all the episodes through the API
async function fetchAllEpisodes() {
    let counter = 0;
    let allEps = [];
    let data = await fetch('https://rickandmortyapi.com/api/episode/')
    .then(r => {
        // If the response ok is false then throw an error message
        if(!r.ok) {
            throw new Error('Network response was not ok');
        }
        return r.json()
    })
    .catch(error => console.error('There was a problem with your fetch operation: ' + error));
    // Create a list of all episodes
    allEps = [...allEps, ...data.results];

    // We know there are currently only 3 pages so the counter acts just as a backup stop
    while(counter < 5) {
        // If the data info's next field is null, we are on the last page so break out of the loop
        if(data.info.next === null) {
            break;
        }
        // Fetch the next page thats given in the data info
        data = await fetch(data.info.next)
        .then(r => {
            if(!r.ok) {
                throw new Error('Network response was not ok');
            }
            return r.json()
        })
        .catch(error => console.error('There was a problem with your fetch operation: ' + error));
        // Append the recently fetched data into our episode list
        allEps = [...allEps, ...data.results];
        counter++;
    }
    return allEps;
}

// Take in a list of episodes and display them in a grid
function fillEpisodeGrid(episodes) {
    gridElement.innerHTML = '';
    for(let i = 0; i < episodes.length; i++) {
        let newDiv = document.createElement('div');
        newDiv.innerHTML = `
        <h4>${episodes[i].name}</h4>
        <h5>(${episodes[i].episode})</h5>
        `;
        newDiv.setAttribute('data-id', episodes[i].id);
        newDiv.addEventListener('click', handleEpisodeClick);
        
        gridElement.appendChild(newDiv);
    }
}

// Go through the episode list and create an array of available seasons
function extractSeasons(episodes) {
    let seasonArray = [];
    // Inserting unique season numbers into an array
    for(let i = 0; i < episodes.length; i++) {
        // Slicing the second and third character from the episode string, '02', assuming there won't be more than 99 seasons...
        let seasonPart = parseInt(episodes[i].episode.slice(1, 3));
        if(!seasonArray.includes(seasonPart)) {
            seasonArray.push(seasonPart);
        }
    }
    return seasonArray;
}

// Function that creates the season buttons depending on how many seasons there are in the list.
// We know each episode has the 'episode' property in the form 'S02E08', so we just get the first 3 characters to detect what seasons are available.
function generateSeasonButtons(episodes) {
    allSeasons = extractSeasons(episodes);
    for(let i = 0; i < allSeasons.length; i++) {
        let seasonButton = document.createElement('button');
        seasonButton.innerHTML = `Season ${allSeasons[i]}`;
        const buttonData = (allSeasons[i] > 9) ? `S${allSeasons[i]}` : `S0${allSeasons[i]}`;
        seasonButton.setAttribute('data-season', buttonData);
        seasonButton.addEventListener('click', changeSeason);
        seasonButtons.appendChild(seasonButton);
    }
}

// When a season is chosen filter the episode array to match the season that's chosen
function changeSeason(ev) {
    clearDiv(gridElement);
    document.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('active-button');
    });
    // Slicing the first part of the episode code to compare it to the season that was clicked
    let filteredEpisodes = allEps.filter(ep => ep.episode.slice(0, 3) === ev.currentTarget.getAttribute('data-season'));
    ev.currentTarget.classList.add('active-button');
    fillEpisodeGrid(filteredEpisodes);
}

function clearDiv(parent) {
    while(parent.hasChildNodes()) {
        parent.removeChild(parent.firstChild);
    }
}

// If an episode is clicked, display it's info
function handleEpisodeClick(ev) {
    fillEpisodeInfo(parseInt(ev.currentTarget.getAttribute('data-id')));
}

// Search for the correct episode and if it's found clear the episode list
async function fillEpisodeInfo(epId) {
    const episode = getEpisode(epId);
    if(episode != null) {
        hideHeader1();
        hideSeasonBtns();
        clearDiv(gridElement);
        generateEpInfo(episode);
        await generateCharGrid(episode);
    } else {
        console.log('Episode not found');
    }
}

// If the given id is found in the episode list return that episode, otherwise return null
function getEpisode(id) {
    for(let i = 0; i < allEps.length; i++) {
        if(allEps[i].id === id) {
            return allEps[i];
        }
    }
    return null;
}

// Generate DOM elements around the episode info
function generateEpInfo(ep) {
    let epInfoDiv = document.createElement('div');
    let epTitle = document.createElement('h2');
    let epCode = document.createElement('p');
    let epDate = document.createElement('p');
    let backLink = document.createElement('a');

    epInfoDiv.classList.add('episode-info-container');
    epTitle.innerHTML = ep.name;
    epCode.innerHTML = ep.episode;
    epDate.innerHTML = 'Aired: ' + ep.air_date;
    backLink.innerHTML = 'Back to episode menu';
    backLink.href = '';
    backLink.addEventListener('click', backToMenu);

    epInfoDiv.appendChild(epTitle);
    epInfoDiv.appendChild(epCode);
    epInfoDiv.appendChild(epDate);
    epInfoDiv.appendChild(backLink);
    infoElement.appendChild(epInfoDiv);
}

// Generate DOM elements around each character present in the episode
async function generateCharGrid(ep) {
    let charGrid = document.createElement('div');
    charGrid.classList.add('character-grid');
    // Get all the character ID's which is the last part of every character url given in each episode object
    let charIds = ep.characters.map(link => {
        // Split the url at '/'
        let linkArray = link.split('/');
        // Acquire the last part of the url for use in the fetch link below
        let lastPart = linkArray[linkArray.length-1];
        return lastPart;
    });

    // Fetch every character that was in the episode by using the .join method at the end of the character endpoint.
    const data = await fetch(`https://rickandmortyapi.com/api/character/${charIds.join()}`)
    .then(r => {
        if(!r.ok) {
            throw new Error('Network response was not ok')
        }
        return r.json()
    })
    .catch(error => console.error('There was a problem with your fetch operation: ' + error));

    // Go through every character in the array and fetch the character data for each one... how to quicken?
    for(let i = 0; i < data.length; i++) {
        let charDiv = document.createElement('div');
        let charName = document.createElement('h4');
        let charImg = document.createElement('img');

        charName.innerHTML = data[i].name;
        charImg.src = data[i].image;

        charDiv.appendChild(charName);
        charDiv.appendChild(charImg);
        charGrid.appendChild(charDiv);
    }
    infoElement.appendChild(charGrid);
}

// Back to menu link clicked
function backToMenu(ev) {
    ev.preventDefault();
    showHeader1();
    showSeasonBtns();
    fillEpisodeGrid(allEps);
    clearDiv(infoElement);
}

function hideHeader1() {
    document.querySelector('h1').style.display = 'none';
}

function showHeader1() {
    document.querySelector('h1').style.display = 'block';
}

function hideSeasonBtns() {
    seasonButtons.style.display = 'none';
}

function showSeasonBtns() {
    seasonButtons.style.display = 'flex';
}