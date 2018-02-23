const Command = require('command');
const [fs, path] = [require("fs"), require("path")];
const dataPath = path.join(__dirname, "data.json");
const configPath = path.join(__dirname, "config.json");

module.exports = function quickchat(dispatch) {

  const command = Command(dispatch);
  lastSkillUsed = null,
  // Set up data structures
  config = null,
  data = null;

  try {

    data = require('./data.json');
    config = require('./config.json');

  } catch (e) { console.log(e); }

  // Skill Hook
  dispatch.hook('C_START_SKILL', 1, (event) => {
    if (!config.enabled) return;
    if (event.skill in data) {
      lastSkillUsed = event.skill;
      sendMessage(data[event.skill].msg);
    }
  });
  // Cooltime hook
  dispatch.hook('S_START_COOLTIME_SKILL', 1, (event) => {

    if (!config.enabled) return;
    skill = event.skill, cooldown = event.cooldown;
    if (skill in data) {
      if (event.skill == lastSkillUsed) sendCDmsg(skill, cooldown);
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
      setTimeout(function() { sendMessage(msg1); }, timer1);
      setTimeout(function() { sendMessage(msg2); }, timer2);
      setTimeout(function() { sendMessage(msg3); }, timer3);
    } else if (cd >= 10000) {
      timer2 = cd - 10000;
      timer3 = cd - 5000;
      setTimeout(function() { sendMessage(msg2); }, timer2);
      setTimeout(function() { sendMessage(msg3); }, timer3);
    } else if (cd >= 5000) {
      timer3 = cd - 5000;
      setTimeout(function() { sendMessage(msg3); }, timer3);
    }

  }

  // Chat Hook
  command.add('quickchat', (setting, value, arg) => {

    switch (setting) {

      case "on":
        enabled = true;
        command.message('Quickchat ' + (enabled ? 'enabled' : 'disabled') + '.');
        break;
      case "off":
        enabled = false;
        command.message('Quickchat ' + (enabled ? 'enabled' : 'disabled') + '.');
        break;
      case "flags": // TODO: REBUILD CHAT HOOK
        if (value.equals(null)) {
          command.message('Syntax: |quickchat| |flags| |tag| - Toggle quickchat messages for individual skills.');
          break;
        }
        let flagFound = false;
        for (key in data) {
          if (value.equals(data[key][tag])) {
            data[key][flag] = !data[key][flag];
            command.message('Quickchat on ' + data[key][name] + (data[key][flag] ? 'enabled' : 'disabled') + '.');
            found = true;
            break;
          }
        }
        if (!flagFound) {
          command.message('Skill tag not found. Consult data.json');
          command.message('Syntax: |quickchat| |flags| |tag| - Toggle quickchat messages for individual skills.');
        }
        break;
      case "set":
        if (value.equals(null)) {
          command.message('Syntax: |quickchat| |set| |tag| \"msg\" - Set quickchat message of a skill to msg - must use quotations around msg.');
          break;
        }
        let setFound = false;
        for (key in data) {
          if (value.equals(data[key][tag])) {
            data[key][msg] = arg;
            command.message('Message on ' + data[key][name] + ' set to: \"' + data[key][msg] + '\".');
            found = true;
            break;
          }
        }
        if (!setFound) {
          command.message('Skill tag not found. Consult data.json');
          command.message('Syntax: |quickchat| |set| |tag| \"msg\" - Set quickchat message of a skill to msg - must use quotations around msg.');
        }
        break;
      case "help":
      default:
        command.message('Command list: \n' +
          '|on/off| - enable/disable quickchat module\n' +
          '|flags| |tag| - toggle enable/disable specific quick chat messages\n' +
          '|set| |tag| \"msg\" - set quickchat message of skill to msg - must use quotations around msg'
        ); break;


    }

  });

  function sendMessage(msg) {
    if (!enabled) return;
    ch = (config.sendToRaid ? 32 : 1);
    dispatch.toServer('C_CHAT', 1, {
      channel: 1, // 1 = party, 32 = raid
      message: msg
    });
    return;
  }

  function saveConfig() {

    try {

      fs.writeFileSync(configPath, JSON.stringify(config));

    } catch (e) { console.error("failed to write config", e); }

  }

  function saveData() {

    try {

      fs.writeFileSync(dataPath, JSON.stringify(data));

    } catch (e) {
      console.error("failed to write data", e);
    }
  }

}
