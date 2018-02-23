const Command = require('command');
const [fs, path] = [require("fs"), require("path")];
const dataPath = path.join(__dirname, "data.json");
const configPath = path.join(__dirname, "config.json");

module.exports = function quickchat(dispatch) {

  const command = Command(dispatch);
  let lastSkillUsed = null,
  addMode = false,
  skilltoAdd = null,
  configTimer = null,
  dataTimer = null,
  config = null,
  data = null;

  try {

    data = require('./data.json');
    config = require('./config.json');

  } catch (e) { console.log(e); }

  // Skill Hook
  /* dispatch.hook('C_PRESS_SKILL', 1, (event) => {
    if (!addMode) return;
    skilltoAdd = event.skill;
    console.log('skilltoAdd set to ' + skilltoAdd);
    addMode = false;
  }); */
  dispatch.hook('C_START_SKILL', 1, (event) => {
    if (!config.enabled) return;
    if (addMode) {
      skilltoAdd = event.skill;
      console.log('skilltoAdd set to ' + skilltoAdd);
      addMode = false;
    }
    if (event.skill in data) {
      lastSkillUsed = event.skill;
      sendMessage(data[event.skill].msg);
    }
  });
  // Cooltime hook
  dispatch.hook('S_START_COOLTIME_SKILL', 1, (event) => {

    if (!config.enabled) return;
    if (!config.cdNotice) return;
    skill = event.skill, cooldown = event.cooldown;
    if (skill in data) {
      if (event.skill == lastSkillUsed) sendCDmsg(skill, cooldown); // prevent cases like GS/AR shared cooldown messing up notices
    }

  });

  //  use setTimeout to time down and call skill cd at set intervals (30s, 10s, 5s)
  function sendCDmsg(skill,cd) {

    if (!config.enabled) return;
    cd = parseInt(cd);
    if (cd <= 0) return;

    msg1 = data[skill].name + " cd up in 30s";
    msg2 = data[skill].name + " cd up in 10s";
    msg3 = data[skill].name + " cd up in 5s";

    if (cd >= 30000) {
      timer1 = cd - 30000;
      timer2 = cd - 10000;
      timer3 = cd - 5000;
      //setTimeout(function() { sendMessage(msg1); }, timer1);
      setTimeout(sendMessage, timer1, msg1);
      //setTimeout(function() { sendMessage(msg2); }, timer2);
      setTimeout(sendMessage, timer2, msg2);
      //setTimeout(function() { sendMessage(msg3); }, timer3);
      setTimeout(sendMessage, timer3, msg3);
    } else if (cd >= 10000) {
      timer2 = cd - 10000;
      timer3 = cd - 5000;
      //setTimeout(function() { sendMessage(msg2); }, timer2);
      setTimeout(sendMessage,timer2, msg2);
      //setTimeout(function() { sendMessage(msg3); }, timer3);
      setTimeout(sendMessage, timer3, msg3);
    } else if (cd >= 5000) {
      timer3 = cd - 5000;
      //setTimeout(function() { sendMessage(msg3); }, timer3);
      setTimeout(sendMessage, timer3, msg3);
    }

  }

  // Chat Hook
  /**************************************************************************/
  command.add('quickchat', (setting, ...value) => {

    switch (setting) {

      /**********************************************************************/
      case "on":
        enabled = true;
        saveConfig();
        command.message('Quickchat ' + (enabled ? 'enabled' : 'disabled') + '.');
        break;
      /**********************************************************************/
      case "off":
        enabled = false;
        saveConfig();
        command.message('Quickchat ' + (enabled ? 'enabled' : 'disabled') + '.');
        break;
      /**********************************************************************/
      case "flags": // TODO: REBUILD CHAT HOOK
        if (value[0] == (null)) {
          command.message('Syntax: |quickchat| |flags| |tag| - Toggle quickchat messages for individual skills.');
          break;
        }
        let flagFound = false;
        for (key in data) {
          if (value[0] == (data[key].tag)) {
            data[key].flag = !data[key].flag;
            saveData();
            command.message('Quickchat on ' + data[key].name + (data[key].flag ? ' enabled' : ' disabled') + '.');
            flagFound = true;
            break;
          }
        }
        if (!flagFound) {
          command.message('Skill tag not found. Consult data.json');
          command.message('Syntax: |quickchat| |flags| |tag| - Toggle quickchat messages for individual skills.');
        }
        break;
      /**********************************************************************/
      case "addmode":
        addMode = true;
        command.message('Add mode enabled. First skill you press will set the skill to be added with add cmd.');
        break;
      /**********************************************************************/
      case "add": // TODO
        if (skilltoAdd == null) {
          command.message('Syntax: |add| \"skillName\" |tag| \"msg\" - Press the skill you want to attach, and use this command. Use quotations around skillName and msg.');
          break;
        }
        if (value != null && value.length < 3) {
          command.message('Error: Missing arguments for adding skill. See syntax below.');
          command.message('Syntax: |add| \"skillName\" |tag| \"msg\" - Press the skill you want to attach, and use this command. Use quotations around skillName and msg.');
          break;
        }
        for (key in data) {
          if (key == skilltoAdd) {
            command.message('Skill ID already exists in data.json. No skill entry added.');
            break;
          }
        }
        try {
          console.log(value[0] + " " + value[1] + " " + value[2]);
          data[skilltoAdd] = {
            "name": value[0],
            "flag": true,
            "tag": value[1],
            "msg": value[2]
          }
          saveData();
          command.message("Skill added to quickchat: " + data[skilltoAdd].name);
        } catch (e) { console.error("Error adding skill data. ", e); }
        addMode = false; // Reset add mode for skills
        skilltoAdd = null;
        break;
      /**********************************************************************/
      case "remove":
        if (value[0] == null) {
          command.message('Syntax: |quickchat| |remove| |tag| - Remove a skill from quickchat identified by its tag.');
        }
        let targetFound = false;
        for (key in data) {
          if (value[0] == (data[key].tag)) {
            try {
              command.message('Deleting ' + data[key].name + ' from quickchat...');
              delete data[key];
              break;
            } catch (e) {console.log("Error deleting skill." , e); }
          }
        }
        break;
      /**********************************************************************/
      case "set":
        if (value[0] == (null)) {
          command.message('Syntax: |quickchat| |set| |tag| \"msg\" - Set quickchat message of a skill to msg - must use quotations around msg.');
          break;
        }
        let setFound = false;
        for (key in data) {
          if (value[0] == (data[key].tag)) {
            data[key].msg = value[1];
            saveData();
            command.message('Message on ' + data[key].name + ' set to: \"' + data[key].msg + '\".');
            setFound = true;
            break;
          }
        }
        if (!setFound) {
          command.message('Skill tag not found. Consult data.json');
          command.message('Syntax: |quickchat| |set| |tag| \"msg\" - Set quickchat message of a skill to msg - must use quotations around msg.');
        }
        break;
      /**********************************************************************/
      case "raid":
        config.sendToRaid = !config.sendToRaid;
        saveConfig();
        command.message('Quickchat messages will be sent to ' + (config.sendToRaid ? 'raid' : 'party') + '.');
        break;
      case "cdNotice":
        config.cdNotice = !config.cdNotice;
        saveConfig();
        command.message('Quickchat cd notice ' + (config.cdNotice ? 'enabled' : 'disabled') + '.');
      /**********************************************************************/
      case "help":
      default:
        command.message('Command list: \n' +
          '|quickchat| |on/off| - enable/disable quickchat module\n' +
          '|quickchat| |flags| |tag| - toggle enable/disable specific quick chat messages\n' +
          '|quickchat| |set| |tag| \"msg\" - set quickchat message of skill to msg - must use quotations around msg\n' +
          '|quickchat| |addmode| - enable add mode, save the next skill you use to be add a quickchat to.\n' +
          '|quickchat| |add| \"skillName\" |tag| \"msg\" - Add skill to quick chat selected from addmode.\n' +
          '|quickchat| |remove| |tag| - Remove quick chat from skill, selected by tag.\n' +
          '|quickchat| |raid| - Toggle quickchat send to party or send to raid channel.\n' +
          '|quickchat| |cdNotice| - Toggle skill cd notices' 

        ); break;


    }

  });

  function sendMessage(msg) {
    if (!config.enabled) return;
    dispatch.toServer('C_CHAT', 1, {
      channel: (config.sendToRaid ? 32 : 1), // 1 = party, 32 = raid
      message: msg
    });
    return;
  }

  function saveConfig() {

    clearTimeout(configTimer);
    configTimer = setTimeout(function() {

      try {
        // TODO: Make the JSON pretty


        fs.writeFileSync(configPath, JSON.stringify(config, null, "\t"));

      } catch (e) { console.error("failed to write config", e); }

    }, 1e4);


  }

  function saveData() {

    clearTimeout(dataTimer);
    dataTimer = setTimeout(function() {

      try {

        fs.writeFileSync(dataPath, JSON.stringify(data, null, "\t"));

      } catch (e) { console.error("failed to write data", e); }

    }, 1e4);

  }

}
