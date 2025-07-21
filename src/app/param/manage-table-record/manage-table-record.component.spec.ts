import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTableRecordComponent } from './manage-table-record.component';

describe('ManageTableRecordComponent', () => {
  let component: ManageTableRecordComponent;
  let fixture: ComponentFixture<ManageTableRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageTableRecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageTableRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
