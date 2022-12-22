import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  // cleanup the existing database
  await prisma.message.deleteMany();
  await prisma.card.deleteMany();
  await prisma.card_template.deleteMany();
  await prisma.card_type.deleteMany();
  await prisma.user.deleteMany();

  // populate the database

  // card types
  const cardTypeBirthday = await prisma.card_type.create({
    data: {
      name: "Birthday",
    },
  });

  const cardTypeLeaving = await prisma.card_type.create({
    data: {
      name: "Leaving",
    },
  });

  const cardTypeBaby = await prisma.card_type.create({
    data: {
      name: "Baby",
    },
  });

  // card templates
  const cardTemplateBirthday = await prisma.card_template.create({
    data: {
      card_type_id: cardTypeBirthday.card_type_id,
      text: "Happy\nBirthday",
      text_css: '{ "color": "white" }',
      bg_css: '{ "backgroundColor": "black" }',
    },
  });

  const cardTemplateLeaving = await prisma.card_template.create({
    data: {
      card_type_id: cardTypeLeaving.card_type_id,
      text: "You're\ndead to us",
      text_css: '{ "color": "white" }',
      bg_css: '{ "backgroundColor": "#EF7D37" }',
    },
  });

  await prisma.card_template.create({
    data: {
      card_type_id: cardTypeLeaving.card_type_id,
      text: "Fine.\nGo.",
      text_css: '{ "color": "white" }',
      bg_css: '{ "backgroundColor": "#E75E53" }',
    },
  });

  await prisma.card_template.create({
    data: {
      card_type_id: cardTypeBaby.card_type_id,
      text: "Congrats\non your\nnew baby\nboy",
      text_css: '{ "color": "black" }',
      bg_css: `{ "background": "linear-gradient(45deg, #89cfef 45px, transparent 45px)64px 64px,linear-gradient(45deg, #89cfef 45px, transparent 45px,transparent 91px, #9dd9f3 91px, #9dd9f3 135px, transparent 135px),linear-gradient(-45deg, #89cfef 23px, transparent 23px, transparent 68px,#89cfef 68px,#89cfef 113px,transparent 113px,transparent 158px,#89cfef 158px)","backgroundColor": "#9dd9f3","backgroundSize": "128px 128px" }`,
    },
  });

  await prisma.card_template.create({
    data: {
      card_type_id: cardTypeBaby.card_type_id,
      text: "Congrats\non your\nnew baby\ngirl",
      text_css: '{ "color": "black" }',
      bg_css: `{ "background": "linear-gradient(45deg, #ffbec2 45px, transparent 45px)64px 64px,linear-gradient(45deg, #ffbec2 45px, transparent 45px,transparent 91px, #fdd4ce 91px, #fdd4ce 135px, transparent 135px),linear-gradient(-45deg, #ffbec2 23px, transparent 23px, transparent 68px,#ffbec2 68px,#ffbec2 113px,transparent 113px,transparent 158px,#ffbec2 158px)","backgroundColor": "#fdd4ce","backgroundSize": "128px 128px" }`,
    },
  });

  await prisma.card_template.create({
    data: {
      card_type_id: cardTypeBirthday.card_type_id,
      text: "Geez\nyou're old",
      text_css: '{ "color": "#049FA9" }',
      bg_css: '{ "backgroundColor": "white" }',
    },
  });

  // users
  const dummyEmail = "x@y.z";

  const dummyUser = await prisma.user.create({
    data: {
      email: dummyEmail,
    },
  });

  const email = "rachel@remix.run";

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  const user = await prisma.user.create({
    data: {
      email,
      email_verified: "Y",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  // sample card and messages
  const cardSample = await prisma.card.create({
    data: {
      hash: "sample",
      card_template_id: cardTemplateLeaving.card_template_id,
      user_id: dummyUser.user_id,
      from: "The Accounts Team",
      to: "Kerry",
      published_date: new Date(),
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardSample.card_id,
      from: "Joan",
      text: "Good luck Kerry, I don't know what we'll do without you! 😥",
      color: "#000",
      font: "Arial",
      image_url:
        "https://media.makeameme.org/created/why-you-do-bc6a3f01d0.jpg",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardSample.card_id,
      from: "Élise",
      text: "Sorry you're leaving Kerry, it's been great working with you and all the best for the future x",
      color: "#9C27B0",
      font: "Verdana",
      image_url: "https://media.giphy.com/media/fxe8v45NNXFd4jdaNI/giphy.gif",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardSample.card_id,
      from: "Rahul",
      text: "Kerry don't go! Seriously though, I will miss you. Good luck in all your future endevours",
      color: "#009688",
      font: "Courier New",
      image_url: "https://media.giphy.com/media/k61nOBRRBMxva/giphy.gif",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardSample.card_id,
      from: "Helene",
      text: "I will always remember our time together here, we will not lose touch! See you for a cocktail soon❣",
      color: "#E91E63",
      font: "Tahoma",
      image_url: "https://media.giphy.com/media/6PyrLt9Yh7cA0/giphy.gif",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardSample.card_id,
      from: "John",
      text: "Kerry you've been an incredible team member, I couldn't have asked for more. Your new company are lucky to have you. I hope you find what you are looking for in your new role.\n\nAll the best and don't be a stranger!",
      color: "#000",
      font: "Times New Roman",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardSample.card_id,
      from: "Vikki",
      text: "Good luck in your new job Kerry!",
      color: "#FF9800",
      font: "Georgia",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardSample.card_id,
      from: "Marek",
      text: "😉",
      color: "#795548",
      font: "Georgia",
      image_url: "https://media.giphy.com/media/cOPxABNkRN5DSvCq05/giphy.gif",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardSample.card_id,
      from: "Natalie",
      text: "It's been a pleasure working with you Kerry. Thanks for your insight and guidance and generally being an awesome manager! 😄",
      color: "#F44336",
      font: "Garamond",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardSample.card_id,
      from: "Lydia",
      text: "Good luck for the future Kerry!",
      color: "#607D8B",
      font: "Trebuchet MS",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardSample.card_id,
      from: "Kevin",
      text: "Kerry, I'm so sad you're leaving us, you've been such an amazing mentor. All the best in your new opportunity.",
      color: "#3F51B5",
      font: "Brush Script MT",
      image_url: "https://media.giphy.com/media/Kf25FA6kUy1UNQa7ZS/giphy.gif",
    },
  });

  // user card and messages
  const cardBirthday = await prisma.card.create({
    data: {
      hash: "123456789",
      card_template_id: cardTemplateBirthday.card_template_id,
      user_id: user.user_id,
      from: "Everyone",
      to: "Grandma",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardBirthday.card_id,
      from: "Little Bobby",
      text: "I love you grandma. You're the best friend a boy could ever have. Have a super day!",
      color: "#000",
      font: "Arial",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Heart_coraz%C3%B3n.svg/1200px-Heart_coraz%C3%B3n.svg.png",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardBirthday.card_id,
      from: "Big Bobby",
      text: "Happy Birthday Ma! ",
      color: "#000",
      font: "Arial",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Gadus_morhua_Cod-2b-Atlanterhavsparken-Norway.JPG/495px-Gadus_morhua_Cod-2b-Atlanterhavsparken-Norway.JPG",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardBirthday.card_id,
      from: "Grandpa Joe",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam placerat ipsum felis, in rutrum diam iaculis vel. Quisque id tortor nec lorem consequat imperdiet. Nullam faucibus scelerisque tempus. Nullam suscipit lectus at nunc scelerisque viverra. Aliquam placerat imperdiet diam, id luctus velit ornare non. Pellentesque euismod risus id ligula consequat, id dictum quam volutpat. In eleifend est.",
      color: "#f00",
      font: "Arial",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Congrats_bqt.jpg/330px-Congrats_bqt.jpg",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardBirthday.card_id,
      from: "The Postman",
      text: "Knock knock",
      color: "#00f",
      font: "Garamond",
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
