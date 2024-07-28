export const sciFiThemes = [
  "Star Trek",
  "Stargate",
  "Battlestar Galactica",
  "Star Wars",
  "The Expanse",
  "Doctor Who",
  "Babylon 5",
  "Farscape",
  "Firefly",
  "Dune",
  "Blade Runner",
  "The Matrix",
  "Terminator",
  "Alien",
  "Predator",
  "X-Files",
  "Black Mirror",
  "Westworld",
];

export const generateQuizPrompt = (theme, difficulty) => `
Generate an ${difficulty} level quiz on the theme "${theme}" with the following structure. Make sure that the expert level questions are extremely difficult and challenging, requiring deep knowledge of the subject:
{
  provider: "OpenAI",
  topic: "${theme} Quiz with an ${difficulty} difficulty powered by OpenAI",
  quizz: {
    ensign: [
      {
        id: 0,
        question: "Question 1?",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: "Randomly select one of the options"
      },
      {
        id: 1,
        question: "Question 2?",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: "Randomly select one of the options"
      },
      {
        id: 2,
        question: "Question 3?",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: "Randomly select one of the options"
      }
    ],
    captain: [
      {
        id: 0,
        question: "Question 1?",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: "Randomly select one of the options"
      },
      {
        id: 1,
        question: "Question 2?",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: "Randomly select one of the options"
      },
      {
        id: 2,
        question: "Question 3?",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: "Randomly select one of the options"
      }
    ],
    admiral: [
      {
        id: 0,
        question: "Question 1?",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: "Randomly select one of the options"
      },
      {
        id: 1,
        question: "Question 2?",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: "Randomly select one of the options"
      },
      {
        id: 2,
        question: "Question 3?",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: "Randomly select one of the options"
      }
    ]
  }
}`;

export const messageToSign = `
By signing this message, you acknowledge and agree to the following:
You can earn Gems by participating in quizzes while waiting in lines at the amusement park. These Gems can be exchanged for reward NFTs.
Reward NFTs offer perks like Skip the Line passes, VIP access, free drinks, snacks, and exclusive merchandise.
You can purchase entry tickets and other items on the GemQuest Marketplace.
Legal Disclaimer:
The developers of GemQuest are not responsible for any losses incurred during the use of the platform.
All transactions are final and non-refundable.
Ensure the security of your wallet and private keys; the developers are not liable for any unauthorized access.
By signing below, you accept and understand these terms.`;

export const ipfsGateway =
  "https://fuchsia-varying-camel-696.mypinata.cloud/ipfs/";

// export const tokenMetadataProgramId =
//   "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

export const gemAddresses = {
  1: "B1t4uindEMxgqdszyYudu67dyS1msLMUF2we6MtNuLYh",
  5: "B6hqcKNKMUndc4VrzaNXB2GTr69EoCahEMKBhqh7sigy",
  10: "4GCespa2Q59DWD11bD7jGYbxCBrrvT6Qzqu1yrU8rbab",
  20: "5PsQy97KM1GGqG8x2cwjAaRvK37ym2gLmbYL9VYvBaYk",
};

export const gemMetadataAccounts = {
  1: "FFkYTNrf7RLA316p4PiGDCB89YsqoymtYFZznuZbucgf",
  5: "5ETivvVdhe8bSYPpfvXwTUfjNvGHdeUBMSRA3UVrkqxf",
  10: "EzwefMvbkq735Y9DLF4nPZjdZwWPpnApK77qKEEgbEm9",
  20: "13q26GNr6UsWjGz7QnPe5Pt3HNq2i6NUwpWUmyKeHL1e",
};

export const gemTypes = [
  { type: "gem20", value: 20 },
  { type: "gem10", value: 10 },
  { type: "gem5", value: 5 },
  { type: "gem1", value: 1 },
];

export const nftMetadata = [
  {
    name: "Exclusive Event Access",
    symbol: "GQEEA",
    address: "4heQrW7GdmUaioww4mZuSEcji2r7YsEa5UaDEuBRerSU",
    metadataAccount: "EgMi2dL1yQPFSLAjUzSbnQ1x9FaHz1ExKV3h6xoQpWcE",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQEEA.json",
  },
  {
    name: "Free Drink",
    symbol: "GQFD",
    address: "BhNdywXffyqKCtFVo9p7icikw7tp3BARh6ZLwagyCdRK",
    metadataAccount: "5rWELAbKvvj4XP43JjebDKGM8w8ZgpbGSdnDjL55fN1Z",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQFD.json",
  },
  {
    name: "Free Snack",
    symbol: "GQFS",
    address: "9biwRkbdaVjxgCqLdVxAN69W61P7kY3Y37hng9c1qAWJ",
    metadataAccount: "6mWgX99efocqrjCKk8bXoGHMAcxuN6qjfMUL9b94pf9c",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQFS.json",
  },
  {
    name: "Gift Cap",
    symbol: "GQGC",
    address: "EG8LvCfAZedZdxeQ92MJ8aK4bMiN76qouzHobBLcCbn3",
    metadataAccount: "3v9z4XRJiRpWDXpniGAohFJvtrf5gCtGERFvQxzXofFV",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQGC.json",
  },
  {
    name: "Gift Photo",
    symbol: "GQGP",
    address: "fuu585HUSa14CU5G9j8r265pifK3MGQ8342egsr6mZZ",
    metadataAccount: "31ZHRQr3Cyw64DeothNNmEPFxan2suCe7s7xJWurMUwd",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQGP.json",
  },
  {
    name: "Gift Shop",
    symbol: "GQGS",
    address: "DPZrWg4HMjjoUeQe8KfDp4TnvR2EnLEX1EZkuqyFqF8Q",
    metadataAccount: "EcEk6Rr5s2eS54J3NqEkE1a6hA3ECFkptqn9cJyruqt1",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQGS.json",
  },
  {
    name: "Skip the Line",
    symbol: "GQSKL",
    address: "HYnMHhVgqopUnjv25QGMPDQBFf9TxXFWqqpSuF3EBjnm",
    metadataAccount: "FV5UPDV5rvrF9TkHgvGtGDFXNWvXV7KSVzvWBj9kPziZ",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQSKL.json",
  },
  {
    name: "Gift T-shirt",
    symbol: "GQTS",
    address: "DdPNWA9acoAZfkHHKCWG3GRdLikT5GQDhpfrQDUeY16e",
    metadataAccount: "7KhFaPSdAMef7ykoYFrAhxRr4PFZ9quLtSwVtbLmZVp4",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQTS.json",
  },
  {
    name: "VIP Access",
    symbol: "GQVIP",
    address: "8DQc65zbdWnqogCefH3gao2XTdrpkeYUxhdYv7C8Ev4U",
    metadataAccount: "AB2f8ebeXtn2hFtg1TLJL8GdnNjb4pRdpKuynAJEAzCF",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQVIP.json",
  },
];
