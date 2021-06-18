/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// PaperNet specifc classes
const DigitalMachine = require('./machine.js');
const MachineList = require('./machinelist.js');
const QueryUtils = require('./queries.js');

/**
 * A custom context provides easy access to list of all commercial papers
 */
class DigitalMachineContext extends Context {

    constructor() {
        super();
        // All machines are held in a list of papers
        this.machineList = new MachineList(this);
    }

}

/**
 * Define commercial paper smart contract by extending Fabric Contract class
 *
 */
class DigitalMachineContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.smsnet.digitalmachine');
    }

    /**
     * Define a custom context for commercial paper
    */
    createContext() {
        return new DigitalMachineContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Issue commercial machine
     *
     * @param {Context} ctx the transaction context
     * @param {String} supplier commercial paper issuer
     * @param {String} supplier commercial paper issuer
     * @param {String} machineId paper number for this issuer
     * @param {String} manufacturedDateTime paper issue date
     * @param {String} expiryDateTime paper maturity date
     * @param {Float} faceValue face value of paper
    */
   //machineId,manufactuer,countryOfManufacturing,manufacturedDateTime,lifeSpan,supplier,suppliermspid, expiryDateTime,faceValue
    async ready(ctx, machineId,manufactuer,countryOfManufacturing,manufacturedDateTime,lifeSpan,supplier, expiryDateTime,faceValue) {
        // save the owner's MSP 
        let mspid = ctx.clientIdentity.getMSPID();
        // create an instance of the paper
        let machine = DigitalMachine.createInstance(machineId,manufactuer,countryOfManufacturing,manufacturedDateTime,parseInt(lifeSpan),supplier,mspid, expiryDateTime,parseFloat(faceValue));

        // Smart contract, set to READY
        machine.setReady();       
        machine.setOwnerMSP(mspid);
        // Newly issued machine is owned by the issuer to begin with (recorded for reporting purposes)
        machine.setOwner(supplier);

        // Add the paper to the list of all similar commercial papers in the ledger world state
        await ctx.machineList.addMachine(machine);

        // Must return a serialized paper to caller of smart contract
        return machine;
    }
// Query transactions

    /**
     * Query history of a commercial paper
     * @param {Context} ctx the transaction context
     * @param {String} issuer commercial paper issuer
     * @param {Integer} paperNumber paper number for this issuer
    */
     async queryHistory(ctx, supplier, machineId) {
       return await ctx.machineList.getMachine(DigitalMachine.makeKey([supplier, machineId]));

    }
  
    async activate(ctx, machineId,supplier, newowner,newownerMSP,expiryDateTime) {
        
        // Retrieve the current paper using key fields provided
        let machineKey = DigitalMachine.makeKey([supplier, machineId]);
        let machine = await ctx.machineList.getMachine(machineKey);

        let mspid = ctx.clientIdentity.getMSPID();
        if (machine.getSupplierMSP() !== mspid) {
            throw new Error('\Machine ' + supplier + machineId + ' cannot be activate by ' + mspid + ', as it is not the authorised owning Organisation');
        }
        // Check machine is not already TERMINATED
        if (machine.isTerminated()) {
            throw new Error('\nMachine  ' + supplier + machineId + ' is terminated and warranty can\'t be activated ');
        }      
         // Check machine lifespan is not over
        if (machine.isLifeSpanOver() ) {
            machine.setTerminated();
            throw new Error('\nMachine  ' + supplier + machineId + ' life span is over and warranty can\'t be activated ');
        }
       
        if (machine.isReady() || machine.isDeactivated()) {
            machine.setActivated();
            machine.setOwner(newowner);
            machine.setExpiryDate(expiryDateTime);           
            machine.setOwnerMSP(newownerMSP);
        }       

        // Update the paper
        await ctx.machineList.updateMachine(machine);
        return machine;
    }

    async warrantyExtension(ctx, machineId,supplier, expiryDateTime) {
        
        // Retrieve the current paper using key fields provided
        let machineKey = DigitalMachine.makeKey([supplier, machineId]);
        let machine = await ctx.machineList.getMachine(machineKey);

        let mspid = ctx.clientIdentity.getMSPID();
        if (machine.getSupplierMSP() !== mspid) {
            throw new Error('\Machine ' + supplier + machineId + ' warranty cannot be extended by ' + mspid + ', as it is not the authorised owning Organisation');
        }
        // Check machine is not already TERMINATED
        if (machine.isTerminated()) {
            throw new Error('\nMachine  ' + supplier + machineId + ' is terminated and warranty can\'t be activated ');
        }      
         // Check machine lifespan is not over
        if (machine.isLifeSpanOver() ) {
            machine.setTerminated();
            throw new Error('\nMachine  ' + supplier + machineId + ' life span is over and warranty can\'t be activated ');
        }
        if (machine.isDeactivated()) {
            machine.setActivated();
        }
      
        machine.setExpiryDate(expiryDateTime);         

        // Update the machine
        await ctx.machineList.updateMachine(machine);
        return machine;
    }

   
    async serviceRequest(ctx, machineId,supplier) {
       
        // Retrieve the current paper using key fields provided
        let machineKey = DigitalMachine.makeKey([supplier, machineId]);
        let machine = await ctx.machineList.getMachine(machineKey);

        let mspid = ctx.clientIdentity.getMSPID();
        if (machine.getSupplierMSP() !== mspid || machine.getOwnerMSP() !== mspid) {
            
            throw new Error('\Machine ' + supplier + machineId + ' service request cannot be inititated by ' + mspid + ', as it is not the authorised owning/supplier Organisation');
        }
        // Check machine is not already TERMINATED
        if (machine.isTerminated()) {
            throw new Error('\nMachine  ' + supplier + machineId + ' is terminated and warranty can\'t be activated ');
        }      
         // Check machine lifespan is not over
        if (machine.isLifeSpanOver() ) {
            machine.setTerminated();
            throw new Error('\nMachine  ' + supplier + machineId + ' life span is over and warranty can\'t be activated ');
        }
       
        if (machine.isDeactivated()) {
            throw new Error('\nMachine  ' + supplier + machineId + ' service request cannot be inititated as warranty is over');
        }       
        if (machine.isActivated()) {
            let d1 = new Date(machine.getExpiryDate()); let d2 = new Date(date.now);
            if( d1<d2)
            {
            machine.setDeactivated();
            throw new Error('\nMachine  ' + supplier + machineId + ' service request cannot be inititated as warranty is over');            
            }
        }
      
         // Update the machine
         await ctx.machineList.updateMachine(machine);
         return machine;
    }
   

}

module.exports = DigitalMachineContract;
