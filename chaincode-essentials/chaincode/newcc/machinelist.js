/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('./statelist.js');

const DigitalMachine = require('./machine.js');

class MachineList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.sms.machine');
        this.use(DigitalMachine);
    }

    async addMachine(machine) {
        return this.addState(machine);
    }

    async getMachine(machineKey) {
        return this.getState(machineKey);
    }

    async updateMachine(machinekey) {
        return this.updateState(machinekey);
    }
}


module.exports = MachineList;
