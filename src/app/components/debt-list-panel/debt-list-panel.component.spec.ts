import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtListPanelComponent } from './debt-list-panel.component';

describe('DebtListPanelComponent', () => {
  let component: DebtListPanelComponent;
  let fixture: ComponentFixture<DebtListPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtListPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtListPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
