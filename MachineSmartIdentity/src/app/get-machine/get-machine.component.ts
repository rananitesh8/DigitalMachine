import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-get-machine',
  templateUrl: './get-machine.component.html',
  styleUrls: ['./get-machine.component.css']
})
export class GetMachineComponent implements OnInit {

  constructor(private http:HttpClient) { }

  ngOnInit(): void {
  }
  @Input() machineId: string = "";
  validationMessage="";
  machineInformation="";
  getmachineDetails(): void {   
    if(this.machineId=="")
    {
      this.validationMessage="Machine id is required";
    return;
    }
    this.http.get('http://localhost:8080/api/query/'+ this.machineId).subscribe(data=>this.machineInformation=JSON.stringify(data));
  
};

}
