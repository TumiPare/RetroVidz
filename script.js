var form = document.getElementById('urlForm');
const teresa = new Teresa();
form.addEventListener('submit', async function(event) {
    showLoading();
    jwplayer('video-container').stop();
    document.getElementById("video-container").style.display = "none";
    event.preventDefault();
    var query = document.getElementById('fileUrl').value;
    results = await teresa.search(query);

    var container = document.getElementById("show-list");
    
    document.getElementById("container").textContent = ""
    var list = document.createElement("ul");
    for (var i = 0; i < results.length; i++) {
        var link = document.createElement("li");
        link.link = results[i].href;
        link.textContent = results[i].title;
        link.addEventListener("click", function (event) {
            showLoading();
            container.textContent = "";
            event.preventDefault();
            handleLinkClick(this.link);
            hideLoading();
        });
        list.appendChild(link);
    }
    container.appendChild(list);
    hideLoading();
});



// Function to handle the link click
async function handleLinkClick(href) {
    console.log("Link clicked! Href: " + href);
    const show_url = teresa.site + href.replace('/drama', '/watch') + "/watching.html";
    const ep_range = (await teresa.get_ep_range(show_url)).split("-");

    var container = document.getElementById("container");
    container.textContent = ""
    var list = document.createElement("ul");
    for (var i = ep_range[0]; i <= ep_range[1]; i++) {
        var link = document.createElement("li");
        link.ep = i;
        link.textContent = i;
        link.addEventListener("click",  async function (event) {
            jwplayer('video-container').stop();
            document.getElementById("video-container").style.display = "none";
            showLoading();
            ep_link = await teresa.getLink(show_url + "?ep=" + this.ep);
            event.preventDefault();
            console.log("Opening video: " + ep_link)
            openVideo(ep_link);
            hideLoading();
        });
        list.appendChild(link);
    }
    container.appendChild(list);
}


 function openVideo(url) {
    document.getElementById("video-container").style.display = "block";
    const player = jwplayer('video-container').setup({
        controls: true,
        displayPlaybackLabel: true,
        abouttext: 'Download', // Text for the download link
        aboutlink: url, 
        file: url
    });
}

function showLoading() {
    document.getElementById("loading-circle").style.display = "block";
  }

// Function to turn off the loading circle
function hideLoading() {
    document.getElementById("loading-circle").style.display = "none";
}





// document.getElementById('videoQualitySelector').addEventListener("click", function() {


//     const m3u8Url = document.getElementById('fileUrl').value;

//     const select = this;

//     // Remove all options
//     while (select.firstChild) {
//         select.removeChild(select.firstChild);
//     }

//     const downloadOption = document.createElement("option");
//     downloadOption.text = "Download";
//     this.add(downloadOption);

//     console.log(m3u8Url);
//     // Fetch the m3u8 file content
//     fetch(m3u8Url)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`Failed to fetch m3u8 file: ${response.statusText}`);
//             }
//             return response.text();
//         })
//         .then(m3u8Content => {

//             // Parse the m3u8 link and extract video qualities
//             const regex = /#EXT-X-STREAM-INF:.*?RESOLUTION=([0-9x]+).*?\n([^#\n]+)/g;
//             let match;
//             const videoQualities = [];
//             const videoLinks = [];

//             while ((match = regex.exec(m3u8Content)) !== null) {
//                 const quality = match[1];
//                 const link = match[2];
//                 videoQualities.push(quality);
//                 videoLinks.push(link);
//             }

//             // Create options for the dropdown
//             const dropdown = document.getElementById("videoQualitySelector");

//             videoQualities.forEach((quality, index) => {
//                 const option = document.createElement("option");
//                 option.value = index;
//                 option.text = quality;
//                 dropdown.add(option);
//             });

//             // Event listener for the dropdown change
//             dropdown.addEventListener("change", function() {
//                 let fullUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1) + videoLinks[this.value];
//                 MyLibrary.downloadAndMerge(fullUrl, 'progress');
//             });
//         })
//         .catch(error => {
//             console.error("Error fetching m3u8 file:", error.message);
//         });
// });