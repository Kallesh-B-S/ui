import { afterNextRender, Component, viewChild } from '@angular/core';
import { AngularMaterialModule } from '../../shared/module/angular-material.module';
import { MatAccordion } from '@angular/material/expansion';
import { BasicDetailsComponent } from '../basic-details/basic-details.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { ActivatedRoute } from '@angular/router';
import { CarnetSequenceComponent } from '../carnet-sequence/carnet-sequence.component';
import { CarnetFeeComponent } from "../carnet-fee/carnet-fee.component";
import { BasicFeeComponent } from "../basic-fee/basic-fee.component";
import { CounterfoilFeeComponent } from "../counterfoil-fee/counterfoil-fee.component";
import { ContinuationSheetFeeComponent } from "../continuation-sheet-fee/continuation-sheet-fee.component";
import { ExpeditedFeeComponent } from "../expedited-fee/expedited-fee.component";
import { SecurityDepositComponent } from "../security-deposit/security-deposit.component";
import { UserPreferences } from '../../core/models/user-preference';
import { UserPreferencesService } from '../../core/services/user-preference.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-service-provider',
  imports: [AngularMaterialModule, BasicDetailsComponent, ContactsComponent, CarnetSequenceComponent, CarnetFeeComponent, BasicFeeComponent, CounterfoilFeeComponent, ContinuationSheetFeeComponent, ExpeditedFeeComponent, SecurityDepositComponent, CommonModule],
  templateUrl: './edit-service-provider.component.html',
  styleUrl: './edit-service-provider.component.scss'
})
export class EditServiceProviderComponent {
  accordion = viewChild.required(MatAccordion);
  isEditMode = true;
  spid = 0;
  serviceProviderName: string | null = null;
  userPreferences: UserPreferences;

  constructor(private route: ActivatedRoute, private userPrefenceService: UserPreferencesService) {
    this.userPreferences = userPrefenceService.getPreferences();
    afterNextRender(() => {
      // Open all panels
      this.accordion().openAll();
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.spid = idParam ? parseInt(idParam, 10) : 0;
  }

  onServiceProviderNameUpdate(event: string): void {
    this.serviceProviderName = event;
  }
}
