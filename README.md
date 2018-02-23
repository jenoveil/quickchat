# quickchat
Send chat messages on skill cast to party/raid, and send skill cooldown notices. Fully customizable ingame, can add/modify/remove entries using command (/8) chat.

## Commands

Use /8 quickchat |cmd| |arg list|

- |on/off| - Toggle enable/disable module
- |flags| |tag| - Toggle specific quickchats on skills
- |raid| - Toggle message send to party or send to raid.
- |cdNotice| - Toggle skill cooldown party messages.
- |addmode| - Used with |add|, saves the ID of next skill cast.
- |add| |"skillName"| |tag| |"msg"| - Used with |addmode|, creates a new entry for quick chat on a skill. Use quotations around skillName and msg to save multiple word strings.
- |set| |tag| |"msg"| - Change the quickchat message of an existing skill. Use quotations around msg for multiple word string.
- |remove| |tag| - Remove entry for quick chat on a skill.

## Known Issues

- Certain skills from different classes share IDs and will pop the wrong message

## Todo

- Find a way to fix that one issue above
- Add a feature to use more than one message for a particular skill, true quick chat RNG
- Add toggle for cd notice on individual skills
