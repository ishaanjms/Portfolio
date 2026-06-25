(function () {
  const architecture = {
    fluke: {
      label: 'Selected layer · 01',
      title: 'FLUKE 1620A Thermo-Hygrometer',
      copy: 'Serial data from the thermo-hygrometer tracks ambient and optical-bench temperature/humidity so scientists can catch environmental changes early.'
    },
    esp: {
      label: 'Selected layer · 02',
      title: 'ESP8266 Signal Digitizer',
      copy: 'The microcontroller digitizes 13 laser and photodiode channels and sends them wirelessly to the backend for live monitoring.'
    },
    api: {
      label: 'Selected layer · 03',
      title: 'Flask API and Scientific Timestamping',
      copy: 'Every reading is logged with IST, UTC, and Modified Julian Date so live monitoring and later analysis stay aligned.'
    },
    dash: {
      label: 'Selected layer · 04',
      title: 'Plotly Dash Interface',
      copy: 'The frontend turns raw readings into live cards, graphs, historical queries, and CSV export tools.'
    }
  };

  const archButtons = document.querySelectorAll('.npl-architecture button');
  const archDetail = document.querySelector('.npl-arch-detail');

  archButtons.forEach(button => {
    button.addEventListener('click', () => {
      const detail = architecture[button.dataset.arch] || architecture.fluke;
      archButtons.forEach(item => {
        const isActive = item === button;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      archDetail.querySelector('span').textContent = detail.label;
      archDetail.querySelector('h3').textContent = detail.title;
      archDetail.querySelector('p').textContent = detail.copy;
    });
  });

})();
