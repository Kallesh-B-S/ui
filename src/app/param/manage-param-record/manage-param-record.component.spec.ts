import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageParamRecordComponent } from './manage-param-record.component';

describe('ManageParamRecordComponent', () => {
  let component: ManageParamRecordComponent;
  let fixture: ComponentFixture<ManageParamRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageParamRecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageParamRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
