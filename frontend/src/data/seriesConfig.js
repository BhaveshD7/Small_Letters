// Central configuration for all series
export const SERIES_CONFIG = [
  {
    slug: 'love-in-small-letters-i',
    num: 'I',
    title: 'Hidden Gestures',
    desc: 'The things I do that she\'ll never see. Small acts of care that exist in silence, unnoticed and unspoken.',
    totalParts: 5
  },
  {
    slug: 'love-in-small-letters-ii',
    num: 'II',
    title: 'Comfortable Silence',
    desc: 'When words become optional and presence says everything. The evolution of quiet between two people learning to just exist together.',
    totalParts: 5
  },
  {
    slug: 'love-in-small-letters-iii',
    num: 'III',
    title: 'Little Things That Nobody Else Notices',
    desc: 'Tiny details the world walks past but I memorize. The microscopic language of someone I\'ve learned to read. Letters written across silence, across distance, across time zones and missed calls.',
    totalParts: 5
  },
  {
    slug: 'love-in-small-letters-iv',
    num: 'IV',
    title: 'The Weight of Almost',
    desc: 'Endings that aren\'t really endings. What remains when the feeling has been felt.',
    totalParts: 5
  },
  {
    slug: 'love-in-small-letters-v',
    num: 'V',
    title: 'Love Isn\'t Butterflies',
    desc: 'Love isn\'t butterflies for me anymore. It\'s deeper than that. It\'s comfort. It\'s showing up. It\'s choosing someone on ordinary days.',
    totalParts: 5
  },
  {
    slug: 'the-way-you-taste',
    num: 'VI',
    title: 'The Way You Taste',
    desc: 'Sensory memories that linger. The taste of someone in unexpected moments, the flavor of intimacy.',
    totalParts: 5
  }
];

// Helper to convert series config to dropdown options
export const getSeriesOptions = () => {
  return SERIES_CONFIG.map(s => ({
    value: s.slug,
    label: `${s.num} · ${s.title}`
  }));
};

// Helper to get series metadata by slug
export const getSeriesMeta = (slug) => {
  return SERIES_CONFIG.find(s => s.slug === slug);
};