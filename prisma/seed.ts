// import { PrismaClient, TeamSection } from '@prisma/client'

// const prisma = new PrismaClient()

import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, TeamSection } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });


async function main() {
  await prisma.study.deleteMany()
  await prisma.teamMember.deleteMany()

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
        ethicsStatement:
          'Please refer to the official Human Nutrition Unit study page for ethics information.',
        isActive: true,
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
        ethicsStatement:
          'This study has received ethical approval from the Southern Health and Disability Ethics Committee (20/STH/51).',
        isActive: true,
        order: 2,
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
        ethicsStatement:
          'This study has received ethical approval from the NZ Southern Health and Disability Ethics Committee (21/STH/231).',
        isActive: true,
        order: 3,
      },
    ],
  })

  await prisma.teamMember.createMany({
    data: [
      {
        name: 'Dr Jennifer Miles Chan',
        title: 'Board of Directors',
        section: TeamSection.BoardOfDirectors,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        order: 1,
        isVisible: true,
      },
      {
        name: 'Prof Sally Poppitt',
        title: 'Board of Directors',
        section: TeamSection.BoardOfDirectors,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        order: 2,
        isVisible: true,
      },
      {
        name: 'Prof Garth Cooper',
        title: 'Board of Directors',
        section: TeamSection.BoardOfDirectors,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        order: 3,
        isVisible: true,
      },
      {
        name: 'Dr Ivana Sequeira',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        order: 1,
        isVisible: true,
      },
      {
        name: 'Dr Louise Lu',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        order: 2,
        isVisible: true,
      },
      {
        name: 'Mr Jack Penhaligan',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        order: 3,
        isVisible: true,
      },
      {
        name: 'Ms Julia Cree',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
        order: 4,
        isVisible: true,
      },
      {
        name: 'Mr Kok Hong Leiu',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
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
        order: 8,
        isVisible: true,
      },
      {
        name: 'Ms Niamh Brennan',
        title: 'Research Team',
        section: TeamSection.ResearchTeam,
        bio: 'TODO_REAL_BIO',
        photoPath: '/images/team/placeholder.jpg',
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
