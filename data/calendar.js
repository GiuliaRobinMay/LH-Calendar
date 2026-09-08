/* ============================================================================
   Lesko Help — Grant Strategy Calendar
   ----------------------------------------------------------------------------
   Source: "Grant Strategy Calendar, 2026 Edition" — Fund-Nation, 14 pages.
   Everything in this file is taken from that document. Wording is the PDF's
   own except where noted; nothing here is invented.

   ABOUT THE DATES
   ---------------
   The PDF works in whole months, not dates — "banks open their grant portals
   this month", not "March 14". It also ends with "Rinse and repeat, EVERY
   YEAR". So seasons are stored as recurring month bands and rebuilt for
   whichever year is on screen, rather than pinned to 2026.

   A band that runs past New Year (bank relationship season, Nov–Jan) sets
   wraps: true and is generated across the year boundary.

   HOW TO EDIT
   -----------
     fromM / toM   Month numbers, 0 = January.
     fromD / toD   Day of month. Use 31 for "the end of it" — it is clamped
                   to the real last day of that month.
     funder        Which funder type it belongs to (see LH_FUNDERS).
                   Colour comes from the funder type, never from the season.

   Last review: 2026-09-08.
   ========================================================================== */

/* Straight from the cover of the PDF. */
const LH_META = {
  title: 'Grant Strategy Calendar',
  edition: '2026 Edition',
  tagline: 'Know when grants open, plan your year ahead of time, and stop ' +
           'finding out about opportunities after the deadline has passed.',
  quietMonth: {
    heading: 'When nothing is due',
    body: 'A quiet month is still contact. Send a short update on your work, ' +
          'ask what is happening on their end, and offer something concrete: ' +
          'volunteers, capacity, a hand at their next event.',
  },
  repeat: 'Rinse and repeat, every year.',
  source: 'Fund-Nation · fund-nation.org',
};

/* --------------------------------------------------------- FUNDER TYPES */
/* Four colours only — the bright Lesko blue, red, gold and green, the same
   four as the frame stripes. Funder types share them by suit family; every
   line on the calendar carries its own name, so the colour only has to say
   which family it is in. */

const LH_FUNDERS = {
  bank: {
    name: 'Banks & CRA giving',
    suit: '♠', color: '#2B62D9',
    note: 'The Community Reinvestment Act is why bank giving exists, and it ' +
          'is why it is local. Portals open in February and cycles close in ' +
          'October — but the work that decides the outcome happens in ' +
          'November and December, before anything is open.',
  },
  foundation: {
    name: 'Foundations',
    suit: '♥', color: '#E5372C',
    note: 'Read the published priorities first, then request a call with a ' +
          'program officer before you write anything.',
  },
  federal: {
    name: 'Federal grants',
    suit: '♦', color: '#F2C230',
    note: 'The longest lead time of anything here. Preparation starts in ' +
          'April for opportunities announcing in May.',
  },
  state: {
    name: 'State grants',
    suit: '♣', color: '#0F9D58',
    note: 'State-specific opportunities, timed with the mid-year review so ' +
          'your financial documentation is already in order.',
  },
  local: {
    name: 'Local & community',
    suit: '♠', color: '#2B62D9',
    note: 'Grants from local businesses and organisations. Be a known face ' +
          'before you are a name on a form.',
  },
  retail: {
    name: 'Retail & corporate',
    suit: '♥', color: '#E5372C',
    note: 'Retail giving almost always starts with a store or regional ' +
          'manager who knows you by name, not with a corporate portal.',
  },
  campaign: {
    name: 'Campaigns & year-end giving',
    suit: '♦', color: '#F2C230',
    note: 'Giving Tuesday and the major-gift season. Prepared in September, ' +
          'finalised in October, executed in November and December.',
  },
  readiness: {
    name: 'Planning & readiness',
    suit: '♣', color: '#0F9D58',
    note: 'Goal setting, research, and getting documents and financial ' +
          'statements updated before anything is due.',
  },
};

/* -------------------------------------------------------------- SEASONS */
/* Recurring month bands, rebuilt for whichever year is on screen. */

const LH_SEASONS = [
  {
    id: 'bank-portals',
    funder: 'bank',
    name: 'Bank grant portals open',
    short: 'Portals open in February and cycles close in October.',
    what: 'Identify the banks that open their grant portals in February and ' +
          'submit early where you can. Cycles close in October, so September ' +
          'is the month to confirm the deadline and submission process ' +
          'directly with your contact.',
    fromM: 1, fromD: 1, toM: 9, toD: 31,
    peak: 'February to submit, October to close',
    prep: [
      'Meet the branch manager and the bank’s community relations contact before the portal opens',
      'Confirm the deadline and submission process directly with them',
      'Offer a site visit while there is still room on the calendar',
    ],
    urgent: 'Bank giving is local and it runs on who they already know. ' +
            'Walking up to a portal in February without a relationship behind ' +
            'it is the most common way this cycle is wasted.',
  },
  {
    id: 'bank-relationship',
    funder: 'bank',
    name: 'Bank relationship season',
    short: 'The unfunded months that decide the February applications.',
    what: 'Be of service to your local bank. Volunteer at their events, ' +
          'staff the toy drive, work their community day. Attend every event ' +
          'you are invited to, including the ones that look unrelated to funding.',
    fromM: 10, fromD: 1, toM: 0, toD: 31, wraps: true,
    peak: 'November through January',
    prep: [
      'Say yes to every invitation — holiday events, ribbon cuttings, community nights',
      'Be useful rather than working the room',
      'Thank everyone who took a meeting this year, including the ones who declined',
    ],
    urgent: 'This is not seasonal goodwill. November and December set the ' +
            'scene for your February bank applications — by the time the ' +
            'portals open, they should already know your name.',
  },
  {
    id: 'foundations',
    funder: 'foundation',
    name: 'Foundation grant season',
    short: 'Target foundations actively seeking applicants.',
    what: 'Tailor every application to the individual foundation’s focus, ' +
          'seek endorsements from community leaders, and analyse past ' +
          'winners for what actually got funded.',
    fromM: 2, fromD: 1, toM: 2, toD: 31,
    peak: 'March',
    prep: [
      'Read the published priorities before you write anything',
      'Request a call with a program officer',
      'Line up endorsements from community leaders or related organisations',
    ],
    urgent: 'Ask the one question worth a program officer’s time: is there ' +
            'anything I need to know about this grant that is not on your website?',
  },
  {
    id: 'federal',
    funder: 'federal',
    name: 'Federal grant season',
    short: 'Prepare in April for the opportunities announcing in May.',
    what: 'Federal grants carry specific requirements and the longest lead ' +
          'time on this calendar. Position your project to align with federal ' +
          'priorities, and be ready to adapt as guidelines evolve.',
    fromM: 3, fromD: 1, toM: 4, toD: 31,
    peak: 'April to prepare, May to apply',
    prep: [
      'Introduce yourself to your congressional district staffer and your state agency program contact',
      'Assemble a grant team for the more complex applications',
      'Look for partners — a joint proposal is usually the stronger one',
    ],
    urgent: 'Both a district staffer and a state agency contact are free, ' +
            'both remember you, and neither requires a proposal.',
  },
  {
    id: 'state',
    funder: 'state',
    name: 'State grants & mid-year review',
    short: 'State-specific opportunities, plus the half-year checkpoint.',
    what: 'Target state-specific grant opportunities, evaluate your progress ' +
          'so far, and get your financial documentation in order for mid-year ' +
          'submissions.',
    fromM: 5, fromD: 1, toM: 5, toD: 30,
    peak: 'June',
    prep: [
      'Financial documentation in order for mid-year submissions',
      'A mid-year update ready to send',
    ],
    urgent: 'Send the mid-year update to everyone you have talked to this ' +
            'year, whether or not they funded you. Especially the ones who said no.',
  },
  {
    id: 'local',
    funder: 'local',
    name: 'Local & community grants',
    short: 'Grants from local businesses and organisations.',
    what: 'Focus on grants that fund community projects, engage with local ' +
          'communities for support and insight, and emphasise the local ' +
          'impact of your project in every application.',
    fromM: 6, fromD: 1, toM: 6, toD: 31,
    peak: 'July',
    prep: [
      'Show up where the funders already are — chamber events, city council, service clubs',
      'Participate in local events to build presence and credibility',
    ],
    urgent: 'Be a known face before you are a name on a form.',
  },
  {
    id: 'retail',
    funder: 'retail',
    name: 'Retail & corporate grants',
    short: 'Corporate giving, which starts in the store and not the portal.',
    what: 'Look for grants offered by retail companies, revise your existing ' +
          'proposals with new data or achievements, and get ready for the ' +
          'busy grant season in the autumn.',
    fromM: 7, fromD: 1, toM: 7, toD: 31,
    peak: 'August',
    prep: [
      'Walk into the store and meet the store or regional manager',
      'Update your proposals with this year’s data and achievements',
    ],
    urgent: 'Retail giving almost always starts with a manager who knows you ' +
            'by name, not with a corporate portal.',
  },
  {
    id: 'giving-tuesday',
    funder: 'campaign',
    name: 'Giving Tuesday campaign',
    short: 'Planned in September, finalised in October, executed in November.',
    what: 'Start planning in September, refresh your social media for active ' +
          'engagement, increase community outreach, then finalise and run the ' +
          'campaign through November.',
    fromM: 8, fromD: 1, toM: 10, toD: 30,
    peak: 'Giving Tuesday itself — the Tuesday after Thanksgiving',
    givingTuesday: true,   // the exact day is computed, it moves every year
    prep: [
      'Refresh your organisation’s social media for active engagement',
      'Gather testimonials and impact stories',
      'Document success stories for the end-of-year appeal',
    ],
  },
  {
    id: 'year-end',
    funder: 'campaign',
    name: 'Year-end & major gifts',
    short: 'Major gift solicitation and the annual review.',
    what: 'Focus on year-end fundraising and major gift solicitation, remind ' +
          'donors of the tax benefits of year-end giving, and use the holiday ' +
          'season to boost the campaign.',
    fromM: 10, fromD: 1, toM: 11, toD: 31,
    peak: 'November and December',
    prep: [
      'Thank-you messages out to donors and supporters',
      'Annual reports for stakeholders',
      'Testimonials and impact stories collected for future use',
    ],
    urgent: 'Funders are out in public this month, at holiday events, ribbon ' +
            'cuttings and community nights. Keep showing up.',
  },
  {
    id: 'planning',
    funder: 'readiness',
    name: 'Planning & preparation',
    short: 'Goals, research and paperwork, before anything is due.',
    what: 'Define what you want to achieve with grant funding this year, ' +
          'research the grants and their deadlines, and make sure every ' +
          'document and financial statement is updated and ready.',
    fromM: 0, fromD: 1, toM: 0, toD: 31,
    peak: 'January',
    prep: [
      'Documents and financial statements updated and ready',
      'A list of the grants and deadlines you are targeting',
      'Draft proposals started for the upcoming opportunities',
    ],
    urgent: 'Start the introduction conversations now for the summer and ' +
            'autumn deadlines. Ask for fifteen minutes to learn what they ' +
            'fund. Do not ask for money on a first call.',
  },
];

/* --------------------------------------------------------------- MONTHS */
/* One entry per month, straight from the PDF: its theme, the relationship
   building note, and the five strategy and focus actions. */

const LH_MONTHS = [
  {
    theme: 'Planning and Preparation',
    relationship: 'Start the introduction conversations now for the summer and fall deadlines. Ask for fifteen minutes to learn what they fund. Do not ask for money on a first call.',
    actions: [
      ['Set Clear Goals', 'Define what you want to achieve with grant funding this year.'],
      ['Research Grants', 'Start researching potential grants and deadlines.'],
      ['Network', 'Begin networking with potential funders and partners.'],
      ['Draft Proposals', 'Start drafting grant proposals for upcoming opportunities.'],
      ['Organize Documents', 'Ensure all necessary documents and financial statements are updated and ready.'],
    ],
  },
  {
    theme: 'Banking on Grant Opportunities',
    relationship: 'Meet the branch manager and the bank’s community relations contact before the portal opens. Bank giving is local and it runs on who they already know.',
    actions: [
      ['Target Bank Grants', 'Identify banks that open their grant portals this month.'],
      ['Early Submissions', 'Submit applications early where possible.'],
      ['Refine Proposals', 'Continuously refine your grant proposals based on feedback.'],
      ['Attend Workshops', 'Participate in grant writing workshops and seminars.'],
      ['Monitor Deadlines', 'Keep a close watch on submission deadlines.'],
    ],
  },
  {
    theme: 'Focus on Foundation Grants',
    relationship: 'Request a call with a program officer before you write anything. Read the published priorities first, then ask the one question worth their time: is there anything I need to know about this grant that is not on your website?',
    actions: [
      ['Focus on Foundations', 'Target foundation grants actively seeking applicants.'],
      ['Tailor Applications', 'Customize applications to align with each foundation’s focus.'],
      ['Seek Endorsements', 'Get endorsements from community leaders or related organizations.'],
      ['Review Past Winners', 'Analyze successful past applications for insights.'],
      ['Engage with Foundation Representatives', 'Establish direct contact for better understanding and guidance.'],
    ],
  },
  {
    theme: 'Diverse Opportunities and Federal Grants',
    relationship: 'Introduce yourself to your congressional district staffer and your state agency program contact. Both are free, both remember you, and neither requires a proposal.',
    actions: [
      ['Explore Various Grants', 'Look for different types including federal, state, and private.'],
      ['Prepare Federal Grants', 'Begin preparing for federal grants and their specific requirements.'],
      ['Build a Grant Team', 'Consider assembling a team for multiple or complex applications.'],
      ['Stay Organized', 'Keep track of all applications and their respective stages.'],
      ['Feedback and Revision', 'Seek feedback on your proposals and revise them accordingly.'],
    ],
  },
  {
    theme: 'Federal Grants and Strategic Positioning',
    relationship: 'Ask your current funders who else should know your work, then ask them to make the introduction. A referred organization is not a cold applicant.',
    actions: [
      ['Prioritize Federal Grants', 'Focus on federal grants announcing this month.'],
      ['Understand Requirements', 'Ensure thorough understanding of federal grant requirements.'],
      ['Strategic Positioning', 'Position your project to align with federal priorities.'],
      ['Collaborate', 'Look for opportunities to partner with other organizations for stronger proposals.'],
      ['Maintain Flexibility', 'Be ready to adapt proposals as federal guidelines evolve.'],
    ],
  },
  {
    theme: 'State Grants and Mid-Year Evaluation',
    relationship: 'Send a mid-year update to everyone you have talked to this year, whether or not they funded you. Especially the ones who said no.',
    actions: [
      ['Apply for State Grants', 'Target state-specific grant opportunities.'],
      ['Mid-Year Review', 'Evaluate your progress and adapt strategies as needed.'],
      ['Strengthen Networks', 'Strengthen relationships with funders and partners.'],
      ['Stay Informed', 'Keep abreast of any new opportunities or changes.'],
      ['Organize Financials', 'Ensure your financial documentation is in order for mid-year submissions.'],
    ],
  },
  {
    theme: 'Community Initiatives and Local Grants',
    relationship: 'Show up where the funders already are. Chamber events, city council, service clubs. Be a known face before you are a name on a form.',
    actions: [
      ['Community Focus', 'Focus on grants that fund community projects.'],
      ['Local Engagement', 'Engage with local communities for support and insight.'],
      ['Seek Local Grants', 'Look for grants offered by local businesses and organizations.'],
      ['Highlight Impact', 'Emphasize the local impact of your project in applications.'],
      ['Stay Active in Community', 'Participate in local events to build presence and credibility.'],
    ],
  },
  {
    theme: 'Planning and Retail Grants',
    relationship: 'Walk into the store. Retail giving almost always starts with a store or regional manager who knows you by name, not with a corporate portal.',
    actions: [
      ['Plan Ahead', 'Start planning for upcoming grant opportunities.'],
      ['Retail Grants', 'Look for grants offered by retail companies.'],
      ['Update Proposals', 'Revise your existing proposals with new data or achievements.'],
      ['Networking', 'Continue building relationships with potential funders.'],
      ['Prepare for Busy Season', 'Get ready for the busy grant season in the fall.'],
    ],
  },
  {
    theme: 'Bank Connections and Giving Tuesday Prep',
    relationship: 'Reconnect before the October cycle closes. Send your bank contacts what the year has produced, confirm the deadline and submission process directly with them, and offer a site visit while there is still room on the calendar.',
    actions: [
      ['Reconnect with Banks', 'Engage with banks before they close their cycles in October.'],
      ['Prepare for Giving Tuesday', 'Start planning your Giving Tuesday campaign.'],
      ['Update Social Media', 'Refresh your organization’s social media for active engagement.'],
      ['Outreach', 'Increase community outreach to build support for upcoming campaigns.'],
      ['Review Past Submissions', 'Review past submissions for improvements and updates.'],
    ],
  },
  {
    theme: 'Bank Deadlines and Strategic Alliances',
    relationship: 'Thank everyone who took a meeting this year, including the ones who declined. This is the month that decides whether next year starts warm or cold.',
    actions: [
      ['Finalize Bank Grants', 'Ensure all bank grant applications are submitted before deadlines.'],
      ['Build Alliances', 'Strengthen alliances with community partners and funders.'],
      ['Giving Tuesday Strategy', 'Finalize and begin implementing your Giving Tuesday strategy.'],
      ['Document Success Stories', 'Gather and document success stories for end-of-year appeals.'],
      ['Plan for Next Year', 'Start early planning for next year’s grant cycle.'],
    ],
  },
  {
    theme: 'Giving Tuesday and Annual Review',
    relationship: 'Be of service to your local bank. Volunteer at their events, staff the toy drive, work their community day. Attend every event you are invited to, including the ones that look unrelated to funding. This is not seasonal goodwill. November and December set the scene for your February bank applications.',
    actions: [
      ['Maximize Giving Tuesday', 'Execute your Giving Tuesday campaign effectively.'],
      ['Annual Review', 'Start reviewing the year’s efforts and outcomes.'],
      ['Gather Testimonials', 'Collect testimonials and impact stories for future use.'],
      ['Thank Donors', 'Send out thank-you messages to donors and supporters.'],
      ['Prepare Year-End Reports', 'Begin preparing annual reports for stakeholders.'],
    ],
  },
  {
    theme: 'Season of Major Gifts',
    relationship: 'Keep showing up. Funders are out in public this month, at holiday events, ribbon cuttings and community nights. Say yes to every invitation, stay in service to your local bank, and be useful rather than working the room. By the time the bank portals open in February, they should already know your name.',
    actions: [
      ['Target Major Gifts', 'Focus on year-end fundraising and major gift solicitation.'],
      ['Tax Incentives', 'Remind donors of tax benefits associated with year-end giving.'],
      ['Holiday Campaigns', 'Use the holiday spirit to boost fundraising efforts.'],
      ['Reflect and Celebrate', 'Reflect on the year’s achievements and celebrate successes.'],
      ['Set Goals for Next Year', 'Begin setting goals and strategies for the upcoming year.'],
    ],
  },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LH_META, LH_FUNDERS, LH_SEASONS, LH_MONTHS };
}
