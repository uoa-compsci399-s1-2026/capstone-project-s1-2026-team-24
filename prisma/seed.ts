// import { PrismaClient, TeamSection } from '@prisma/client'

// const prisma = new PrismaClient()

import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, TeamSection } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function getTeamMemberByName(name: string) {
  return prisma.teamMember.findFirst({
    where: { name },
  });
}

async function main() {
  await prisma.publicationAuthor.deleteMany()
  await prisma.publication.deleteMany()
  await prisma.publicationCategory.deleteMany()
  await prisma.study.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.contactRecipient.deleteMany()

  await prisma.study.createMany({
    data: [
      {
        slug: 'nz-synergy',
        title: 'NZ Synergy Study',
        shortDescription:
          'A 2-week residential nutrition study for adults with elevated fasting blood sugar.',
        fullDescriptionEn:
          'The NZ Synergy Study is a residential nutrition intervention study for adults with elevated fasting blood sugar. Participants stay for 2 weeks in the Human Nutrition Unit and follow a controlled dietary protocol.',
        fullDescriptionZh:
          'NZ Synergy Study 是一项为期两周的住院营养干预研究，面向空腹血糖偏高的成年人。参与者将在 Human Nutrition Unit 住宿两周，并按照受控饮食方案完成研究。',
        eligibilityEn:
          'Chinese or European Caucasian adults aged 18-60 years with elevated fasting blood sugar and BMI 24-40.',
        eligibilityZh:
          '招募18至60岁、空腹血糖偏高、BMI为24至40的华人或欧洲裔高加索成年人。',
        compensationEn:
          'Please refer to the official Human Nutrition Unit study page for compensation details.',
        compensationZh:
          '补偿信息请参阅 Human Nutrition Unit 官方研究页面。',
        redcapUrl: 'https://hnu-auckland.webflow.io/about/join-nz-synergy-study-can-yu-xin-xi-lan-xie-tong-ying-yang-yan-jiu',
        contactEmail: 'HNU_SYNERGY@auckland.ac.nz',
        contactPhone: ' 02109195443',
        contactPhoneZh: '02109196703',
        imagePath: '/services-and-expertise.jpg',
        ethicsStatement:
          'This study has received ethical approval from the Southern Health and Disability Ethics Committee (20/STH/51).',
        isActive: true,
        status: 'Recruiting',
        category: '',
        order: 1,
      },
      {
        slug: 'ferdinand',
        title: 'Ferdinand Study',
        shortDescription:
          'A 6-month weight loss study involving feijoa powder, HNU visits, and a Cambridge diet.',
        fullDescriptionEn:
          'The Ferdinand Study is a 6-month weight loss study involving feijoa powder, 7 HNU visits, the Cambridge diet, and Auckland-based participation.',
        fullDescriptionZh:
          'Ferdinand Study 是一项为期6个月的减重研究，内容包括费约果粉、7次 HNU 访问、Cambridge 饮食计划，并面向奥克兰地区参与者。',
        eligibilityEn:
          'Auckland-area participants suitable for a 6-month weight loss intervention. Please refer to the official study page for full eligibility criteria.',
        eligibilityZh:
          '面向奥克兰地区、适合参与6个月减重干预的参与者。完整纳入标准请参阅官方研究页面。',
        compensationEn:
          'Please refer to the official Human Nutrition Unit study page for compensation details.',
        compensationZh:
          '补偿信息请参阅 Human Nutrition Unit 官方研究页面。',
        redcapUrl: 'TODO_REAL_REDCAP_URL',
        contactEmail: 'FERDINAND@auckland.ac.nz',
        contactPhone: '09 923 4567',
        contactPhoneZh: '09 923 4567',
        imagePath: '/feijoa.jpg',
        ethicsStatement:
          'This study has received ethical approval from the Auckland Health Research Ethics Committee (2022 EXP 12032).',
        isActive: true,
        status: 'Recruiting',
        category: '',
        order: 3,
      },
      {
        slug: 'food-beverage',
        title: 'NZ Food & Beverage Study',
        shortDescription:
          'A short-term metabolism study involving 1 screening visit and 2 study visits.',
        fullDescriptionEn:
          'The NZ Food & Beverage Study is a short-term metabolism study involving 1 screening visit and 2 study visits.',
        fullDescriptionZh:
          'NZ Food & Beverage Study 是一项短期代谢研究，包括1次筛查访问和2次研究访问。',
        eligibilityEn:
          'European Caucasian or Asian Chinese adults. Please refer to the official study page for full eligibility criteria.',
        eligibilityZh:
          '招募欧洲裔高加索或亚裔华人成年人。完整纳入标准请参阅官方研究页面。',
        compensationEn:
          'Please refer to the official Human Nutrition Unit study page for compensation details.',
        compensationZh:
          '补偿信息请参阅 Human Nutrition Unit 官方研究页面。',
        redcapUrl: 'https://www.hnu.auckland.ac.nz/nz-food-and-beverage-study',
        contactEmail: 'HNU_SYNERGY@auckland.ac.nz',
        contactPhone: '02109195443',
        contactPhoneZh: '021196703',
        imagePath: '/food-bev.jpg',
        ethicsStatement:
          'This study has received ethical approval from the NZ Southern Health and Disability Ethics Committee (21/STH/231).',
        isActive: true,
        status: 'Recruiting',
        category: '',
        order: 2,
      },
    ],
  })

  await prisma.contactRecipient.createMany({
    data: [
      { category: 'Study Participant Enquiry', email: 'TODO_PARTICIPANT@auckland.ac.nz' },
      { category: 'Industry Partnership', email: 'TODO_PARTNERSHIPS@auckland.ac.nz' },
      { category: 'Internship or PhD Opportunity', email: 'TODO_STUDENTS@auckland.ac.nz' },
      { category: 'Donation', email: 'TODO_DONATIONS@auckland.ac.nz' },
      { category: 'General Enquiry', email: 'TODO_GENERAL@auckland.ac.nz' },
      { category: 'Other', email: 'TODO_GENERAL@auckland.ac.nz' },
    ],
  })

  await prisma.teamMember.createMany({
    data: [
      {
        name: "Dr Jennifer Miles Chan",
        title: "Board of Directors",
        section: TeamSection.BoardOfDirectors,
        bio: "TODO_REAL_BIO",
        photoPath: "/images/team/placeholder.jpg",
        // orcidId: "0000-0003-2050-7709",
        order: 1,
        isVisible: true,
      },
      {
        name: 'Prof Sally Poppitt',
        title: 'Board of Directors',
        section: TeamSection.BoardOfDirectors,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        orcidId: "0000-0002-2214-8378",
        order: 2,
        isVisible: true,
      },
      {
        name: 'Prof Garth Cooper',
        title: 'Board of Directors',
        section: TeamSection.BoardOfDirectors,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        orcidId: "0000-0001-5241-3163",
        order: 3,
        isVisible: true,
      },
      {
        name: 'Dr Ivana Sequeira',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        orcidId: "0000-0001-5414-9925",
        order: 1,
        isVisible: true,
      },
      {
        name: 'Dr Louise Lu',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        orcidId: "0000-0001-5147-6007",
        order: 2,
        isVisible: true,
      },
      {
        name: 'Mr Jack Penhaligan',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        orcidId: "0000-0001-8488-4138",
        order: 3,
        isVisible: true,
      },
      {
        name: 'Ms Julia Cree',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        orcidId: "0000-0002-3926-1510",
        order: 4,
        isVisible: true,
      },
      {
        name: 'Mr Kok Hong Leiu',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        orcidId: "0000-0002-1247-1403",
        order: 5,
        isVisible: true,
      },
      {
        name: 'Ms Theresa Alipia',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        order: 6,
        isVisible: true,
      },
      {
        name: 'Ms Shakeela Jayasinghe',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        order: 7,
        isVisible: true,
      },
      {
        name: 'Dr William Zhu',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        orcidId: "0000-0001-5121-1025",
        order: 8,
        isVisible: true,
      },
      {
        name: 'Ms Niamh Brennan',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        orcidId: "0009-0009-5769-2996",
        order: 9,
        isVisible: true,
      },
      {
        name: 'Mr Saril Vaid',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        order: 10,
        isVisible: true,
      },
      {
        name: 'Ms Natalie Radich',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        order: 11,
        isVisible: true,
      },
    ],
  })
  await prisma.publicationCategory.createMany({
    data: [
      { name: "Metabolism", order: 1 },
      { name: "Clinical Trials", order: 2 },
      { name: "Nutrition", order: 3 },
    ],
  })

  const metabolismCategory = await prisma.publicationCategory.findUnique({
    where: { name: "Metabolism" },
  })

  const clinicalTrialsCategory = await prisma.publicationCategory.findUnique({
    where: { name: "Clinical Trials" },
  })

  const nutritionCategory = await prisma.publicationCategory.findUnique({
    where: { name: "Nutrition" },
  })

  const jennifer = await getTeamMemberByName("Dr Jennifer Miles Chan")
  const sally = await getTeamMemberByName("Prof Sally Poppitt")

  if (!metabolismCategory || !clinicalTrialsCategory || !nutritionCategory) {
    throw new Error("Publication categories were not created correctly.")
  }

  if (!jennifer || !sally) {
    throw new Error("Required team members for publication seed were not found.")
  }

  const publication1 = await prisma.publication.create({
    data: {
      title: "Sample HNU Publication: Dietary interventions and metabolic health outcomes",
      authorsRaw: "Jennifer Miles-Chan, Sally Poppitt",
      journal: "Journal of Human Nutrition Research",
      year: 2026,
      pubType: "Journal Article",
      url: "https://example.com/publication-1",
      abstract:
        "This sample publication record is seeded locally to test the HNU research archive page and publication card layout.",
      affiliation: "Human Nutrition Unit, University of Auckland",
      sourceType: "SEED",
      sourceId: "seed-publication-1",
      orcidSource: "0000-0003-0313-7048",
      status: "Pending",
      isVisible: true,
      hiddenManually: false,
      matchedKeywords: "dietary, metabolic, nutrition",
      lastSyncedAt: new Date(),
      categoryId: metabolismCategory.id,
    },
  })

  const publication2 = await prisma.publication.create({
    data: {
      title: "Sample HNU Publication: Nutrition trial design in controlled residential settings",
      authorsRaw: "Jennifer Miles-Chan",
      journal: "Clinical Nutrition Methods",
      year: 2025,
      pubType: "Review",
      url: "https://example.com/publication-2",
      abstract:
        "This is a second sample publication used to verify filtering, ordering, and rendering on the research page.",
      affiliation: "Human Nutrition Unit, University of Auckland",
      sourceType: "SEED",
      sourceId: "seed-publication-2",
      orcidSource: "0000-0003-0313-7048",
      status: "Pending",
      isVisible: true,
      hiddenManually: false,
      matchedKeywords: "trial, nutrition, residential",
      lastSyncedAt: new Date(),
      categoryId: clinicalTrialsCategory.id,
    },
  })

  const publication3 = await prisma.publication.create({
    data: {
      title: "Sample HNU Publication: Appetite regulation and body composition in nutrition studies",
      authorsRaw: "Sally Poppitt",
      journal: "Nutrition and Metabolism Review",
      year: 2024,
      pubType: "Journal Article",
      url: "https://example.com/publication-3",
      abstract:
        "This sample publication helps test multiple years, categories, and author display in the publications archive.",
      affiliation: "Human Nutrition Unit, University of Auckland",
      sourceType: "SEED",
      sourceId: "seed-publication-3",
      status: "Pending",
      isVisible: true,
      hiddenManually: false,
      matchedKeywords: "appetite, body composition, nutrition",
      lastSyncedAt: new Date(),
      categoryId: nutritionCategory.id,
    },
  })

  await prisma.publicationAuthor.createMany({
    data: [
      {
        publicationId: publication1.id,
        teamMemberId: jennifer.id,
        order: 1,
      },
      {
        publicationId: publication1.id,
        teamMemberId: sally.id,
        order: 2,
      },
      {
        publicationId: publication2.id,
        teamMemberId: jennifer.id,
        order: 1,
      },
      {
        publicationId: publication3.id,
        teamMemberId: sally.id,
        order: 1,
      },
    ],
  })

  console.log('Seed completed successfully.')
}


main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
