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

  await prisma.card_type.create({
    data: {
      name: "Leaving",
    },
  });

  await prisma.card_type.create({
    data: {
      name: "Baby",
    },
  });

  const cardTemplateBirthday = await prisma.card_template.create({
    data: {
      card_type_id: cardTypeBirthday.card_type_id,
      text: "Happy Birthday!",
      text_css: "{ color: white }",
      bg_css: "{ background_color: black }",
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
