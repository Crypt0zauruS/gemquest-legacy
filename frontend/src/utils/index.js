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

export const gemAddresses = {
  1: "2csGKZfnTDemaT7csPuEWpBmezvPStRMotKPbLWyNS9o",
  5: "8qRnVeFS4fnX5d6m6Xaev9Ax83XFdNz7rMXrQQZFFXN8",
  10: "GygDXa7heuXc2KT3tmH3dJswmLVvRdh7kVW6NmzNuG7y",
  20: "BELA8zj35Yc2T349tUhUXcqfmpCws1LjKRSAYRr3eVv",
};

export const gemMetadataAccounts = {
  1: "AL5orEp9scDT7yPhbSRhed4yoUNth95WC1dia21vDkFg",
  5: "A9PyKT4GdyMJqUABgZ6nhsZ3mPLpkyjmczQmwwpyFkz7",
  10: "6qYM7s4PStSYtSA531p1WJ66WLcxz2EVf7tHRtaSp87x",
  20: "26KMMUU7AyQGhXWbmGHpofMQzzhZ6MRDzUmWPjmKW1sd",
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
    address: "396yRwPmeF7gjXknCWhpnSW6WKK4bKHGjTVnpLwPWHWj",
    metadataAccount: "5odu6ib22V3bwxyi4cnVuCeBSstx9Mi429hL4Rg22ovK",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQEEA.json",
  },
  {
    name: "Free Drink",
    symbol: "GQFD",
    address: "EzeEV9mZioRugfBq6cXKQp86Rfo8az7GCbAycy8KujEP",
    metadataAccount: "SDm8FTEQrkd9bCxnECoUnXEtEYvwNfvcd2wEEbHptyb",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQFD.json",
  },
  {
    name: "Free Snack",
    symbol: "GQFS",
    address: "2YaqMWHTMTSp4vx73bW4LgJvtTF8raR6EAEgxtYHa9xb",
    metadataAccount: "GfLoz3AWeWYZzjJKQVrCNc9mzTSYgkA1LJGPaehw6ag6",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQFS.json",
  },
  {
    name: "Gift Cap",
    symbol: "GQGC",
    address: "AYg5tebF3UyB9CtpSyu5CdBi6Wx1Hd7NddqZ2pBTVqGf",
    metadataAccount: "BA9Zscgdwed7cX52vQWBTtMVmmD5K91mUpksuNZhZsX7",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQGC.json",
  },
  {
    name: "Gift Photo",
    symbol: "GQGP",
    address: "4NuKUQDcHDK3AkiYp6mJwdco5K5yGcq6G7Bmcr3qrFGS",
    metadataAccount: "F1LeTjr8BUxYaQAuTpYfVg3FPTaR5e68sNeCnFPpkJUm",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQGP.json",
  },
  {
    name: "Gift Shop",
    symbol: "GQGS",
    address: "ALaoigLzTmd9UTVLFAGHSe7JcEFwMETFhYYXFyhUvTcx",
    metadataAccount: "4jxWiy8Smf7WHWavmMXEC5DswX9amhK3Lvs8s2XgPnrZ",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQGS.json",
  },
  {
    name: "Skip the Line",
    symbol: "GQSKL",
    address: "HcBwCCj751uAbnkrnnVrvotucqeuhvZzqZEiiCpS5nCQ",
    metadataAccount: "An7YZX7dyxLLdbvcZYc4uwUycywEh4GKvCetXWmRmzB4",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQSKL.json",
  },
  {
    name: "Gift T-shirt",
    symbol: "GQTS",
    address: "9EAUDVWT5WzDyVMv6N6nauVaBWbKHGEGMueHfy66odAs",
    metadataAccount: "5w468xZw3XKwXcqryVgFGr3BYEXxRyKVHemDiHPqEqLk",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQTS.json",
  },
  {
    name: "VIP Access",
    symbol: "GQVIP",
    address: "5wvGJtfqiVMK7PzU77n6mwRZhAc6Ks5rVJ37i2dZReTs",
    metadataAccount: "5C7brvYyE34714pZ5D4CxvXXMzSN6rTr1BGdvoG8zSAG",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQVIP.json",
  },
];

export const ticketMetadata = {
  uri: "ipfs://QmeqjN9FsMiabCagjWftcuzAaxMiXFgV55Sre23EeF3wcY",
};
