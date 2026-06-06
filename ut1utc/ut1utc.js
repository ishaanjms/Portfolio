(function () {
  const models = {
    lstm: {
      label: 'Long Short-Term Memory',
      title: 'Strong one-step alignment, weak recursive forecasting.',
      copy: 'The LSTM used a chronological 80/20 split, train-only scaling, 30-day sliding windows, two stacked 50-unit LSTM layers, 20% dropout, and dense output layers. It captured short-term dynamics but drifted toward a constant value in longer closed-loop forecasts.',
      metrics: [
        ['RMSE', '0.5118 s'],
        ['MAE', '0.4759 s']
      ],
      image: './figures/figure-14.png',
      alt: 'LSTM historical data and forecast'
    },
    timegpt: {
      label: 'TimeGPT',
      title: 'Transformer forecasting gave the cleanest validation result.',
      copy: 'Daily UT1-UTC values were resampled into monthly averages, then forecast against a 36-month validation horizon. The model gave a much lower error profile than the vanilla autoregressive LSTM.',
      metrics: [
        ['RMSE', '0.0236'],
        ['MAE', '0.0201']
      ],
      image: './figures/figure-15.png',
      alt: 'TimeGPT historical series and forecast'
    },
    sarima: {
      label: 'SARIMA',
      title: 'A classical statistical benchmark for long-horizon behavior.',
      copy: 'SARIMA was used as an interpretable baseline on recent UT1-UTC behavior, producing a 10-year forecast that could be compared against machine-learning approaches.',
      metrics: [
        ['Model type', 'Statistical'],
        ['Horizon', '10 years']
      ],
      image: './figures/figure-16.png',
      alt: 'SARIMA original data versus 10-year forecast'
    }
  };

  const buttons = document.querySelectorAll('.ut-model-tabs button');
  const stage = document.querySelector('.ut-model-stage');

  if (!buttons.length || !stage) return;

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const model = models[button.dataset.model] || models.lstm;
      buttons.forEach(item => item.classList.toggle('active', item === button));
      stage.querySelector('.ut-model-copy > span').textContent = model.label;
      stage.querySelector('.ut-model-copy h3').textContent = model.title;
      stage.querySelector('.ut-model-copy p').textContent = model.copy;

      const metricCards = stage.querySelectorAll('.ut-model-metrics article');
      metricCards.forEach((card, index) => {
        const metric = model.metrics[index];
        card.querySelector('span').textContent = metric[0];
        card.querySelector('strong').textContent = metric[1];
      });

      const image = stage.querySelector('img');
      image.src = model.image;
      image.alt = model.alt;
    });
  });
})();
