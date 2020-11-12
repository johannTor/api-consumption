# js-api consumption

Live version: http://dynamic-music.surge.sh/

In this assignment we focused on learning about interacting with APIs available in the world.

In my little project I decided to work with the Rick and Morty API - https://rickandmortyapi.com/documentation - that I spotted in a list of public APIs - https://github.com/public-apis/public-apis - and made an app that listed all of the episodes available with the option to see more details about each one.

I worked with 2 of the APIs endpoints:
https://rickandmortyapi.com/api/episode/
https://rickandmortyapi.com/api/character/

When the app starts it makes a fetch call to the episode endpoint of the API and recieves all the episodes in the JSON format. The first problem I encountered was that the API would 'paginate' the responses so I only recieved the first 20 episodes from the fetch call. I didn't spot any way of increasing that number but I saw that the response had an 'info' object with a 'next' property that linked to another episode endpoint with the subsequent episodes. So I just start by fetching the first page and in a loop I check if the data has a next link, if it does not then we won´t try to fetch another page.

When an episode is clicked we access the episode object from an episode array we created from the previous fetch calls and generate a little info box (granted, not a lot of info to be displayed). Each episode has a character array for each character that's present in the episode, so I ended up using that to display them in a grid. Each item in that array has the character endpoint of the API as a value so I started out just looping through each character and make seperate fetch calls for each one. It turned out that took quite a bit of time, sometimes more than 3 seconds and that's when we saw the option of accessing multiple characters with one call like - https://rickandmortyapi.com/api/character/1,183 - where you'd append the character id at the end of the URL. Unfortunatly, since the characters were being stored as URLs in the array I didn't spot any way to get their ids directly, so I ended up just grabbing the last part of their url and creating an ID array using the map() method. Finally when all the ids were acquired, the .join() method came in handy to append the id's in the fetch call.

The fetch calls take some time to process and that's where the async and await keywords show their power. It's a topic that deserves it's own focus but in this project I created a few asynchronous functions. For example when the app starts up, we want to display all the episodes but we can't do that unless we use the await keyword before the async function. That makes sure the episode data is recieved before trying to display them.

In the end I added a function that generates buttons that you can filter the episode list by seasons. They are dynamically created from the episode list data so it should work if there are more seasons added. Again I only had a string to work with in the form 'S02E01' so there was some extra string manipulation involved with that.