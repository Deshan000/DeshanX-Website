const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const parsedUrl = decodeURIComponent(req.url.split('?')[0]);

  // API endpoint to return exact list of frame images
  if (parsedUrl === '/api/frames') {
    let imgDirName = 'images';
    let dirPath = path.join(__dirname, imgDirName);

    if (!fs.existsSync(dirPath) || fs.readdirSync(dirPath).length === 0) {
      if (fs.existsSync(path.join(__dirname, 'Images'))) {
        imgDirName = 'Images';
        dirPath = path.join(__dirname, imgDirName);
      }
    }

    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        .map(f => `./${imgDirName}/${f}`);

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(JSON.stringify(files));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify([]));
    }
  }

  let reqPath = parsedUrl === '/' ? '/index.html' : parsedUrl;
  let filePath = path.join(__dirname, reqPath);

  // Case insensitive fallback for Images / images folder
  if (!fs.existsSync(filePath)) {
    if (reqPath.toLowerCase().startsWith('/images/')) {
      const subPath = reqPath.slice(8);
      const alt1 = path.join(__dirname, 'images', subPath);
      const alt2 = path.join(__dirname, 'Images', subPath);
      if (fs.existsSync(alt1)) filePath = alt1;
      else if (fs.existsSync(alt2)) filePath = alt2;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext.match(/\.(jpg|jpeg|png|webp)$/i) ? 'public, max-age=86400' : 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
