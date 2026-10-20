import { phosphor } from './vendor/hairline/index.js';

// Phosphor's native pattern loop plays passively; the enclosing card is the link.
document.querySelectorAll('[data-artifacts-phosphor]').forEach(element => {
  phosphor(element, {
    theme: 'light',
    intensity: 0.65,
    label: 'A floating pixel canvas cycling through animated patterns'
  });
});
