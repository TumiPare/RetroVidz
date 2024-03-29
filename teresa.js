class Teresa {
    constructor() {
        this.site = "https://viewasian.co";
        this.session = new XMLHttpRequest();
        this.a_tags = null;
    }

    async cli() {
        const search_query = prompt("Search Kdrama:");
        await this.search(search_query);

        for (let index = 0; index < this.a_tags.length; index++) {
            console.log(`[${index}] ${this.a_tags[index].title}`);
        }

        const showIndex = prompt("Choose a show:");
        const show_url = this.site + this.a_tags[parseInt(showIndex)].href.replace('/drama', '/watch') + "/watching.html";
        const ep_range = await this.get_ep_range(show_url);
        const episode = prompt(`Choose an episode[${ep_range}]:`);

        const m3u8_url = await this.getLink(show_url + "?ep=" + episode);
    }

    async get_ep_range(show_url) {
        const response = await fetch(show_url);
        const content = await response.text();
        const soup = new DOMParser().parseFromString(content, 'text/html');
        const items = soup.querySelectorAll('.ep-item');
        const last = items[0].id;
        const first = items[items.length - 1].id;
        return `${first}-${last}`;
    }

    async search(query) {
        const search_url = `https://viewasian.co/movie/search/${query.replaceAll(" ", "-")}`;
        const response = await fetch(search_url);
        const content = await response.text();
        const soup = new DOMParser().parseFromString(content, 'text/html');
        const moviesList = soup.querySelector('.movies-list');

        if (!moviesList) {
            console.log("No results found");
            return;
        }

        this.a_tags = moviesList.querySelectorAll("a.ml-mask.jt");
        let bobby = [];
        this.a_tags.forEach(tag => {
            const originalUrl = tag.href;
            const baseUrlToRemove = location.protocol + "//" + tag.host;
            let modifiedUrl = originalUrl.replace(baseUrlToRemove, '');
            modifiedUrl = "/" + modifiedUrl ;
            bobby.push({
                "href": modifiedUrl,
                "title": tag.title
            });
        });
        this.a_tags = bobby;
        return bobby;

    }

    async getLink(url) {
        const response = await fetch(url);
        const html = await response.text();

        const iframeUrl = 'https://corsproxy.io/?'+"https:" + new DOMParser().parseFromString(html, "text/html").querySelector('#media-player iframe').getAttribute('src');
        const iframeResponse = await fetch(iframeUrl);
        const iframeContent = await iframeResponse.text();

        let cryptoScriptData = new DOMParser().parseFromString(iframeContent, "text/html").querySelector("script[data-name='crypto']").getAttribute('data-value');

        const e = "93422192433952489752342908585752";
        const i = "9262859232435825";

        var decryptedValue = CryptoJS.AES.decrypt(cryptoScriptData, CryptoJS.enc.Utf8.parse(e), {
            iv: CryptoJS.enc.Utf8.parse(i)
        });
        var _0x422410 = CryptoJS.enc.Utf8.stringify(decryptedValue);
        var _0x1e4269 = _0x422410.substr(0, _0x422410.indexOf("&"));
        
        // Encrypting _0x1e4269 using AES encryption
        const encryptedId = CryptoJS.AES.encrypt(_0x1e4269, CryptoJS.enc.Utf8.parse(e), {
            iv: CryptoJS.enc.Utf8.parse(i)
        }).toString();

        // Constructing the URL for the AJAX request
        const ajaxUrl = "https://draplay2.pro/encrypt-ajax.php?id=" + encryptedId + _0x422410.substr(_0x422410.indexOf("&")) + "&alias=" + _0x1e4269;

        // Making an AJAX request using fetch
        let ajax_content = await fetch(ajaxUrl);
        let ajax_json = await ajax_content.json();
        let data = ajax_json.data;

        const decryptedData = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(e), {
            iv: CryptoJS.enc.Utf8.parse(i)
        })));

        // Logging the decrypted source
        return decryptedData.source[0].file;     
    }

    stream(link) {
        window.location.href = link;
    }

    async download(link) {
        // Implement your download logic here
        console.log(`Downloading: ${link}`);
    }
}