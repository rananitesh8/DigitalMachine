 /*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('./state.js');

// Enumerate commercial MACHINE state values
const cpState = {
    READY: 1,
    ACTIVATED: 2,
    DEACTIVATED: 3,
    TERMINATED: 4
};

/**
 * DIGITALMACHINE class extends State class
 * Class will be used by application and smart contract to define a paper
 */
class DigitalMachine extends State {

    constructor(obj) {
        super(DigitalMachine.getClass(), [ obj.supplier,obj.machineId]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
    */  
    getSupplier() {
        return this.supplier;
    }    
    getSupplierMSP() {
        return this.suppliermspid;
    }
    setOwner(newOwner) {
        this.owner = newOwner;
    }
    getOwner() {
        return this.owner;
    }
    setOwnerMSP(mspid) {
        this.mspid = mspid;
    }
    getOwnerMSP() {
        return this.mspid;
    }    
    setExpiryDate(expiryDateTime) {
        this.expiryDateTime = expiryDateTime;
    }
    getExpiryDate() {
        return this.expiryDateTime;
    }
    /**
     * Useful methods to encapsulate commercial machine states
     */
    setReady() {
        this.currentState = cpState.READY;
    }

    setActivated() {
        this.currentState = cpState.ACTIVATED;
    }

    setDeactivated() {
        this.currentState = cpState.DEACTIVATED;
    }

    setTerminated() {
        this.currentState = cpState.TERMINATED;
    }

    isReady() {
        return this.currentState === cpState.READY;
    }

    isActivated() {
        return this.currentState === cpState.ACTIVATED;
    }

    isDeactivated() {
        return this.currentState === cpState.DEACTIVATED;
    }

    isTerminated() {
        return this.currentState === cpState.TERMINATED;
    }
    isLifeSpanOver()
    {
        let date1 = new Date(this.manufacturedDateTime);
        let date2 = new Date();
        let yearsDiff =  date2.getFullYear() - date1.getFullYear();    

        if(yearsDiff<this.lifeSpan)
            return false;
        else
            return true;
    }
    static fromBuffer(buffer) {
        return DigitalMachine.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to commercial paper
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, DigitalMachine);
    }

    /**
     * Factory method to create a DigitalMachine object
     */
    static createInstance(machineId,manufactuer,countryOfManufacturing,manufacturedDateTime,lifeSpan,supplier,suppliermspid, expiryDateTime,faceValue) {
        return new DigitalMachine( {machineId,manufactuer,countryOfManufacturing,manufacturedDateTime,lifeSpan,supplier,suppliermspid, expiryDateTime,faceValue} );
    }

    static getClass() {
        return 'org.smsnet.digitalmachine';
    }
}

module.exports = DigitalMachine;
