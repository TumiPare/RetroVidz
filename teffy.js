import https from 'https';
import pMap from 'p-map';

export async function downloadAndMerge(m3u8_ur, elementId) {

  let totalSize = 0;
  let downloaded = 0;
  const MAX_TIMEOUT = 10 * 1000; // 30 seconds 
  const element = document.getElementById(elementId)

  function getFiles(m3u8_url, folder) {
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

  function updateProgress(size) {
    downloaded += size;
    const percentage = Math.floor((downloaded / totalSize) * 100);
    
    if (element) {
      // Update the DOM element to show the progress
      element.innerText = `Getting your file ready: ${downloaded}/${totalSize} (${percentage}%)`;
    }
    else {
      console.log(`Downloaded ${downloaded}/${totalSize} (${percentage}%)`);
    }
    
  }

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

  async function laod(m3u8_url) {
    const urls = await getFiles(m3u8_url, m3u8_url.substring(0, m3u8_url.lastIndexOf('/') + 1));
    totalSize = urls.length;

    const contents = [];
    // sequentially download the files 
    for (const url of urls) {
        const result = await downloadTs(url);
        if (typeof result === 'string') {
            console.log(`Failed to download ${url}`);
        } else {
            contents.push(result);
        }
    }

    // // parallel/concurrent download the files
    // await pMap(urls, async (url, index) => {
    //   try {
    //     const result = await downloadTs(url);
    //     contents[index] = result;
    //   } catch (error) {
    //     console.log(`Error: ${error}`)
    //     contents[index] = null;
    //   }
    // }, { concurrency: 5 });
    const mergedBuffer = Buffer.concat(contents);
    const blob = new Blob([mergedBuffer], { type: 'application/octet-stream' });
    return blob;
  }


  function download(blob){
    
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'drama.ts';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  laod (m3u8_ur).then((blob) => {
    download(blob);
    console.log('Done');
  }).catch(err => {
    console.error(err);
  });
  
}
