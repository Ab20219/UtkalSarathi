import re

with open('src/data/odishaHistoricalStories.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace any broken inscriptionsAndManuscripts between keyHistoricalFigures and qrCodeBadgeText
# For chilika:
chilika_insc = """    inscriptionsAndManuscripts: `Song & Ming Dynasty Chinese ceramic seal inscriptions discovered at Manikapatna (ASI Archives); Coin hoard of King Sahasamalla of Polonnaruwa, Sri Lanka (1200-1202 CE); Madala Panji palm-leaf records regarding Purushottama Deva's royal camp at Chilika (1476 CE); British Admiralty Chart No. 828: Approaches to Chilika Lake & False Point (1862)`,
    qrCodeBadgeText: 'ASI & NIO Maritime Archaeology Verified / Ramsar Wetland Site No. 229',"""

text = re.sub(
    r"inscriptionsAndManuscripts:[\s\S]*?qrCodeBadgeText:\s*'ASI & NIO Maritime Archaeology Verified / Ramsar Wetland Site No\. 229',",
    chilika_insc,
    text
)

# For raghurajpur:
raghu_insc = """    inscriptionsAndManuscripts: `Illustrated palm-leaf manuscripts of Jayadeva's Gita Govinda preserved in Raghurajpur family vaults; Madala Panji Palm-leaf sections defining the royal duties and grain allowances of Chitrakaras; Puri District Revenue Settlement Records for Mauza Raghurajpur (1898); Chitrakara Guild Genealogy Registers dating back fourteen generations`,
    qrCodeBadgeText: 'First Heritage Crafts Village of India (INTACH) / Birthplace of Odissi Renaissance',"""

text = re.sub(
    r"inscriptionsAndManuscripts:[\s\S]*?qrCodeBadgeText:\s*'First Heritage Crafts Village of India \(INTACH\) / Birthplace of Odissi Renaissance',",
    raghu_insc,
    text
)

with open('src/data/odishaHistoricalStories.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Inscriptions replaced successfully!")
