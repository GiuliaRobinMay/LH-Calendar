/* ============================================================================
   Lesko Help — Grant Planning Workbook
   ----------------------------------------------------------------------------
   Source: "Your Grant Planning Workbook" — Fund-Nation · Nonprofit Classroom,
   15 pages. Wording is the PDF's own throughout.

   ONE THING THE SOURCE DOES NOT AGREE WITH ITSELF ABOUT
   -----------------------------------------------------
   Page 11 gives a quick rule: "salary multiplied by 1.35 is the figure that
   goes in your budget." Page 12 then works a $60,000 salary through the long
   method and arrives at $108,409.60 — an effective multiplier of about 1.81,
   not 1.35. On $60,000 the two answers are $81,000 and $108,409.60, which is
   a $27,409.60 gap.

   Both are reproduced here exactly as printed, and the calculator shows both
   side by side with the gap named, because budgeting the wrong one is the
   error the page exists to prevent. Do not quietly pick one.
   ========================================================================== */

const LH_WORKBOOK = {
  title: 'Your Grant Planning Workbook',
  tagline: 'Your fast track to success: the simplified approach. Build the ' +
           'package before you search, so that when you find the right grant ' +
           'you are already ready to write it.',
  intro: 'Work through the seven tasks in order. By the end you will have a ' +
         'defined program, a problem your city has already named in writing, ' +
         'a costed budget, and a reason for every line of it.',
  fastTip: '1 mission  |  3 programs  |  5 partnerships',

  /* ------------------------------------------------------- WHAT YOU BUILD */
  build: [
    ['Mission and program design', 'Define the mission, then list everything you do to fulfill it.'],
    ['Community research', 'Read your city’s Comprehensive Plan and pull its goals and objectives.'],
    ['Budget planning', 'Every item and its cost, staff with benefits, and overhead.'],
    ['Program justification', 'A rationale for each budget line, tied to mission and goals.'],
    ['Grant readiness', 'Details and budgets outlined in full, including needs and impacts.'],
  ],

  /* ---------------------------------------------------------- GRANT TYPES */
  grantTypes: [
    ['Planning', 'Creating a plan, and exploring ideas that solve a problem'],
    ['Program', 'Restricted. Specific program expenses only'],
    ['Capital', 'Real estate, major renovations, major equipment'],
    ['General operating', 'Anything the program needs'],
    ['Capacity building', 'Learning and strengthening your organization itself'],
  ],

  /* ----------------------------------------------------------- DEFINITIONS */
  definitions: [
    ['Community Reinvestment Act', 'The federal law requiring banks to give back to the community. This is why bank giving exists and why it is local.'],
    ['Corporate Social Responsibility', 'A business model where a company intentionally accepts responsibility to support the community around it.'],
    ['Grant', 'Funds provided to advance a community-based mission or purpose.'],
    ['Sponsorship', 'Funds provided by an entity to be advertised alongside an event, showing their support of the cause.'],
    ['In-kind', 'Non-monetary donations of objects, time, and expertise supporting a community-based mission.'],
    ['Fringe', 'Everything on top of a wage that you must pay to employ someone. Taxes, retirement, healthcare, PTO, supervision.'],
    ['Federal de minimis', 'The federal standard of 10 percent of program expenses applied to overhead and indirect costs.'],
    ['Letter of intent', 'A short pitch some funders require before a full application, so they can screen your concept for fit.'],
  ],

  /* ---------------------------------------------------------------- TASKS */
  tasks: [
    {
      n: 1, title: 'Write your mission and what you do',
      blurb: 'Your mission statement describes what your organization does and who it helps.',
      fields: ['Mission statement', 'Everything your organization does to fulfill that mission'],
    },
    {
      n: 2, title: 'Name your top three programs',
      blurb: 'From what you listed above, which have the most support and get the best response? Take the top three.',
      columns: ['Program name', 'What it does for the community, or what need it meets'],
      rows: 3,
    },
    {
      n: 3, title: 'Find the problem your city already named',
      blurb: 'Find your city’s Comprehensive Plan online, or email the Community Development office and ask for it. Locate the Goals and Objectives, usually a table. Also contact your city council or county official and ask for the community strategic plan.',
      columns: ['City goal', 'Objective'],
      rows: 4,
    },
    {
      n: 4, title: 'Which of those can you solve?',
      blurb: 'Looking at the city’s goals and objectives, which ones can your organization help solve? Those are the ones to build toward.',
      columns: ['City goal', 'Objective'],
      rows: 3,
    },
    {
      n: 5, title: 'Calculate what you need',
      blurb: 'What do you have to pay for in order to solve that problem? List every item, what one costs, and how many you need for the year. Yearly cost is unit price multiplied by how many.',
      columns: ['Item', 'Unit price', 'How many', 'Yearly cost'],
      rows: 5, totalLabel: 'Total program expenses',
    },
    {
      n: 6, title: 'Write the budget narrative as you go',
      blurb: 'For each item you listed, write one sentence about why the program needs it. Not what it is, why it is necessary. These sentences become your budget narrative.',
      columns: ['Item', 'Why the program needs it'],
      rows: 5,
    },
    {
      n: 7, title: 'Name the positions you need to hire',
      blurb: 'Fill the first two columns now. Leave salary blank until you have worked through the fringe page.',
      columns: ['Position title', 'What they do', 'Total salary for this position'],
      rows: 3,
    },
    {
      n: 8, title: 'Cost each position',
      blurb: 'A salary is not what a position costs. For most budgets, salary multiplied by 1.35 is the figure that goes in your budget. Use the long version below when a funder wants it shown line by line.',
      steps: [
        'Base hourly rate',
        'Paid time off per hour: hourly rate times 80, divided by 2,080',
        'Healthcare per hour: annual cost for one employee, divided by 2,080',
        'Supervision per hour: 20 percent of base hourly',
        'Employer taxes: Social Security, Medicare, unemployment, on the running total',
        'Total hourly cost',
        'Multiply by 2,080. This is the figure for Task 7.',
      ],
    },
  ],

  /* --------------------------------------------------- COSTING CONSTANTS */
  /* Every one of these is stated on the worked-example page. */
  costing: {
    hoursPerYear: 2080,          // from the Fair Labor Standards Act
    fringeRate: 0.35,
    quickMultiplier: 1.35,
    supervisionRate: 0.20,       // 20 percent of base hourly
    ptoHours: 80,                // two weeks
    defaultSalary: 60000,
    defaultHealthcare: 6000,
    taxes: [
      ['FICA', 7.65], ['FUTA', 6], ['SUTA', 3.4], ['Payroll', 6.2],
    ],                            // 23.25% combined, as printed
    example: {
      salary: 60000, healthcare: 6000,
      baseHourly: 28.85, fringe: 21000, taxRate: 23.25, pto: 2308,
      healthcarePerHour: 2.88, supervisionPerHour: 5.77, ptoPerHour: 1.11,
      addedPerHour: 9.76, totalHourly: 38.61, fringePerHour: 13.51,
      loadedAnnual: 108409.60, shortfall: 48409.60,
    },
    verdict: 'A $60,000 salary costs the organization $108,409.60. Budget the ' +
             'salary alone and you are short by $48,409.60.',
  },

  /* ------------------------------------------------------------ RESOURCES */
  resources: [
    ['Bureau of Labor Statistics', 'Wage data by area and occupation, so your salary figures match your region.', 'https://www.bls.gov'],
    ['Fair Labor Standards Act, Dept of Labor', 'Guidelines on hours worked, which is where the 2,080 comes from.', 'https://www.dol.gov/agencies/whd/flsa'],
    ['Office of Personnel Management', 'Information on benefits.', 'https://www.opm.gov'],
    ['IRS, and your State Department of Labor', 'FICA and FUTA rates from the IRS. Your SUTA rate from your state.', 'https://www.irs.gov'],
    ['Dept of Labor, vacation leave', 'Guidelines on paid time off.', 'https://www.dol.gov/general/topic/workhours/vacation_leave'],
    ['Healthcare.gov', 'For estimating the annual healthcare cost per employee.', 'https://www.healthcare.gov'],
  ],

  /* ------------------------------------------------------------------ CTA */
  cta: {
    heading: 'Want to write your first grant with help?',
    body: 'Beginner Grants is a six week program for people who have never submitted one.',
    steps: [
      ['Map out your proposal', 'From the package you just built in this workbook.'],
      ['Draft a statement of need', 'Grounded in the city goals you researched in Task 3.'],
      ['Build a program design', 'That matches what a funder is actually looking for.'],
      ['Find grants yourself', 'No more buying grant lists. You learn to search, which saves the money and the time.'],
      ['Submit it', 'You finish the program having written and sent your first grant.'],
    ],
    signup: 'Sign up at fund-nation.org with coupon code LESKO',
    link: 'https://fund-nation.org',
    contact: 'megan@fund-nation.org',
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LH_WORKBOOK };
}
