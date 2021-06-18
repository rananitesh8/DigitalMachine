import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Machine } from './machine';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-new-machine',
  templateUrl: './new-machine.component.html',
  styleUrls: ['./new-machine.component.css']
})
export class NewMachineComponent implements OnInit {

  constructor(private http:HttpClient) { }

  ngOnInit(): void {
  }
  /* machine: Machine ;
  @Input() machine.machineId; */
  machine = new Machine();
  validationMessage="";
  machineInformation="";
  saveMachineDetails(): void  {   
   alert('h1');
    /* if(this.machine.machineId=="")
    {
      this.validationMessage="Machine id is required";
    return;
    } */
    alert('h2');
    const headers = { 'content-type': 'application/json'}  
    const body=JSON.stringify(this.machine);
    console.log(body)
    this.http.post('http://localhost:8080/api/addmachine', body,{'headers':headers}).subscribe(data => {
      console.log(data)  

    }) ;
  
};

}
