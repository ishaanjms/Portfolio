import { terrain } from './vendor/hairline/index.js';

// The entire cover remains a link; Hairline plays its own passive preview.
document.querySelectorAll('[data-cloud-terrain]').forEach(element => {
  terrain(element, {
    theme: 'light',
    intensity: 0.65,
    play: true,
    label: 'An isometric density field of rising columns'
  });
});
