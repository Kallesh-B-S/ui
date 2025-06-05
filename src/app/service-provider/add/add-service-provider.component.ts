import { Component } from '@angular/core';
import { BasicDetailsComponent } from '../basic-details/basic-details.component';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AngularMaterialModule } from '../../shared/module/angular-material.module';
import { CommonModule } from '@angular/common';
import { ContactsComponent } from '../contacts/contacts.component';
import { CarnetSequenceComponent } from '../carnet-sequence/carnet-sequence.component';
import { CarnetFeeComponent } from '../carnet-fee/carnet-fee.component';
import { BasicFeeComponent } from '../basic-fee/basic-fee.component';
import { CounterfoilFeeComponent } from '../counterfoil-fee/counterfoil-fee.component';
import { ExpeditedFeeComponent } from '../expedited-fee/expedited-fee.component';
import { SecurityDepositComponent } from '../security-deposit/security-deposit.component';
import { ContinuationSheetFeeComponent } from "../continuation-sheet-fee/continuation-sheet-fee.component";
import { UserPreferencesService } from '../../core/services/user-preference.service';
import { UserPreferences } from '../../core/models/user-preference';

@Component({
  selector: 'app-add-service-provider',
  imports: [BasicDetailsComponent, AngularMaterialModule, CommonModule, ContactsComponent, CarnetSequenceComponent,
    CarnetFeeComponent, BasicFeeComponent, CounterfoilFeeComponent, ExpeditedFeeComponent, SecurityDepositComponent, ContinuationSheetFeeComponent],
  templateUrl: './add-service-provider.component.html',
  styleUrl: './add-service-provider.component.scss'
})
export class AddServiceProviderComponent {
  isEditMode = false;
  serviceProviderId: number | null = null;
  currentStep: number = 0;
  isLoading: boolean = false;
  userPreferences: UserPreferences;

  basicDetailsCompleted: boolean = false;
  contactsCompleted: boolean = false;
  carnetSequenceCompleted: boolean = false;
  feeCommissionCompleted: boolean = false;
  basicFeeCompleted: boolean = false;
  counterfoilFeeCompleted: boolean = false;
  continuationSheetFeeCompleted: boolean = false;
  expeditedFeeCompleted: boolean = false;
  securityDepositCompleted: boolean = false;

  constructor(userPrefenceService: UserPreferencesService) {
    this.userPreferences = userPrefenceService.getPreferences();
  }

  onBasicDetailsSaved(event: string): void {
    this.serviceProviderId = +event;
    this.basicDetailsCompleted = true;
  }

  onContactsSaved(event: boolean): void {
    this.contactsCompleted = event;
  }

  onCarnetSequenceSaved(event: boolean): void {
    this.carnetSequenceCompleted = event;
  }

  onFeeCommissionSaved(event: boolean): void {
    this.feeCommissionCompleted = event;
  }

  onBasicFeeSaved(event: boolean): void {
    this.basicFeeCompleted = event;
  }

  onCounterfoilFeeSaved(event: boolean): void {
    this.counterfoilFeeCompleted = event;
  }

  onContinuationSheetFeeSaved(event: boolean): void {
    this.continuationSheetFeeCompleted = event;
  }

  onExpeditedFeeSaved(event: boolean): void {
    this.expeditedFeeCompleted = event;
  }

  onSecurityDepositSaved(event: boolean): void {
    this.securityDepositCompleted = event;
  }

  onStepChange(event: StepperSelectionEvent): void {
    this.currentStep = event.selectedIndex;
  }
}
