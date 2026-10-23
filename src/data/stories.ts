export interface Story {
  slug: string;
  title: string;
  author: string;
  date: string;
  image: string;
  alt: string;
  summary: string;
  paragraphs: string[];
}

const entries = [
  [
    'the-mountains',
    'The Mountains',
    'John Appleseed',
    '2020-04-16',
    'mountains',
    'A snow-covered mountain rising above clouds under a blue sky',
    'Some perspectives can only be found by slowing down.',
    'Above the clouds, scale becomes difficult to understand. A ridge that looks close may be a day’s walk away. Here, the mountain fills the frame while the drifting clouds give the eye somewhere to rest.',
  ],
  [
    'sunset-cityscapes',
    'Sunset Cityscapes',
    'Benjamin Cruz',
    '2020-04-14',
    'cityscapes',
    'New York skyscrapers in the warm light of sunset',
    'Finding a little stillness in a city that never stops.',
    'At sunset, a familiar city becomes a study in contrast. Warm light catches the tallest buildings while the streets below fall into shadow. Looking from above turns the everyday rhythm of the city into a pattern of lines and light.',
  ],
  [
    '18-days-voyage',
    '18 Days Voyage',
    'Alexei Borodin',
    '2020-04-11',
    '18-days-voyage',
    'A lone traveller silhouetted against an orange evening sky',
    'A journey measured in moments, rather than miles.',
    'A single silhouette can hold a whole journey. Without the distractions of detail, the gesture of walking becomes the subject. The horizon anchors the photograph, leaving room for the changing colours of the sky.',
  ],
  [
    'architecturals',
    'Architecturals',
    'Samantha Brooke',
    '2020-04-09',
    'architecturals',
    'Curving geometric facade of a modern building',
    'The quiet poetry of the spaces we build.',
    'Architecture invites us to look again. From this angle, an ordinary facade becomes a sequence of repeating curves. The blue sky cuts a clean shape through the structure, balancing the density of the building.',
  ],
  [
    'world-tour-2019',
    'World Tour 2019',
    'Timothy Wagner',
    '2020-04-07',
    'world-tour',
    'A turquoise lake between rugged mountain peaks',
    'A collection of places that stay with you.',
    'Mountains fold around a ribbon of turquoise water. The foreground holds the frame in place, while the distant peaks draw the eye towards the clouds. It is a landscape that rewards a long look.',
  ],
  [
    'unforeseen-corners',
    'Unforeseen Corners',
    'William Malcolm',
    '2020-04-03',
    'unforeseen-corners',
    'A spreading tree under a vivid purple sunset',
    'The best things are sometimes just around the corner.',
    'The tree is a simple, familiar form. Against an extraordinary sky, it becomes something else. The branches spread across the colour, making a natural frame for the last light of the day.',
  ],
  [
    'king-on-africa',
    'King on Africa: Part II',
    'Tim Hillenburg',
    '2020-03-29',
    'king-on-africa',
    'Close-up portrait of a lion with a golden mane',
    'An intimate perspective on the natural world.',
    'The strength of this portrait lies in its quietness. Light separates the mane from the background, revealing the texture of each strand. The close crop invites attention to the animal’s expression.',
  ],
  [
    'the-trip-to-nowhere',
    'The Trip to Nowhere',
    'Felicia Rourke',
    '2020-03-21',
    'trip-to-nowhere',
    'An isolated autumn tree reflected in calm water',
    'Sometimes the destination is simply being there.',
    'A tree and its reflection divide the scene into two worlds. Small differences in the water keep the symmetry from feeling exact. Empty space allows the shape of the tree to carry the image.',
  ],
  [
    'rage-of-the-sea',
    'Rage of The Sea',
    'Mohammed Abdul',
    '2020-03-19',
    'rage-of-the-sea',
    'Ocean waves catching the orange light of the setting sun',
    'Where light meets the restless edge of the ocean.',
    'Water changes faster than the eye can follow. This frame holds a brief arrangement of foam, shadow and reflected sunlight. The low viewpoint brings the surface of the sea into focus.',
  ],
  [
    'running-free',
    'Running Free',
    'Michelle',
    '2020-03-16',
    'running-free',
    'Horses running through a misty landscape in black and white',
    'An expression of motion, instinct and freedom.',
    'Black and white removes the distraction of colour and lets movement lead. The mist softens the background while the horses retain their shape. A little space ahead of them gives the photograph a sense of possibility.',
  ],
  [
    'behind-the-waves',
    'Behind the Waves',
    'Lamarr Wilson',
    '2020-03-11',
    'behind-the-waves',
    'A powerful blue ocean wave curling over',
    'A different view of a familiar horizon.',
    'The wave creates its own architecture: a curved roof, a wall of blue, a bright opening. Light passing through water reveals a range of tones that disappears in an instant as the wave breaks.',
  ],
  [
    'calm-waters',
    'Calm Waters',
    'Samantha Brooke',
    '2020-03-09',
    'calm-waters',
    'A mountain and lake beneath a pink evening sky',
    'The world, with the volume turned down.',
    'A limited palette gives this landscape its calm. The lake echoes the sky, and layers of hills create a gentle rhythm through the frame. Nothing competes for attention; each part belongs to the whole.',
  ],
  [
    'the-milky-way',
    'The Milky Way',
    'Benjamin Cruz',
    '2020-03-05',
    'milky-way',
    'The Milky Way stretching across a dark night sky',
    'A reminder of just how much lies beyond the frame.',
    'Night photography changes our relationship with time. A long exposure gathers light too faint to see at a glance. The result reveals a sky that feels both familiar and entirely new.',
  ],
  [
    'night-at-the-dark-forest',
    'Night at The Dark Forest',
    'Mohammed Abdul',
    '2020-03-04',
    'dark-forest',
    'A granite mountain above pine forest beneath a starry sky',
    'A landscape between the last light and the first stars.',
    'A granite face rises beyond the dark line of the trees. The remaining light traces its surface, separating rock from sky. In a quiet scene like this, the smallest points of brightness carry weight.',
  ],
  [
    'somwarpets-beauty',
    'Somwarpet’s Beauty',
    'Michelle',
    '2020-03-01',
    'somwarpet',
    'Small orange flowers standing out against a soft green background',
    'Looking closer at the beauty underfoot.',
    'A shallow depth of field turns a small patch of flowers into a world of its own. The nearest blooms stay sharp as the garden becomes colour and softness. Small subjects deserve the same attention as wide landscapes.',
  ],
  [
    'land-of-dreams',
    'Land of Dreams',
    'William Malcolm',
    '2020-02-25',
    'land-of-dreams',
    'A church nestled in a snowy mountain valley',
    'A place that seems suspended between seasons.',
    'The church offers a human scale against the surrounding mountains. Cool tones unify the snow, clouds and stone. A small patch of warm colour is enough to guide the eye through the landscape.',
  ],
] as const;

export const stories: Story[] = entries.map(
  ([slug, title, author, date, image, alt, summary, opening]) => ({
    slug,
    title,
    author,
    date,
    image,
    alt,
    summary,
    paragraphs: [
      opening,
      'Every photograph begins with a decision about what to leave outside the frame. Taking a step back, changing the angle, or waiting for the light can reveal something that was easy to miss at first.',
      'This photo essay is an invitation to observe the details: the relationship between light and shade, the textures that give a scene its character, and the space that allows a subject to breathe. Take your time. There is always something else to notice.',
    ],
  }),
);

export const featuredStory: Story = {
  slug: 'hazy-full-moon-of-appalachia',
  title: 'Hazy full moon of Appalachia',
  author: 'John Appleseed',
  date: '2020-03-02',
  image: 'moon-of-appalacia',
  alt: 'A full moon over hazy blue mountain ridges and a pine forest',
  summary:
    'The dissected plateau area, while not actually made up of geological mountains, is popularly called “mountains,” especially in eastern Kentucky and West Virginia, and while the ridges are not high, the terrain is extremely rugged.',
  paragraphs: [
    'A full moon hangs above overlapping ridges. Haze softens the distant landscape, turning each layer of mountains into a different shade of blue. The dark trees in the foreground give the scene its depth.',
    'Photographing at dusk means working with a delicate balance. The sky still holds some of the day’s light, while the landscape is already moving towards night. In that short interval, familiar places can feel entirely different.',
    'The scene asks for patience. Follow the ridges from the forest towards the horizon, then return to the small, bright moon. A quiet image can contain an enormous amount of space.',
  ],
};

export function findStory(slug: string | undefined) {
  return [featuredStory, ...stories].find((story) => story.slug === slug);
}
export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}
