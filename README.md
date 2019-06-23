# img.hideo54.com

hideo54's ultra-nice image uploading/downloading server!

## Startup

1. `npm i`
1. `cp sample.env .env` and edit `.env`
1. `node server.js`

## Upload

To be implemented. Currently you need to place your image manually.

## Download

Let's say you want to download `background.png` in `icons/` directory, whose original size is 1920x1080.

### To get the original image

Just access to `/icons/main.png`. You can get the image of 1920x1080.

### To get the image which width is 720px

Just access to `/icons/main-720w.png`. You can get the image of 720x405, the same aspect as the original one.

Now you must be getting the hang of the protocol. Yes, just access to `/icons/main-405h.png` if you want just to specify the height.

### To get the image which size is 720x300

You know there are some style. Access to `/icons/main-720w-300h-{mode}.png` according to the mode you want. 

There are 2 modes, which are listed below:

* `contain` mode (default)

This is the default mode, so if you just access to `/icons/main-720w-300h.png`, then this mode is applied.

* `cover` mode

## Todo

* Support a method to specify the background color of the contain mode
* Support jpg, webp
* Support image uploading

## Contact

Mastodon: @hideo54@social.hideo54.com  
Twitter: @hideo54  
Email: contact@hideo54.com
