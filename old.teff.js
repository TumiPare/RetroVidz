import https from 'https';
import fs from 'fs';
import pMap from 'p-map';
// const pMap = require('p-map');


// const m3u8_url = "https://videos-cloudfront-usp.jwpsrv.com/658a47fb_42f5dfa5fe579ddd053852c0e4e10cfe4b102b9f/site/LOPLPiDX/media/yp34SRmf/version/IFBsp7yL/manifest.ism/manifest-audio_eng=112000-video_eng=4714328.m3u8"
// const folder = "https://videos-cloudfront-usp.jwpsrv.com/658a47fb_42f5dfa5fe579ddd053852c0e4e10cfe4b102b9f/site/LOPLPiDX/media/yp34SRmf/version/IFBsp7yL/manifest.ism/"

const m3u8_url = 'https://hls018.searchmovieapi.com/streamhls2024/7465d0d8c91c0cb97fd282899db9b3df/ep.1.v0.1678009076.1080.m3u8';
const folder = 'https://hls018.searchmovieapi.com/streamhls2024/7465d0d8c91c0cb97fd282899db9b3df/';

const mergedFile = 'merged.ts';

function getFiles() {
  return new Promise((resolve, reject) => {
    https.get(m3u8_url, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        const lines = data.split('\n');
        const tsFiles = lines.filter(line => line.endsWith('.ts')).map(line => `${folder}${line.trim()}`);
        resolve(tsFiles);
      });

    }).on('error', err => {
      reject(err);
    });
  });
}

let totalSize = 0;
let downloaded = 0;

function updateProgress(size) {
  downloaded += size;
  const percentage = Math.floor((downloaded / totalSize) * 100);
  // Carriage return puts cursor back at line start
  process.stdout.write(`Downloaded ${downloaded}/${totalSize} (${percentage}%) \r`);
}

const MAX_TIMEOUT = 10 * 1000; // 30 seconds 

async function downloadTs(url) {
  return new Promise(async (resolve, reject) => {
      try {
          const res = await new Promise((res, rej) => {
              https.get(url, res => {
                  let data = [];

                  res.on('data', chunk => {
                      data.push(chunk);
                  });

                  res.on('end', () => {
                      updateProgress(1);
                      resolve(Buffer.concat(data));
                  });

              }).on('error', err => {
                  console.error(`Error fetching ${url}: ${err}`);
                  reject(err);
              });
          });

          const len = res.headers['content-length'];
          const timeout = Math.min(len ? len : MAX_TIMEOUT);
          res.setTimeout(timeout);

          // Download file...

      } catch (err) {
          console.log(`Retry ${url}`);
          resolve(url); // Add the URL to the list of failed URLs
      }
  });
}

async function main() {
    const urls = await getFiles();
    totalSize = urls.length;

    const contents = new Array(totalSize);


    await pMap(urls, async (url, index) => {
      try {
        const result = await downloadTs(url);
        contents[index] = result;
      } catch (error) {
        console.log(`Error: ${error}`)
        contents[index] = null;
      }
    }, { concurrency: 50 });

    fs.writeFileSync(mergedFile, Buffer.concat(contents));
}


const start = Date.now();
main().then(() => {
  const end = Date.now();
  console.log(`Execution time: ${(end - start) / 1000} seconds`);
});





// async function downloadAll(urls) {
//   return Promise.all(urls.map(url => downloadFile(url))); 
// }

// async function main() {
//   const urls = await getFiles();
//   totalSize = urls.length;
//   const contents = await downloadAll(urls);

//   fs.writeFileSync(mergedFile, Buffer.concat(contents));
// }

// main();