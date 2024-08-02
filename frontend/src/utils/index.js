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
  1: "3b8HiS3Enjc3ZBqea4dxcs72qnEDiRKKukkqnDvxCXUw",
  5: "9f4hxhzswjy5YepaJK6a5RuBqqeu77mkRDSFi8VRJdXy",
  10: "CMhLePGCvggg7sijCWN6PNg4z1d6R5DenLzz1WF4AXdU",
  20: "BsZSVQrbZhuAar26LdCLscPMNtwKrkrrFQDd4womWn7r",
};

export const gemMetadataAccounts = {
  1: "aXrLyFwSmBTTP74pE9Rn1dtdKfDPbvomwWp8yYsh17b",
  5: "DskYccat6AiFT68BXW1hzq1qtQxiZiibEU52w7tesD6e",
  10: "92foV3B9Czz9Xe53tPoqu24mKpj1bGRJ9AihduQ9VUxM",
  20: "C69sERENUthQoGUdSsGtxNUqnAd7WzbHZGEYSysQJQ9t",
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
    address: "98BPJmU6ym7ER5kYdEWDC2L5LBBbktdZRmMk5C4d9gEK",
    metadataAccount: "EXLgDGN7FmRLm2dkyMFR5Yqq3kjtQfYcmJFcKDZmHyk7",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQEEA.json",
  },
  {
    name: "Free Drink",
    symbol: "GQFD",
    address: "HdoLKGdiDJvQ26aHLc2jBbdkQDPnZMB5pwTYb5cDoQ3",
    metadataAccount: "34qCiqWgA3grJWzLYUa7bSmp6NvYpXTt1RG93oXLEGcp",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQFD.json",
  },
  {
    name: "Free Snack",
    symbol: "GQFS",
    address: "C9i4aegzQXMrr6oAw6XE9Xroxd6uobGxyk4g376zsvsr",
    metadataAccount: "9w86Fq3MKRSkMx1dGSZVstoTvVUdxu678HWYY1iFvkKW",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQFS.json",
  },
  {
    name: "Gift Cap",
    symbol: "GQGC",
    address: "HxzgGAgg8t9mZNy8ikZ7bwkrh6ioUzZZS7hT1icYExTD",
    metadataAccount: "2EDzZ1zBB7HkhHAF72a7azTvpWD3gsUCqEno54Kowdg4",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQGC.json",
  },
  {
    name: "Gift Photo",
    symbol: "GQGP",
    address: "9RdusPFckgUYmdj8FgY5xkvxgcarxV5XeRc1nhWvRsfj",
    metadataAccount: "2WTvSehVgv4Hf6A8WNAqyw4Fu2kXHFK1Zf6acBq2aA3X",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQGP.json",
  },
  {
    name: "Gift Shop",
    symbol: "GQGS",
    address: "AfqbYBVDGjNvJ57EZwxXUc5pVsKsZJBxTcf5UR5cqhsr",
    metadataAccount: "EzXvACh5wowyTGFxdeCjQGiCZgu8jaWwhuKRcwvUwZZs",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQGS.json",
  },
  {
    name: "Skip the Line",
    symbol: "GQSKL",
    address: "CTWAZBCYnQfS3g7FwyzRBjJt5UqKM2GDAoYqq2h61Q7K",
    metadataAccount: "R8QDVogsfZrudc18Mj27cMAeV44X2zDrJN17Uix8oRx",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQSKL.json",
  },
  {
    name: "Gift T-shirt",
    symbol: "GQTS",
    address: "DDebtLSV6VNWLyHv7PUVkYFpe4tty7fFYxZSn8t5wAA8",
    metadataAccount: "DZLuxMVzCQAAnNrotM3o82k2GTaBLMLUqySndVciLbT",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQTS.json",
  },
  {
    name: "VIP Access",
    symbol: "GQVIP",
    address: "84wr3aMErvnFy47f2WTyS922bcCuoc5QQJbFkMBNeHmq",
    metadataAccount: "GPaZysdwa4Y6ZNrwBt5CGp9Af9Vr9fn7Zvji4QGzGgMg",
    uri: "ipfs://QmQd5AC6BMf7RLZQubVZ7kqkFLeffPWwhsERLVj2wXMbEX/GQVIP.json",
  },
];

export const ticketMetadata = {
  uri: "ipfs://QmeqjN9FsMiabCagjWftcuzAaxMiXFgV55Sre23EeF3wcY",
};
