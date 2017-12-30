module.exports = {
  changelog: [
    {
      version: '0010',
      date: '31.12.2017',
      serverChanges: [
        'Introduced changelog',
        'Fixed a bug with helmet not saving',
        'Fixed a bug with helmet not giving attributes',
        'Fixed items stacking when they are not supposed to',
        'Added 5 new items',
        'Changed loottables',
        'Refactored some code related to database queries',
        'Fixed a bug of being able to load many maps by spamming teleport',
      ],
      clientChanges: [
        'Minor fixes',
        'Version data gets parsed straight from changelog.js',
        'Fixed login screen flickering when using autologin',
      ],
    },
  ],
};
