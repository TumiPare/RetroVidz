document.getElementById('videoQualitySelector').addEventListener("click", function() {


    const m3u8Url = document.getElementById('fileUrl').value;

    const select = this;

    // Remove all options
    while (select.firstChild) {
        select.removeChild(select.firstChild);
    }

    const downloadOption = document.createElement("option");
    downloadOption.text = "Download";
    this.add(downloadOption);

    console.log(m3u8Url);
    // Fetch the m3u8 file content
    fetch(m3u8Url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch m3u8 file: ${response.statusText}`);
            }
            return response.text();
        })
        .then(m3u8Content => {

            // Parse the m3u8 link and extract video qualities
            const regex = /#EXT-X-STREAM-INF:.*?RESOLUTION=([0-9x]+).*?\n([^#\n]+)/g;
            let match;
            const videoQualities = [];
            const videoLinks = [];

            while ((match = regex.exec(m3u8Content)) !== null) {
                const quality = match[1];
                const link = match[2];
                videoQualities.push(quality);
                videoLinks.push(link);
            }

            // Create options for the dropdown
            const dropdown = document.getElementById("videoQualitySelector");

            videoQualities.forEach((quality, index) => {
                const option = document.createElement("option");
                option.value = index;
                option.text = quality;
                dropdown.add(option);
            });

            // Event listener for the dropdown change
            dropdown.addEventListener("change", function() {
                let fullUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1) + videoLinks[this.value];
                MyLibrary.downloadAndMerge(fullUrl, 'progress');
            });
        })
        .catch(error => {
            console.error("Error fetching m3u8 file:", error.message);
        });
});