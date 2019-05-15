const Koa = require('koa');
const koaBody = require('koa-body')({multipart: true});
const app = new Koa();
const route = require('koa-route');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const args = process.argv.slice(2);
const rootDir = args[0];
const port = args[1];

const upload = route.post('/upload', async (ctx)=>{
  const file = ctx.request.files.uploadFile;
  const randFileName = Math.random().toString()+".png";
  const reader = fs.createReadStream(file.path);
  const stream = fs.createWriteStream(path.join(rootDir, randFileName));
  console.log(ctx.path);
  console.log(`file path: ${file.path}`);

  reader.pipe(stream);
  console.log('uploading %s -> %s', file.name, stream.path);

  ctx.status = 200;
  ctx.body = randFileName;
});

app.use(koaBody);
app.use(upload);
app.use(async (ctx, next) => {
    const elements = path.parse(ctx.path);
    // Returns:
    // { root: '/',
    //   dir: '/home/user/dir',
    //   base: 'file.txt',
    //   ext: '.txt',
    //   name: 'file' }
    console.log(ctx.path);
    if (elements.ext === '.png') {
        const splitted = elements.name.split('-')
        const originalFilename = `${rootDir}${elements.dir}${splitted[0]}.png`;
        const options = splitted.slice(1);
        console.log(originalFilename);
        try {
            fs.accessSync(originalFilename, fs.constants.R_OK);
            const widthDesc = options.filter(/./.test.bind(/^[0-9]+w$/));
            if (widthDesc.length > 2) {
                ctx.status = 400;
                ctx.body = 'You have to specify the width only once.';
            }
            const heightDesc = options.filter(/./.test.bind(/^[0-9]+h$/));
            if (heightDesc.length > 2) {
                ctx.status = 400;
                ctx.body = 'You have to specify the height only once.';
            }
            const width = widthDesc.length === 0 ? undefined : parseInt(widthDesc[0].slice(0, -1));
            const height = heightDesc.length === 0 ? undefined : parseInt(heightDesc[0].slice(0, -1));
            if (options.includes('cover')) {
                if (options.includes('contain')) {
                    ctx.status = 400;
                    ctx.body = 'You have to decide either contain mode or cover mode.';
                } else {
                    // cover mode
                    ctx.status = 200;
                    ctx.type = 'image/png';
                    ctx.body = await sharp(originalFilename)
                        .resize(width, height, { fit: 'cover' })
                        .png()
                        .toBuffer();
                }
            } else {
                // contain mode (even unless the mode is specified, because the contain mode is the default)
                ctx.status = 200;
                ctx.type = 'image/png';
                const backgroundColor = { r: 255, g: 255, b: 255, alpha: 0 }; // TEMPORARY. The method to change this param is not implemented yet.
                ctx.body = await sharp(originalFilename)
                    .resize(width, height, {
                        fit: 'contain',
                        background: { r: 255, g: 255, b: 255, alpha: 0 }
                    })
                    .png()
                    .toBuffer();
            }
        } catch (err) {
            ctx.status = 400;
            ctx.body = "No such file.";
        }
    } else {
        ctx.status = 400;
        ctx.body = 'Currently only .png is supported.';
    }
});

app.listen(port);
