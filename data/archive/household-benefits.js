/* ============================================================================
   Lesko Help — The Help Calendar dataset
   ----------------------------------------------------------------------------
   This is the ONLY file you need to edit to keep the calendar current.
   No code knowledge required — every entry is plain text and dates.

   WHAT BELONGS IN HERE
   --------------------
   Seasonal help only. If a programme takes applications every day of the year
   it is not a calendar entry — it goes in the NO SEASON list at the bottom, so
   the calendar itself stays a list of things that can actually be missed.

   HOW TO EDIT
   -----------
   Each programme is one { ... } block. Dates are always "YYYY-MM-DD".

     topic            Which seasonal domain it belongs to (see LH_TOPICS).
                      Colour comes from the topic, never from the programme.
     opens / closes   The real application window. null for "no window".
     precision        "exact"   — published and firm
                      "typical" — most places use it, but it moves
                      "varies"  — genuinely different in every state
     short            One clause shown in the list. Say what it IS, plainly.
     rolls            true if a late application is held for the next round.

   HONESTY RULE
   ------------
   If you are not sure of a date, say so in `caveat` and set precision.
   A wrong date here costs somebody a benefit. "Check your state" is always a
   better answer than a confident guess.

   Sources for every date: docs/research.md.  Last full review: 2026-09-08.
   ========================================================================== */

/* ---------------------------------------------------------------- TOPICS */
/* There are exactly FOUR colours on this calendar — the bright Lesko blue,
   red, gold and green, the same four as the frame stripes. No tints, no
   shades, no fifth hue. Domains share them by suit family:

     ♠ blue  #2B62D9     ♥ red   #E5372C
     ♦ gold  #F2C230     ♣ green #0F9D58

   Two domains to a colour is fine because every line on the calendar carries
   its own name — the colour only has to say which family it is in.
   Adding a topic means picking one of the four, never inventing a new one. */

const LH_TOPICS = {
  'health-coverage': {
    name: 'Health coverage enrolment',
    suit: '♥', color: '#E5372C',
    note: 'The strictest deadlines on this calendar. These windows are fixed by law and the same everywhere — miss one and you generally wait a full year for the next.',
  },
  'energy-bills': {
    name: 'Energy & utility bills',
    suit: '♠', color: '#2B62D9',
    note: 'Opens in the autumn and closes when the money runs out — routinely months before the published closing date. The published date is not the real one.',
  },
  'student-aid': {
    name: 'Student aid & scholarships',
    suit: '♣', color: '#0F9D58',
    note: 'The federal deadline is nearly two years out and it is a trap. The state and college money is first-come and runs out between December and March.',
  },
  'tax-money': {
    name: 'Tax credits & money back',
    suit: '♦', color: '#F2C230',
    note: 'One filing window a year, and the only way to claim the Earned Income and Child Tax Credits. For many households this is the largest single payment of the year.',
  },
  'school-food': {
    name: 'Food & the school year',
    suit: '♣', color: '#0F9D58',
    note: 'Tied to the school calendar rather than the tax year — summer grocery money, and the school meal application that unlocks several other things.',
  },
  'charity-season': {
    name: 'Seasonal charity',
    suit: '♥', color: '#E5372C',
    note: 'Run by local charities on short, strict sign-ups, and far earlier in the year than people expect. Asking when you need it is usually too late.',
  },
  'early-years': {
    name: 'Childcare & early years',
    suit: '♠', color: '#2B62D9',
    note: 'Main enrolment runs in the spring for a place the following autumn, though seats reopen all year as families move away.',
  },
  'farm-land': {
    name: 'Farm & land',
    suit: '♣', color: '#0F9D58',
    note: 'Federal farm funding is batched: applications are accepted all year but only ranked at a cut-off date, so applying the day after one means waiting for the next.',
  },
  'arts-culture': {
    name: 'Arts & culture',
    suit: '♦', color: '#F2C230',
    note: 'Two fixed cycles a year, and the applications are multi-part — missing the first part locks you out of the second.',
  },

  /* Not offered in the filter. These have no season at all and live in their
     own list beneath the calendar. */
  'no-season': { name: 'No season', suit: '♠', color: '#7C879B', note: '', hidden: true },
};

const LH_PROGRAMS = [

  /* ====================================================== HEALTH COVERAGE */
  {
    id: 'aca-open-enrollment',
    topic: 'health-coverage',
    name: 'Marketplace health insurance',
    alsoCalled: 'Obamacare, ACA, HealthCare.gov',
    short: 'The one time a year almost anyone can start or switch a health plan.',
    what: 'The one time a year almost anyone can start or switch a health plan. Most people who enrol here pay a reduced premium.',
    opens: '2026-11-01',
    closes: '2027-01-15',
    precision: 'exact',
    cadence: 'Every year, same window',
    keyDates: [
      { date: '2026-12-15', label: 'Sign up by Dec 15 if you want coverage to start Jan 1' },
    ],
    prepDays: 21,
    prep: [
      'Your best guess at next year’s household income',
      'Names and birth dates for everyone on the plan',
      'Any job-based insurance offer you turned down',
    ],
    missedIt: 'You can still enrol if you lose a job, move, marry, or have a baby — that opens a 60-day window of your own.',
    where: 'HealthCare.gov, or your state’s own marketplace',
    link: 'https://www.healthcare.gov/',
    caveat: 'A few states run their own marketplace and stay open later — several run to Jan 31.',
  },
  {
    id: 'medicare-open-enrollment',
    topic: 'health-coverage',
    name: 'Medicare Open Enrollment',
    alsoCalled: 'Medicare Annual Election Period, AEP',
    short: 'Change your Medicare Advantage or Part D drug plan for next year.',
    what: 'Change your Medicare Advantage or Part D drug plan for next year. Worth checking even if you are happy — plans change what they cover every year.',
    opens: '2026-10-15',
    closes: '2026-12-07',
    precision: 'exact',
    cadence: 'Every year, Oct 15 – Dec 7',
    keyDates: [{ date: '2027-01-01', label: 'Whatever you pick starts Jan 1' }],
    prepDays: 14,
    prep: [
      'Your red-white-and-blue Medicare card',
      'A list of every prescription you take, with the dose',
      'The pharmacy and doctors you want to keep',
    ],
    missedIt: 'If you are on Medicare Advantage you get a second chance Jan 1 – Mar 31 to switch once.',
    where: 'Medicare.gov, or free one-to-one help from your state SHIP counsellor',
    link: 'https://www.medicare.gov/health-drug-plans/open-enrollment',
  },
  {
    id: 'medicare-advantage-oep',
    topic: 'health-coverage',
    name: 'Medicare Advantage second chance',
    alsoCalled: 'MA Open Enrollment Period',
    short: 'One switch, for people already on a Medicare Advantage plan.',
    what: 'Already on a Medicare Advantage plan and regretting it? You get one switch in this window.',
    opens: '2027-01-01',
    closes: '2027-03-31',
    precision: 'exact',
    cadence: 'Every year, Jan 1 – Mar 31',
    prepDays: 14,
    prep: ['Your current plan’s member card', 'What went wrong — cost, doctors dropped, drug not covered'],
    where: 'Medicare.gov',
    link: 'https://www.medicare.gov/health-drug-plans/open-enrollment',
    caveat: 'Only for people already enrolled in a Medicare Advantage plan. Not a way in from Original Medicare.',
  },

  /* ======================================================== ENERGY BILLS */
  {
    id: 'liheap-heating',
    topic: 'energy-bills',
    name: 'Help paying the heating bill',
    alsoCalled: 'LIHEAP, HEAP, energy assistance, fuel assistance',
    short: 'A payment straight to your utility or fuel dealer for winter heat.',
    what: 'A payment straight to your utility or fuel dealer. This is the single most time-sensitive thing on this calendar.',
    opens: '2026-10-01',
    closes: '2027-04-30',
    precision: 'typical',
    cadence: 'Every winter',
    keyDates: [
      { date: '2026-11-01', label: 'The later, more common opening date — many states start here' },
    ],
    prepDays: 30,
    prep: [
      'Your most recent heating bill',
      'Income for everyone in the house, last 30 days',
      'Social Security numbers for the household',
    ],
    urgent: 'Most states hand this out first-come, first-served and stop when the money runs out — often long before the official closing date. Apply the week it opens, not the month it closes.',
    where: 'Your state or county energy assistance office',
    link: 'https://www.acf.hhs.gov/ocs/programs/liheap',
    caveat: 'Every state sets its own dates. Massachusetts opens Oct 1. Illinois opens Oct 1 for older adults, people with a disability, families with children under 5, and anyone disconnected — everyone else Nov 1. Pennsylvania opens Nov 2. Check yours.',
  },
  {
    id: 'winter-shutoff-protection',
    topic: 'energy-bills',
    name: 'Winter shut-off protection',
    alsoCalled: 'Winter moratorium, cold weather rule, winter termination programme',
    short: 'The months your utility is barred from disconnecting you over an unpaid bill.',
    what: 'In most cold states there is a stretch of winter when your gas or electricity cannot be shut off for non-payment. It does not clear the debt, but it buys you the time to sort out help.',
    opens: '2026-11-15',
    closes: '2027-03-31',
    precision: 'varies',
    cadence: 'Every winter, in the states that have one',
    prepDays: 21,
    prep: [
      'Your account number and the shut-off notice if you have had one',
      'Proof of income, if your state asks you to register for protection',
      'A doctor’s note if someone in the house is medically vulnerable',
    ],
    urgent: 'In some states this is automatic and in others you must ask for it — and the arrears keep building either way. Use the protected months to apply for heating help, not to wait.',
    where: 'Your utility, or your state public utility commission',
    link: 'https://www.ncsl.org/energy/states-utility-disconnection-policies',
    caveat: 'Dates and rules vary widely. New Jersey ran Nov 15 – Mar 15; Massachusetts Oct 27 – Apr 1; Pennsylvania Dec 1 – Mar 31; Oklahoma roughly Nov 1 – Mar 31. Several states have no moratorium at all.',
  },
  {
    id: 'liheap-cooling',
    topic: 'energy-bills',
    name: 'Help paying the cooling bill',
    alsoCalled: 'LIHEAP cooling, summer crisis programme',
    short: 'The same energy help pointed at summer electricity bills, and sometimes a fan or air conditioner.',
    what: 'Same programme as the heating help, pointed at summer electric bills. Some states will also buy you a window air conditioner or a fan.',
    opens: '2027-05-01',
    closes: '2027-09-30',
    precision: 'varies',
    cadence: 'Every summer, in the states that run one',
    prepDays: 21,
    prep: [
      'Your most recent electric bill',
      'Income for the last 30 days',
      'A doctor’s note if someone in the house has a heat-sensitive condition',
    ],
    where: 'Your state or county energy assistance office',
    link: 'https://www.acf.hhs.gov/ocs/programs/liheap',
    caveat: 'Not every state runs a cooling programme at all, and the ones that do vary the most of anything on this calendar.',
  },

  /* ========================================================= STUDENT AID */
  {
    id: 'fafsa-2627',
    topic: 'student-aid',
    name: 'FAFSA for this school year (2026–27)',
    alsoCalled: 'Federal student aid, Pell Grant',
    short: 'Still open for the year you are already in — a Pell Grant may still be sitting there.',
    what: 'Still open. If you are in school right now and never filed, you may be leaving a Pell Grant on the table for the year you are already in.',
    opens: '2025-09-24',
    closes: '2027-06-30',
    precision: 'exact',
    cadence: 'This cycle closes Jun 30, 2027',
    prepDays: 0,
    prep: ['Your FSA ID', 'Your 2024 tax return', 'Bank balances and any investments'],
    where: 'studentaid.gov',
    link: 'https://studentaid.gov/h/apply-for-aid/fafsa',
    caveat: 'The federal deadline is Jun 30, 2027, but your state and your college almost certainly closed their own aid months ago. Money may still be there — file anyway and ask the financial aid office.',
  },
  {
    id: 'fafsa-2728',
    topic: 'student-aid',
    name: 'FAFSA for next school year (2027–28)',
    alsoCalled: 'Federal student aid, Pell Grant',
    short: 'The form behind Pell Grants, work-study, and most state and college aid.',
    what: 'The form behind Pell Grants, work-study, and most state and college aid. Free to file, and the number one reason people miss aid is simply never filing.',
    opens: '2026-10-01',
    closes: '2028-06-30',
    precision: 'typical',
    cadence: 'Every year, opens around Oct 1',
    keyDates: [
      { date: '2026-12-01', label: 'Priority season starts — state and college deadlines begin landing' },
      { date: '2027-03-01', label: 'A very common state priority deadline' },
    ],
    prepDays: 21,
    prep: [
      'An FSA ID for the student and one parent — make these first, they take a day or two to verify',
      'Your 2025 tax return',
      'Bank balances and any investments',
    ],
    urgent: 'The federal deadline is nearly two years out and it is a trap. The money that runs out is state and college money, much of it first-come with deadlines between December and March. File in October.',
    where: 'studentaid.gov — free, and never pay a site that offers to file it for you',
    link: 'https://studentaid.gov/h/apply-for-aid/fafsa',
    caveat: 'Oct 1 is the statutory date. The last two cycles opened a few days early — 2026–27 opened Sep 24, 2025. Check late September.',
  },
  {
    id: 'scholarships-national',
    topic: 'student-aid',
    name: 'National scholarship season',
    alsoCalled: 'Big-name scholarships, corporate scholarships',
    short: 'The large national awards — open late summer, closed before the new year.',
    what: 'The large national awards open in late summer and close before the new year. This is the crowded half of the season.',
    opens: '2026-08-01',
    closes: '2026-12-31',
    precision: 'typical',
    cadence: 'Every year, opens Aug–Sep, closes Oct–Dec',
    prepDays: 21,
    prep: [
      'One essay you can adapt, written now rather than in December',
      'Two people who have already agreed to write you a reference',
      'Your transcript',
    ],
    where: 'Free search sites, and your school counsellor',
    link: 'https://studentaid.gov/understand-aid/types/scholarships',
    caveat: 'Deadlines are per-scholarship. This band shows when the season is busy, not a single date.',
  },
  {
    id: 'scholarships-local',
    topic: 'student-aid',
    name: 'Local scholarship season',
    alsoCalled: 'Community foundation, employer and school scholarships',
    short: 'Smaller local awards with a fraction of the applicants — the best odds here.',
    what: 'Smaller awards from your community foundation, your high school, your parents’ employer, your union, your church. Far fewer applicants than the national ones.',
    opens: '2027-01-01',
    closes: '2027-04-30',
    precision: 'typical',
    cadence: 'Every year, opens January, closes March–April',
    prepDays: 21,
    prep: [
      'The essay you already wrote in the autumn',
      'Your counsellor’s list of local awards — ask for it in December',
    ],
    urgent: 'Best odds on this whole calendar. A local award with eleven applicants beats a national one with eleven thousand, and almost nobody bothers.',
    where: 'Your school counsellor and your local community foundation',
    link: 'https://studentaid.gov/understand-aid/types/scholarships',
  },

  /* =========================================================== TAX MONEY */
  {
    id: 'tax-filing-season',
    topic: 'tax-money',
    name: 'Tax season — and the refunds with it',
    alsoCalled: 'EITC, Earned Income Credit, Child Tax Credit, free tax prep',
    short: 'The only way to claim the Earned Income and Child Tax Credits.',
    what: 'For a lot of families this is the biggest single payment of the year. Filing is how you claim the Earned Income Credit and Child Tax Credit — you do not get them any other way.',
    opens: '2027-01-26',
    closes: '2027-04-15',
    precision: 'typical',
    cadence: 'Every year, late January to April 15',
    keyDates: [
      { date: '2027-02-15', label: 'Refunds with the EITC or Child Tax Credit cannot legally go out before now' },
      { date: '2027-04-15', label: 'Filing deadline — or ask for an extension' },
    ],
    prepDays: 30,
    prep: [
      'Every W-2 and 1099 — they arrive by Jan 31',
      'Last year’s return if you have it',
      'Social Security numbers for your children',
      'Bank account and routing number for direct deposit',
    ],
    urgent: 'Do not pay for this. Free in-person tax prep (VITA) is available to most households on this calendar, and the volunteers are trained and checked. Paid preparers can take several hundred dollars out of exactly the refund you were counting on.',
    where: 'A free VITA site near you, or IRS Free File online',
    link: 'https://www.irs.gov/individuals/free-tax-return-preparation-for-you-by-volunteers',
    caveat: 'The IRS announces the exact opening day each January. Late January is the pattern; treat this date as close, not final.',
  },
  {
    id: 'tax-extension-deadline',
    topic: 'tax-money',
    name: 'Last day if you filed an extension',
    alsoCalled: 'October tax deadline',
    short: 'Where the extra time runs out if you asked for it back in April.',
    what: 'If you asked for more time on your 2025 taxes back in April, this is where the extra time runs out.',
    opens: '2026-04-16',
    closes: '2026-10-15',
    precision: 'exact',
    cadence: 'Every year, Oct 15',
    prepDays: 21,
    prep: ['The forms you were missing in April', 'Last year’s return'],
    where: 'A free VITA site, or IRS Free File',
    link: 'https://www.irs.gov/filing/individuals/when-to-file',
    caveat: 'An extension gave you more time to file, never more time to pay. Interest has been running since April.',
  },
  {
    id: 'property-tax-relief',
    topic: 'tax-money',
    name: 'Property tax breaks for your home',
    alsoCalled: 'Homestead exemption, senior freeze, circuit breaker',
    short: 'Knocks money off the tax on the home you live in, every year after.',
    what: 'Knocks money off the property tax on the home you live in. Bigger discounts for older adults, veterans, and people with a disability in most states.',
    opens: '2027-01-01',
    closes: '2027-06-01',
    precision: 'varies',
    cadence: 'Once a year — deadline set by your state or county',
    prepDays: 30,
    prep: [
      'Proof this is your main home',
      'Your deed or tax bill',
      'Proof of age, disability, or service if you are claiming that rate',
    ],
    urgent: 'Many people qualify for years without ever filing, because nobody tells you. Around 29 states plus DC run an income-based circuit breaker, and at least 26 offer a senior freeze — ask your assessor directly rather than waiting to be offered it.',
    where: 'Your county assessor or tax collector',
    link: 'https://www.usa.gov/property-taxes',
    caveat: 'The deadline is genuinely local. Most fall between March and June, some as early as February, and Indiana wants the over-65 deduction the December before. This band is the common range, not your date.',
  },

  /* ========================================================= SCHOOL FOOD */
  {
    id: 'school-meals',
    topic: 'school-food',
    name: 'Free & reduced-price school meals',
    alsoCalled: 'School lunch application, NSLP',
    short: 'Breakfast and lunch at school — and the doorway to several other things.',
    what: 'Breakfast and lunch at school. Worth applying even if you think you earn too much — and it is the doorway to summer food money, fee waivers, and reduced-cost internet.',
    opens: '2026-07-15',
    closes: '2027-06-30',
    precision: 'typical',
    cadence: 'Apply at the start of the school year, or any day after',
    prepDays: 0,
    prep: ['Household income for last month', 'Each child’s name and school'],
    urgent: 'Apply now rather than in the spring — approval unlocks other things, and several of those close before the school year ends.',
    where: 'Your child’s school or district office',
    link: 'https://www.fns.usda.gov/nslp',
  },
  {
    id: 'sun-bucks',
    topic: 'school-food',
    name: 'SUN Bucks (summer food money)',
    alsoCalled: 'Summer EBT, S-EBT',
    short: 'Grocery money per child for the summer months when school meals stop.',
    what: 'Grocery money on a card for each school-age child, to cover the summer months when school meals stop.',
    opens: '2027-03-01',
    closes: '2027-08-31',
    precision: 'typical',
    cadence: 'Every year — processed from spring, deadline Aug 31',
    rolls: true,
    prepDays: 21,
    prep: ['Each child’s school and grade', 'Household income'],
    where: 'Your state human services or education department',
    link: 'https://www.fns.usda.gov/sebt',
    caveat: 'Many families never need to apply — if your child already gets free or reduced-price school meals, or you get SNAP, most states enrol you automatically.',
    missedIt: 'Applications sent in after Aug 31 are not thrown away. They are held and counted for the following summer.',
  },

  /* ====================================================== CHARITY SEASON */
  {
    id: 'back-to-school',
    topic: 'charity-season',
    name: 'Back-to-school supplies & backpacks',
    alsoCalled: 'School supply drives, backpack giveaways, uniform help',
    short: 'Free backpacks, supplies, uniforms and shoes before term starts.',
    what: 'Local drives and resource fairs handing out backpacks, supplies, uniforms and shoes — often alongside free haircuts, health checks and immunisations.',
    opens: '2027-07-01',
    closes: '2027-08-31',
    precision: 'varies',
    cadence: 'Every summer, in the few weeks before term',
    prepDays: 14,
    prep: [
      'Your children’s grades and sizes',
      'Proof of address, if the event asks for it',
      'For most events, the child has to be there in person',
    ],
    where: 'Local churches, libraries, community centres and school districts',
    link: 'https://www.usa.gov/school-supplies',
    caveat: 'Almost all of these are single-day events rather than an application, mostly late July and August, and mostly while supplies last. Watch local Facebook groups and church bulletins from early July.',
  },
  {
    id: 'holiday-assistance',
    topic: 'charity-season',
    name: 'Holiday help — toys, coats and a Christmas dinner',
    alsoCalled: 'Angel Tree, Toys for Tots, adopt-a-family',
    short: 'Gifts, winter coats and a holiday food box — signed up for in the autumn.',
    what: 'Gifts for your children, winter coats, and a holiday food box. Run by local charities, so the sign-up is short and strict.',
    opens: '2026-09-01',
    closes: '2026-10-31',
    precision: 'typical',
    cadence: 'Every year — sign up in the autumn, receive in December',
    prepDays: 0,
    prep: [
      'Birth certificates for each child',
      'Proof of address',
      'Clothing and shoe sizes, and one thing each child actually wants',
    ],
    urgent: 'This window is far earlier than people expect. Most local Salvation Army offices take no applications at all after October — asking in December is too late by two months.',
    where: 'Your local Salvation Army, Toys for Tots chapter, or church',
    link: 'https://www.salvationarmyusa.org/usn/provide-toys-for-children/',
    caveat: 'Every local office sets its own dates. Some open Sep 1, most open Oct 1, and popular ones fill in days. Call yours in early September.',
  },

  /* ========================================================= EARLY YEARS */
  {
    id: 'head-start',
    topic: 'early-years',
    name: 'Head Start & Early Head Start',
    alsoCalled: 'Free preschool, early childhood',
    short: 'Free preschool and childcare from birth to five, plus health checks.',
    what: 'Free preschool and childcare from birth to five, plus health and dental checks and help for the whole family.',
    opens: '2027-02-01',
    closes: '2027-06-30',
    precision: 'varies',
    cadence: 'Main enrolment in spring for the autumn — but spots open all year',
    prepDays: 30,
    prep: ['Your child’s birth certificate', 'Immunisation records', 'Proof of income'],
    where: 'Your local Head Start centre',
    link: 'https://www.acf.hhs.gov/ohs/how-apply',
    caveat: 'Centres set their own dates. Spring for an autumn start is the pattern, but children move away all year and seats reopen — always ask to be on the list.',
  },

  /* =========================================================== FARM LAND */
  {
    id: 'nrcs-conservation',
    topic: 'farm-land',
    name: 'Farm conservation funding (EQIP, CSP)',
    alsoCalled: 'NRCS, EQIP, Conservation Stewardship Program, ACEP',
    short: 'Cost-share for conservation work on land you farm or manage.',
    what: 'Federal money towards conservation work — soil, water, fencing, irrigation, habitat. Applications are taken all year but only ranked in batches, so the cut-off is what matters.',
    opens: '2026-10-01',
    closes: '2027-01-15',
    precision: 'typical',
    cadence: 'Batched — the first national ranking cut-off is mid-January',
    prepDays: 45,
    prep: [
      'Your farm and tract numbers from the Farm Service Agency',
      'Proof of control of the land — deed or lease',
      'A conservation plan, which your local NRCS office will help you write',
    ],
    urgent: 'Applying the day after a batching deadline means waiting for the next round, which can be most of a year. Get the paperwork with your local office in the autumn, not in January.',
    where: 'Your local USDA Service Center / NRCS office',
    link: 'https://www.nrcs.usda.gov/getting-assistance',
    caveat: 'USDA set a national Jan 15 batching deadline for the first EQIP, CSP and ACEP funding round. States often run extra rounds on their own dates, so ask your local office what else is coming.',
  },
  {
    id: 'fsa-farm-deadlines',
    topic: 'farm-land',
    name: 'Farm safety-net & disaster sign-up',
    alsoCalled: 'FSA, ARC, PLC, crop insurance sales closing',
    short: 'The annual sign-up for price protection and disaster cover on a farm.',
    what: 'Agriculture Risk Coverage and Price Loss Coverage elections, disaster programmes, and the crop insurance sales closing dates. Every one is a hard deadline with no late filing.',
    opens: '2027-01-01',
    closes: '2027-03-15',
    precision: 'varies',
    cadence: 'Annual, and the dates move every year',
    prepDays: 30,
    prep: [
      'Your farm records and acreage report',
      'Proof of ownership or your lease',
      'Last year’s production history',
    ],
    urgent: 'These are genuinely hard deadlines — there is no late filing and no appeal for missing one. Check the current dates with your county office rather than trusting last year’s.',
    where: 'Your county Farm Service Agency office',
    link: 'https://www.farmers.gov/working-with-us/program-deadlines',
    caveat: 'Dates differ by programme, by crop and by county, and they shift each year — this band is the busy period, not your deadline. The crop insurance sales closing date is set per crop and region.',
  },

  /* ======================================================== ARTS CULTURE */
  {
    id: 'nea-arts-projects',
    topic: 'arts-culture',
    name: 'Arts project grants (NEA & state councils)',
    alsoCalled: 'Grants for Arts Projects, GAP, state arts council grants',
    short: 'Federal and state project money for arts organisations and artists.',
    what: 'The National Endowment for the Arts runs two application cycles a year, and around 40% of its budget passes to state arts agencies, which run their own grants for artists, fellowships and arts in education.',
    opens: '2026-11-01',
    closes: '2027-02-11',
    precision: 'typical',
    cadence: 'Two cycles a year — deadlines fall around February and July',
    prepDays: 45,
    prep: [
      'An active SAM.gov registration and UEI — this alone can take weeks, so start there',
      'Work samples in the format the guidelines ask for',
      'Matching funds — most NEA awards must be matched at least one to one',
    ],
    urgent: 'The application is in two parts, several days apart: part one goes through Grants.gov, part two through the NEA portal. Miss part one and the system will not let you file part two at all.',
    where: 'arts.gov, and your own state arts council',
    link: 'https://www.arts.gov/grants/grants-for-arts-projects',
    caveat: 'The FY2026 cycles closed Feb 12 and Jul 9, with the second part due Jul 21. Next year’s dates follow the same shape but are confirmed in the published guidelines — check those before you plan around this band. State council deadlines are separate again, often around April.',
  },

  /* ====================================================== NO SEASON AT ALL */
  /* These take applications every day of the year, so they are deliberately
     kept off the calendar grid and listed on their own underneath it. */
  {
    id: 'medicaid-chip',
    topic: 'no-season',
    name: 'Medicaid & CHIP',
    alsoCalled: 'Medical assistance, children’s health insurance',
    short: 'Free or very low cost health coverage, with no enrolment season.',
    what: 'Free or very low cost health coverage. There is no season — apply the day you need it.',
    opens: null, closes: null, precision: 'exact',
    cadence: 'Open every day of the year',
    prep: ['Proof of income for the last month', 'Who lives in your household'],
    where: 'Your state Medicaid office, or HealthCare.gov will pass you over',
    link: 'https://www.medicaid.gov/about-us/where-can-people-get-help-medicaid-chip/index.html',
    renewal: 'You do have to renew, usually once a year. Watch your mail — most people who lose Medicaid lose it for missing that letter, not for earning too much.',
  },
  {
    id: 'snap',
    topic: 'no-season',
    name: 'SNAP food benefits',
    alsoCalled: 'Food stamps, EBT',
    short: 'Monthly grocery money, with emergency cases approved in about a week.',
    what: 'Monthly grocery money on a card. No season — apply the day you need it, and emergency cases can be approved in 7 days.',
    opens: null, closes: null, precision: 'exact',
    cadence: 'Open every day of the year',
    prep: [
      'Income for the last 30 days',
      'Rent or mortgage and utility bills — these raise your benefit',
      'Who lives with you',
    ],
    where: 'Your state human services office',
    link: 'https://www.fns.usda.gov/snap/state-directory',
    renewal: 'Recertification comes round every 6 or 12 months and the notice is easy to miss. Put your renewal month on this calendar the day you are approved.',
  },
  {
    id: 'wic',
    topic: 'no-season',
    name: 'WIC',
    alsoCalled: 'Women, Infants and Children',
    short: 'Food, formula and feeding support in pregnancy and up to age five.',
    what: 'Food, formula, and breastfeeding support if you are pregnant or have a child under five. Income limits are higher than people assume — many working families qualify.',
    opens: null, closes: null, precision: 'exact',
    cadence: 'Open every day of the year',
    prep: ['Proof of pregnancy or your child’s birth certificate', 'Proof of income', 'Proof of address'],
    where: 'Your local WIC clinic',
    link: 'https://www.fns.usda.gov/wic',
    renewal: 'Certification runs 6 months to a year depending on age, and it lapses silently. Diary the end date.',
  },
  {
    id: 'weatherization',
    topic: 'no-season',
    name: 'Free home weatherization',
    alsoCalled: 'WAP, weatherisation assistance',
    short: 'Free insulation, sealing and furnace repair — but a long waiting list.',
    what: 'Crews come out and insulate, seal, and fix or replace an unsafe furnace — free, and you keep the savings every month afterwards.',
    opens: null, closes: null, precision: 'exact',
    cadence: 'Apply any time — but expect a waiting list',
    prep: ['Proof of income', 'Your landlord’s written permission if you rent'],
    where: 'Your state weatherization agency, usually the same office as the energy bill help',
    link: 'https://www.energy.gov/scep/wap/weatherization-assistance-program',
    urgent: 'The list is long in most places — measured in months or years. Getting on it early is the whole game. Applying for heating bill help often puts you on this list too, so ask.',
  },
  {
    id: 'section8-waitlist',
    topic: 'no-season',
    name: 'Section 8 waiting lists',
    alsoCalled: 'Housing Choice Voucher, HCV, public housing list',
    short: 'Lists that open for a few days, sometimes years apart — be ready first.',
    what: 'Housing authorities open their waiting list for a few days, sometimes only once every several years. When it opens you often have under a week.',
    opens: null, closes: null, precision: 'varies',
    cadence: 'Unpredictable — by housing authority, sometimes years apart',
    watch: true,
    prep: [
      'Have your paperwork ready before it opens — IDs and birth certificates for everyone',
      'Income and where you live now',
      'An email address you actually check',
    ],
    urgent: 'This is the one to set an alert for. Some lists close in 48 hours. Sign up for notifications from every housing authority within reach, not just your own city.',
    where: 'Every public housing authority near you — apply to more than one',
    link: 'https://www.hud.gov/helping-americans/public-indian-housing/pha-contact-information',
  },
  {
    id: 'fema-individual-assistance',
    topic: 'no-season',
    name: 'Disaster help after a storm, fire or flood',
    alsoCalled: 'FEMA Individual Assistance, IA',
    short: 'Opens only on a federal disaster declaration, then runs about 60 days.',
    what: 'Money for somewhere to stay, repairs, and replacing what you lost. Only opens when your county gets a federal disaster declaration.',
    opens: null, closes: null, precision: 'exact',
    cadence: 'Only after a declaration — then usually a 60-day window',
    watch: true,
    prep: [
      'Photos of the damage before you clean up',
      'Your insurance policy and claim number',
      'Proof you lived there',
    ],
    urgent: 'The clock starts on the declaration date, not on the day of the storm. Sixty days is the standard window and it is easy to lose the first month waiting on an insurance decision — file with FEMA anyway, you can update it later.',
    where: 'DisasterAssistance.gov',
    link: 'https://www.disasterassistance.gov/',
  },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LH_TOPICS, LH_PROGRAMS };
}
