import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetMachineComponent } from './get-machine.component';

describe('GetMachineComponent', () => {
  let component: GetMachineComponent;
  let fixture: ComponentFixture<GetMachineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetMachineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GetMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
