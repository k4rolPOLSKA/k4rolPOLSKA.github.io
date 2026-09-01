// 1. DEFINICJE BLOKÓW

// Blok zdarzenia: on join
Blockly.Blocks['mc_on_join'] = {
  init: function() {
    this.appendDummyInput().appendField("Gdy gracz dołącza do serwera");
    this.appendStatementInput("STACK").appendField("wykonaj:");
    this.setColour(120);
  }
};

// Blok zdarzenia: on death
Blockly.Blocks['mc_on_death'] = {
  init: function() {
    this.appendDummyInput().appendField("Gdy gracz ginie");
    this.appendStatementInput("STACK").appendField("wykonaj:");
    this.setColour(120);
  }
};

// Blok akcji: send message
Blockly.Blocks['mc_send_message'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("wyślij wiadomość")
        .appendField(new Blockly.FieldTextInput("Witaj na serwerze!"), "TEXT");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};

// Blok akcji: give item
Blockly.Blocks['mc_give_item'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("daj graczowi")
        .appendField(new Blockly.FieldNumber(1, 1, 64), "AMOUNT")
        .appendField("x")
        .appendField(new Blockly.FieldTextInput("diamond"), "ITEM");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};


// 2. GENERATOR KODU SKRIPT

const SkriptGenerator = new Blockly.Generator('SKRIPT');

SkriptGenerator['mc_on_join'] = function(block) {
  const statements = SkriptGenerator.statementToCode(block, 'STACK');
  return 'on join:\n' + statements;
};

SkriptGenerator['mc_on_death'] = function(block) {
  const statements = SkriptGenerator.statementToCode(block, 'STACK');
  return 'on death:\n' + statements;
};

SkriptGenerator['mc_send_message'] = function(block) {
  const text = block.getFieldValue('TEXT');
  return `\tsend "${text}" to player\n`;
};

SkriptGenerator['mc_give_item'] = function(block) {
  const amount = block.getFieldValue('AMOUNT');
  const item = block.getFieldValue('ITEM');
  return `\tgive ${amount} ${item} to player\n`;
};


// 3. INICJALIZACJA OBSZARU ROBOCZEGO (TOOLBOX)

const workspace = Blockly.inject('blocklyDiv', {
  toolbox: `
    <xml>
      <category name="Zdarzenia" colour="120">
        <block type="mc_on_join"></block>
        <block type="mc_on_death"></block>
      </category>
      <category name="Akcje" colour="160">
        <block type="mc_send_message"></block>
        <block type="mc_give_item"></block>
      </category>
    </xml>
  `
});


// 4. FUNKCJE PRZYCISKÓW

function generateSkript() {
  const code = SkriptGenerator.workspaceToCode(workspace);
  document.getElementById('codeOutput').value = code || "# Przeciągnij bloki, aby wygenerować kod.";
}

function downloadSkript() {
  const code = document.getElementById('codeOutput').value;
  if (!code) {
    alert("Najpierw wygeneruj kod!");
    return;
  }
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'skrypt.sk';
  link.click();
}
