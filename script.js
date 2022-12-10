let btn = document.getElementById("query-submit-btn")
resultsContainer = document.getElementById("results-container")

btn.addEventListener("click", async (ev) => {
    ev.preventDefault()

    let rating = document.getElementById("ratings-selector").value
    let critics_pick = document.getElementById("c-p").value
    console.log(critics_pick)
    var child = resultsContainer.lastElementChild; 
    while (child) {
        resultsContainer.removeChild(child);
        child = resultsContainer.lastElementChild;
    }

    queryElem = document.getElementById("query-container")

    wordQuery = queryElem.value

    let url = `https://api.nytimes.com/svc/movies/v2/reviews/search.json?query=${wordQuery}&api-key=fjR7rGkHIdhkDARn9Wx4qnHRbmXdE9G7`

    queryResponse = await fetch(url)

    queryJSON = await queryResponse.json()

    if (queryJSON.num_results === 0) {
        console.log("No Results")
        noResults = document.createElement("p")
        noResults.innerText = "No Results"
        resultsContainer.appendChild(noResults)
        return
    }
    // check filter options

    // filter by mpaa rating
    var reviewJSON = queryJSON.results
    if (rating != "None") {
        console.log("Filtering ratings")
        reviewJSON = reviewJSON.filter((movieReview) => movieReview.mpaa_rating === rating)
    }

    // filter for critics picks
    if (critics_pick === "Y") {
        reviewJSON = reviewJSON.filter((movieReview) => movieReview.critics_pick === 1)
    } else if (critics_pick === "N") {
        reviewJSON = reviewJSON.filter((movieReview) => movieReview.critics_pick === 0)
    }

    console.log("Filtered Results:", reviewJSON)
    if (reviewJSON.length === 0) {
        console.log("No Results")
        noResults = document.createElement("p")
        noResults.innerText = "No Results"
        resultsContainer.appendChild(noResults)
        return
    }
    
    // second api to find specific movie info 
    reviewJSON.forEach( async element => {
        movieInfoJSON = await (await fetch(`http://www.omdbapi.com/?t=${element.display_title}&apikey=4dfe7790`)).json()
        console.log("Movie Info:", movieInfoJSON)
        contentElement = createInfo(movieInfoJSON, element)
        if (contentElement) {
            resultsContainer.appendChild(contentElement)
        }
    });
})

function createInfo(movieInfo, movieReview) {
    let div = document.createElement("div")
    let h2 = document.createElement("h2")
    let p = document.createElement("p")

    let movieReviewContent = movieReview.summary_short
    if (movieReviewContent === "") {
        // no review found so info not displayed
        return
    } else {
        p.innerText = "Review: " + movieReview.summary_short
    }
    h2.innerText = movieReview.display_title
    div.id = movieReview.display_title

    if (movieInfo.Response === "False") {
        let err_msg = document.createElement("p")
        err_msg.innerText = "No movie info found"
        div.appendChild(h2)
        div.appendChild(p)
        div.appendChild(err_msg)
        return div
    }
    
    
    let img = document.createElement("img")
    img.src = movieInfo.Poster

    let actors = document.createElement("p")
    actors.innerText = "Actors: " + movieInfo.Actors

    let releaseDate = document.createElement("p")
    releaseDate.innerText = "Release Date: " + movieInfo.Released

    div.appendChild(h2)
    div.appendChild(img)
    div.appendChild(releaseDate)
    div.appendChild(actors)
    div.appendChild(p)

    movieInfo.Ratings.forEach(rating => {
        let temp = document.createElement("p")
        temp.innerText = rating.Source + ": " + rating.Value
        div.appendChild(temp)
    })

    return div
}
