(function () {
  const architecture = {
    fluke: {
      label: 'Selected layer · 01',
      title: 'FLUKE 1620A Thermo-Hygrometer',
      copy: 'Serial data from the thermo-hygrometer tracks ambient and optical-bench temperature/humidity so scientists can see environmental drift before it destabilizes the experiment.'
    },
    esp: {
      label: 'Selected layer · 02',
      title: 'ESP8266 Signal Digitizer',
      copy: 'The microcontroller digitizes 13 laser and photodiode channels and transmits them wirelessly to the backend for live observation.'
    },
    api: {
      label: 'Selected layer · 03',
      title: 'Flask API and Scientific Timestamping',
      copy: 'Every reading is logged with IST, UTC, and Modified Julian Date so live monitoring and post-hoc research analysis stay synchronized.'
    },
    dash: {
      label: 'Selected layer · 04',
      title: 'Plotly Dash Interface',
      copy: 'The frontend converts raw streams into live cards, synchronized graphs, historical queries, and CSV extraction tools.'
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

  const modules = {
    overview: {
      label: 'Overview',
      title: 'Macro health at a glance.',
      copy: 'The overview screen aggregates ambient conditions, laser coordinates, photodiode values, connection health, and last server update time into one fast scanning surface.',
      image: '../npl/overview.png',
      alt: 'Overview dashboard module'
    },
    thermal: {
      label: 'Temperature and Humidity',
      title: 'Visualizing thermal lag.',
      copy: 'Ambient room air and optical-bench readings are plotted together so scientists can see delayed heat transfer before it affects laser alignment.',
      image: '../npl/tnh.png',
      alt: 'Temperature and humidity dashboard module'
    },
    lasers: {
      label: 'Lasers',
      title: 'Grouping opposing forces.',
      copy: 'Laser readings are paired in dedicated cards so X1/X2 and Y1/Y2 can be compared immediately instead of searched for across the page.',
      image: '../npl/laser.png',
      alt: 'Laser dashboard module'
    },
    photo: {
      label: 'Photodiodes',
      title: 'Troubleshooting the light chain.',
      copy: 'Colored cards act as a living legend for graph traces, helping scientists identify whether a laser, switch, fiber, or detector has failed.',
      image: '../npl/photo.png',
      alt: 'Photodiode dashboard module'
    },
    retrieve: {
      label: 'Retrieve Data',
      title: 'Supporting post-hoc analysis.',
      copy: 'Quick plotting and CSV export are separated from live monitoring so historical analysis stays powerful without cluttering observation workflows.',
      image: '../npl/retr.png',
      alt: 'Retrieve data dashboard module'
    }
  };

  const moduleButtons = document.querySelectorAll('.module-tabs button');
  const moduleStage = document.querySelector('.module-stage');

  moduleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const module = modules[button.dataset.module] || modules.overview;
      moduleButtons.forEach(item => item.classList.toggle('active', item === button));
      moduleStage.querySelector('.module-copy span').textContent = module.label;
      moduleStage.querySelector('.module-copy h3').textContent = module.title;
      moduleStage.querySelector('.module-copy p').textContent = module.copy;
      const image = moduleStage.querySelector('img');
      image.src = module.image;
      image.alt = module.alt;
    });
  });
})();
