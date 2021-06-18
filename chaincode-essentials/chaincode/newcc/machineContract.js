'use strict';
const { Contract} = require('fabric-contract-api');
// Enumerate commercial MACHINE state values
class machineContract extends Contract {



   async queryMachine(ctx,machineId) {
   
    let machineInfoAsBytes = await ctx.stub.getState(machineId); 
    if (!machineInfoAsBytes || machineInfoAsBytes.toString().length <= 0) {
      throw new Error('Machine with this Id does not exist: ');
       }
      let machine=JSON.parse(machineInfoAsBytes.toString());
      
      return JSON.stringify(machine);
     }

   async addNewMachine(ctx,machineId,state,dateOfManufacturing,manufacturer, owner, currentPrice) {
   
    let machineInfo={
       state:state,
       dateOfManufacturing:dateOfManufacturing,
       manufacturer:manufacturer,
       owner:owner,
       currentPrice:currentPrice
       };

    await ctx.stub.putState(machineId,Buffer.from(JSON.stringify(machineInfo))); 
    
    console.log('New machine added To the ledger Succesfully..');
    
  }
  async updateMachine(ctx,machineId,state,owner,currentPrice) {
    let machineInfoAsBytes = await ctx.stub.getState(machineId); 
    if (!machineInfoAsBytes || machineInfoAsBytes.toString().length <= 0) {
      throw new Error('Machine with this Id does not exist: ');
       }
    let machineInfo=JSON.parse(machineInfoAsBytes.toString()); 
   
    machineInfo.state=state;      
    machineInfo.owner=owner;
    machineInfo.currentPrice=currentPrice;

    await ctx.stub.putState(machineId,Buffer.from(JSON.stringify(machineInfo))); 
    
    console.log('Machine '+ machineId +' updated in the ledger Succesfully..');
    
  }
   async deleteMachine(ctx,machineId) {
   

    await ctx.stub.deleteState(machineId); 
    
    console.log('Machine information deleted from the ledger Succesfully..');
    
    }
}

module.exports=machineContract;
