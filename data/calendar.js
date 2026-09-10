/* ============================================================================
   Lesko Help — Grant Calendar
   ----------------------------------------------------------------------------
   Source: "Grant Strategy Calendar, 2026 Edition" — Fund-Nation.

   WRITTEN FOR SOMEONE WHO KNOWS NOTHING ABOUT GRANTS.
   Short sentences. Everyday words. No jargon.

   Words we do NOT use here, and what we say instead:
       funder / funding cycle  ->  who gives the money / when they open
       portal                  ->  the form, applying online
       proposal / application  ->  your form
       Community Reinvestment  ->  banks have to give money back locally
       fiscal year, LOI, CRA   ->  cut entirely

   THE ONE IDEA THIS PAGE EXISTS TO TEACH
   Most grants have no deadline — apply any day. Only a few open at set times
   of year. Those few are the ones you can miss, so those are the ones here.

   HOW TO EDIT
   Months are numbers, 0 = January. `from` and `to` are the first and last
   month a grant is open. If it runs across New Year, put the bigger number
   first (e.g. from 10, to 1 = November to February).

   Last review: 2026-09-10.
   ========================================================================== */

const LH_INTRO = {
  title: 'When can I apply?',
  alwaysHeading: 'Most grants have no deadline',
  alwaysBody: 'You can apply on any day of the year. You do not have to wait ' +
              'for a special date. If you find a grant that fits you, apply.',
  seasonHeading: 'The grants that open at certain times',
  seasonBody: 'These are the ones people miss. They open, they close, and then ' +
              'you wait a year. There are seven of them. Here they are.',
};

/* ------------------------------------------------------------- THE COLOURS */
/* Four only — the Lesko blue, red, gold and green. */
const LH_COLORS = {
  blue:  '#2B62D9',
  red:   '#E5372C',
  gold:  '#F2C230',
  green: '#0F9D58',
};

/* ------------------------------------------------------------- THE GRANTS */
/* Seven kinds of grant with a season. That is the whole list.

   Note on what is NOT here: the source also has a January planning month and
   a November-to-January stretch for getting to know your bank. Neither is a
   grant you apply for, so putting them in this list only made it longer and
   more confusing. They live in the monthly advice instead. */

const LH_GRANTS = [
  {
    id: 'bank',
    name: 'Bank grants',
    color: 'blue',
    from: 1, to: 9,                 // February to October
    when: 'February to October',
    what: 'Banks have to give money back to their local area. So they give ' +
          'grants to groups near them.',
    tip: 'Go into your bank and meet the manager before you apply. Banks give ' +
         'to people they already know. The best time to do that is November ' +
         'and December, months before the form even opens.',
    heads: 'This one is open the longest, so it is easy to think you have time. ' +
           'Send your form early.',
  },
  {
    id: 'foundation',
    name: 'Foundation grants',
    color: 'red',
    from: 2, to: 2,                 // March
    when: 'March',
    what: 'Foundations are set up to give money away. Each one has its own ' +
          'list of what it pays for.',
    tip: 'Read their website first and see what they pay for. Then phone them ' +
         'and ask: is there anything I should know that is not on your website?',
  },
  {
    id: 'federal',
    name: 'Government grants',
    color: 'gold',
    from: 3, to: 4,                 // April to May
    when: 'April and May',
    what: 'Money from the US government. The forms are longer and they ask ' +
          'for more.',
    tip: 'Start in April even though most open in May. Phone the office for ' +
         'your area and introduce yourself. It is free and they will remember you.',
    heads: 'These take the most time to fill in. Do not leave them to the last week.',
  },
  {
    id: 'state',
    name: 'State grants',
    color: 'green',
    from: 5, to: 5,                 // June
    when: 'June',
    what: 'Money from your own state, for groups working in that state.',
    tip: 'Have your money papers ready before June. They will ask to see them.',
  },
  {
    id: 'local',
    name: 'Local grants',
    color: 'blue',
    from: 6, to: 6,                 // July
    when: 'July',
    what: 'Small grants from local businesses and local groups.',
    tip: 'Go where they are. Local meetings, town events, clubs. Be a face ' +
         'they know before you are a name on a form.',
  },
  {
    id: 'company',
    name: 'Shop & company grants',
    color: 'red',
    from: 7, to: 7,                 // August
    when: 'August',
    what: 'Big shops and companies give money to groups near their stores.',
    tip: 'Walk into the shop and ask for the manager. This almost never ' +
         'starts online. It starts with a person.',
  },
  {
    id: 'yearend',
    name: 'Year-end giving',
    color: 'gold',
    from: 10, to: 11,               // November to December
    when: 'November and December',
    what: 'Not a form. This is when people give the most money to good causes.',
    tip: 'Ask your supporters. Tell them what you did this year. Then thank ' +
         'everyone, whether they gave or not.',
  },
];

/* --------------------------------------------------------- MONTHLY ADVICE */
/* One short line for each month, and up to three things to do. Plain words. */

const LH_MONTHS = [
  { name: 'January',
    line: 'Nothing is due. This is the month to get ready.',
    todo: ['Decide which grants you want this year.',
           'Get your papers and money records up to date.',
           'Start saying hello to people who give money. Do not ask for any yet.'] },
  { name: 'February',
    line: 'Bank grants open this month.',
    todo: ['Find out which banks near you are open for grants.',
           'Send your form early, not on the last day.',
           'Go in and meet your bank in person.'] },
  { name: 'March',
    line: 'Foundations are the focus.',
    todo: ['Read what each one pays for before you write anything.',
           'Phone and ask them a question. It shows you are serious.',
           'Ask someone local and well known to say a good word for you.'] },
  { name: 'April',
    line: 'Start on government grants now.',
    todo: ['Begin the paperwork. It takes longer than you think.',
           'Introduce yourself to your local government office.',
           'Ask another group to work with you on the bigger ones.'] },
  { name: 'May',
    line: 'Government grants open.',
    todo: ['Check you meet every rule they ask for.',
           'Ask the people who already fund you who else you should meet.',
           'Be ready to change your form if their rules change.'] },
  { name: 'June',
    line: 'State grants, and a look back at your year so far.',
    todo: ['Look for grants from your own state.',
           'Check how the year is going and what to change.',
           'Send a short update to everyone you spoke to. Even the ones who said no.'] },
  { name: 'July',
    line: 'Local grants and local people.',
    todo: ['Look for grants from local businesses.',
           'Go to local events so people see you.',
           'Say clearly how your work helps the area.'] },
  { name: 'August',
    line: 'Shops and companies. Also, get ready for autumn.',
    todo: ['Walk into local shops and ask about grants.',
           'Update your forms with what you did this year.',
           'Autumn is the busy season. Get ready now.'] },
  { name: 'September',
    line: 'Bank grants close soon. Do not wait.',
    todo: ['Phone your bank and check the closing date yourself.',
           'Send them what your group has done this year.',
           'Start planning your end-of-year fundraising.'] },
  { name: 'October',
    line: 'Last chance for bank grants.',
    todo: ['Send every bank form before the date.',
           'Write down your good news stories for the end of year.',
           'Thank everyone who met you this year, even the ones who said no.'] },
  { name: 'November',
    line: 'Ask your supporters. And start on next February.',
    todo: ['Run your end-of-year ask.',
           'Collect thank-you notes and stories from people you helped.',
           'Help out at your bank’s events. This is what gets you funded in February.'] },
  { name: 'December',
    line: 'The biggest giving month of the year.',
    todo: ['Ask people to give before the year ends.',
           'Say thank you to everyone.',
           'Keep turning up at local events. Be useful, not pushy.'] },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LH_INTRO, LH_COLORS, LH_GRANTS, LH_MONTHS };
}
