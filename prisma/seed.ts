import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  // cleanup the existing database
  await prisma.message.deleteMany();
  await prisma.color.deleteMany();
  await prisma.font.deleteMany();
  await prisma.card.deleteMany();
  await prisma.card_template.deleteMany();
  await prisma.card_type.deleteMany();
  await prisma.user.deleteMany();

  // populate the database
  const email = "rachel@remix.run";

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      user_id: user.user_id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      user_id: user.user_id,
    },
  });

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

  await prisma.card_template.create({
    data: {
      card_type_id: cardTypeLeaving.card_type_id,
      text: "Fine. Go.",
      text_css: '{ "color": "white" }',
      bg_css: '{ "backgroundColor": "#E75E53" }',
    },
  });

  await prisma.card_template.create({
    data: {
      card_type_id: cardTypeLeaving.card_type_id,
      text: "You're dead to us",
      text_css: '{ "color": "white" }',
      bg_css: '{ "backgroundColor": "#EF7D37" }',
    },
  });

  await prisma.card_template.create({
    data: {
      card_type_id: cardTypeBaby.card_type_id,
      text: "Congrats on your new baby boy",
      text_css: '{ "color": "black" }',
      bg_css: `{ "background": "linear-gradient(45deg, #89cfef 45px, transparent 45px)64px 64px,linear-gradient(45deg, #89cfef 45px, transparent 45px,transparent 91px, #9dd9f3 91px, #9dd9f3 135px, transparent 135px),linear-gradient(-45deg, #89cfef 23px, transparent 23px, transparent 68px,#89cfef 68px,#89cfef 113px,transparent 113px,transparent 158px,#89cfef 158px)","backgroundColor": "#9dd9f3","backgroundSize": "128px 128px" }`,
    },
  });

  await prisma.card_template.create({
    data: {
      card_type_id: cardTypeBaby.card_type_id,
      text: "Congrats on your new baby girl",
      text_css: '{ "color": "black" }',
      bg_css: `{ "background": "linear-gradient(45deg, #ffbec2 45px, transparent 45px)64px 64px,linear-gradient(45deg, #ffbec2 45px, transparent 45px,transparent 91px, #fdd4ce 91px, #fdd4ce 135px, transparent 135px),linear-gradient(-45deg, #ffbec2 23px, transparent 23px, transparent 68px,#ffbec2 68px,#ffbec2 113px,transparent 113px,transparent 158px,#ffbec2 158px)","backgroundColor": "#fdd4ce","backgroundSize": "128px 128px" }`,
    },
  });

  await prisma.card_template.create({
    data: {
      card_type_id: cardTypeBirthday.card_type_id,
      text: "Geez you're old",
      text_css: '{ "color": "#049FA9" }',
      bg_css: '{ "backgroundColor": "white" }',
    },
  });

  const cardTemplateBirthday = await prisma.card_template.create({
    data: {
      card_type_id: cardTypeBirthday.card_type_id,
      text: "Happy Birthday",
      text_css: '{ "color": "white" }',
      bg_css: '{ "backgroundColor": "black" }',
    },
  });

  const cardBirthday = await prisma.card.create({
    data: {
      hash: "123456789",
      card_template_id: cardTemplateBirthday.card_template_id,
      user_id: user.user_id,
      from: "Everyone",
      to: "Grandma",
    },
  });

  const colorBlue = await prisma.color.create({
    data: {
      name: "blue",
      hex: "#2962FF",
    },
  });

  const colorRed = await prisma.color.create({
    data: {
      name: "red",
      hex: "#FF0807",
    },
  });

  const colorBlack = await prisma.color.create({
    data: {
      name: "black",
      hex: "#000",
    },
  });

  const fontOxygen = await prisma.font.create({
    data: {
      name: '"Oxygen"',
    },
  });

  const fontArial = await prisma.font.create({
    data: {
      name: '"Arial"',
    },
  });

  const fontHelvetica = await prisma.font.create({
    data: {
      name: '"Helvetica"',
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardBirthday.card_id,
      from: "Little Bobby",
      text: "I love you grandma. You're the best friend a boy could ever have. Have a super day!",
      color_id: colorBlue.color_id,
      font_id: fontOxygen.font_id,
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Heart_coraz%C3%B3n.svg/1200px-Heart_coraz%C3%B3n.svg.png",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardBirthday.card_id,
      from: "Big Bobby",
      text: "Happy Birthday Ma! ",
      color_id: colorBlack.color_id,
      font_id: fontArial.font_id,
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Gadus_morhua_Cod-2b-Atlanterhavsparken-Norway.JPG/495px-Gadus_morhua_Cod-2b-Atlanterhavsparken-Norway.JPG",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardBirthday.card_id,
      from: "Grandpa Joe",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam placerat ipsum felis, in rutrum diam iaculis vel. Quisque id tortor nec lorem consequat imperdiet. Nullam faucibus scelerisque tempus. Nullam suscipit lectus at nunc scelerisque viverra. Aliquam placerat imperdiet diam, id luctus velit ornare non. Pellentesque euismod risus id ligula consequat, id dictum quam volutpat. In eleifend est.",
      color_id: colorRed.color_id,
      font_id: fontHelvetica.font_id,
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Congrats_bqt.jpg/330px-Congrats_bqt.jpg",
    },
  });

  await prisma.message.create({
    data: {
      card_id: cardBirthday.card_id,
      from: "The Postman",
      text: "Knock knock",
      color_id: colorBlue.color_id,
      font_id: fontArial.font_id,
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
