** Metadata des Gems et NFTS **

Chaque gemme et nft est un fichier json invividuel, uploadé sur IPFS, en notant son adresse IPFS.

** Metadata des Gems et NFTs en json **

- Gems

```json


    "gem1.json": {
        "name": "Gem",
        "symbol": "GQ",
        "description": "A valuable gem used in the GemQuest.",
        "image": "ipfs://QmfDrAqbTh3iU2q3SYyBbGc3i4VsQtMeetfybAUEJ9NJne/gem1.webp",
        "attributes": [
            {
                "trait_type": "Value",
                "value": 1
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ]
        }
    },

    "gem5.json": {
        "name": "Gem",
        "symbol": "GQ",
        "description": "A valuable gem used in the GemQuest.",
        "image": "ipfs://QmfDrAqbTh3iU2q3SYyBbGc3i4VsQtMeetfybAUEJ9NJne/gem5.webp",
        "attributes": [
            {
                "trait_type": "Value",
                "value": 5
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ]
        }
    },

    "gem10.json": {
        "name": "Gem",
        "symbol": "GQ",
        "description": "A valuable gem used in the GemQuest.",
        "image": "ipfs://QmfDrAqbTh3iU2q3SYyBbGc3i4VsQtMeetfybAUEJ9NJne/gem10.webp",
        "attributes": [
            {
                "trait_type": "Value",
                "value": 10
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ]
        }
    },

    "gem20.json": {
        "name": "Gem",
        "symbol": "GQ",
        "description": "A valuable gem used in the GemQuest.",
        "image": "ipfs://QmfDrAqbTh3iU2q3SYyBbGc3i4VsQtMeetfybAUEJ9NJne/gem20.webp",
        "attributes": [
            {
                "trait_type": "Value",
                "value": 20
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ]
        }
    }

```

- Rewards NFTs

```json

    "GQSKL.json": {
        "name": "Skip the Line",
        "symbol": "GQSKL",
        "description": "Priority access to an attraction",
        "image": "ipfs://Qmbp36b5u1c2wokppUCS8angMygeb9S97GqYfwHTkgZoE3/skl.webp",
        "attributes": [
            {
                "trait_type": "Gem Cost",
                "value": "100"
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ],
            "gem_cost": 100
        }
    },
    "GQVIP.json": {
        "name": "VIP Access",
        "symbol": "GQVIP",
        "description": "Access to a VIP area",
        "image": "ipfs://Qmbp36b5u1c2wokppUCS8angMygeb9S97GqYfwHTkgZoE3/vip.webp",
        "attributes": [
            {
                "trait_type": "Gem Cost",
                "value": "150"
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ],
            "gem_cost": 150
        }
    },
    "GQGS.json": {
        "name": "Gift Shop",
        "symbol": "GQGS",
        "description": "Gift from the souvenir shop",
        "image": "ipfs://Qmbp36b5u1c2wokppUCS8angMygeb9S97GqYfwHTkgZoE3/giftshop.webp",
        "attributes": [
            {
                "trait_type": "Gem Cost",
                "value": "50"
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ],
            "gem_cost": 50
        }
    },
    "GQFD.json": {
        "name": "Free Drink",
        "symbol": "GQFD",
        "description": "Coupon for a free drink",
        "image": "ipfs://Qmbp36b5u1c2wokppUCS8angMygeb9S97GqYfwHTkgZoE3/drink.webp",
        "attributes": [
            {
                "trait_type": "Gem Cost",
                "value": "30"
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ],
            "gem_cost": 30
        }
    },
    "GQFS.json": {
        "name": "Free Snack",
        "symbol": "GQFS",
        "description": "Coupon for a free snack",
        "image": "ipfs://Qmbp36b5u1c2wokppUCS8angMygeb9S97GqYfwHTkgZoE3/snack.webp",
        "attributes": [
            {
                "trait_type": "Gem Cost",
                "value": "40"
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ],
            "gem_cost": 40
        }
    },
    "GQGP.json": {
        "name": "Gift Photo",
        "symbol": "GQGP",
        "description": "Photo with a character",
        "image": "ipfs://Qmbp36b5u1c2wokppUCS8angMygeb9S97GqYfwHTkgZoE3/photo.webp",
        "attributes": [
            {
                "trait_type": "Gem Cost",
                "value": "40"
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ],
            "gem_cost": 40
        }
    },
    "GQEEA.json": {
        "name": "Exclusive Event Access",
        "symbol": "GQEEA",
        "description": "Access to an exclusive event",
        "image": "ipfs://Qmbp36b5u1c2wokppUCS8angMygeb9S97GqYfwHTkgZoE3/event.webp",
        "attributes": [
            {
                "trait_type": "Gem Cost",
                "value": "300"
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ],
            "gem_cost": 300
        }
    },
    "GQTS.json": {
        "name": "Gift T-shirt",
        "symbol": "GQTS",
        "description": "Exclusive park t-shirt",
        "image": "ipfs://Qmbp36b5u1c2wokppUCS8angMygeb9S97GqYfwHTkgZoE3/tshirt.webp",
        "attributes": [
            {
                "trait_type": "Gem Cost",
                "value": "220"
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ],
            "gem_cost": 220
        }
    },
    "GQGC.json": {
        "name": "Gift Cap",
        "symbol": "GQGC",
        "description": "Exclusive park cap",
        "image": "ipfs://Qmbp36b5u1c2wokppUCS8angMygeb9S97GqYfwHTkgZoE3/cap.webp",
        "attributes": [
            {
                "trait_type": "Gem Cost",
                "value": "160"
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ],
            "gem_cost": 160
        }
    },

   // Contrairement aux autre, la metadata du ticket est variable concernant la date d'expiration du ticket et sera calculée et transmise par le front-end lors de l'achat.
   // Ce json n'est donc pas sur IPFS mais est généré par le front-end lors de l'achat.

    "Ticket.json" : {
        "name": "Park Entrance Ticket",
        "symbol": "GQPET",
        "description": "This NFT serves as an entrance ticket to the park. Valid for 48 hours after activation.",
        "image": "ipfs://QmdKCs5KQBZG2iU6SSLqSjpy98FS1Ca8aTciEKwnyo87QY",
        "attributes": [
            {
            "trait_type": "Type",
            "value": "Entrance Ticket"
            },
            {
            "trait_type": "Validity",
            "value": "until expiration-date-here"
            },
            {
            "trait_type": "Issued By",
            "value": "Park Authority"
            }
        ],
        "properties": {
            "creators": [
                {
                    "name": "GemQuest"
                }
            ],
            "category": "ticket"
        }
    }



```
