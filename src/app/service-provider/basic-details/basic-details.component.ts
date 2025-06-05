import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BasicDetail } from '../../core/models/service-provider/basic-detail';
import { Country } from '../../core/models/country';
import { Region } from '../../core/models/region';
import { State } from '../../core/models/state';
import { CommonService } from '../../core/services/common.service';
import { AngularMaterialModule } from '../../shared/module/angular-material.module';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { ZipCodeValidator } from '../../shared/validators/zipcode-validator';
import { BasicDetailService } from '../../core/services/basic-detail.service';
import { ApiErrorHandlerService } from '../../core/services/api-error-handler.service';
import { BondSurety } from '../../core/models/bond-surety';
import { CargoSurety } from '../../core/models/cargo-surety';
import { CargoPolicy } from '../../core/models/cargo-policy';

@Component({
  selector: 'app-basic-details',
  imports: [AngularMaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './basic-details.component.html',
  styleUrls: ['./basic-details.component.scss']
})
export class BasicDetailsComponent implements OnInit, OnDestroy {
  @Input() isEditMode = false;
  @Input() spid: number = 0;
  @Output() spidCreated = new EventEmitter<string>();
  @Output() serviceProviderName = new EventEmitter<string>();

  basicDetailsForm: FormGroup;
  countries: Country[] = [];
  regions: Region[] = [];
  states: State[] = [];
  bondSuretys: BondSurety[] = [];
  cargoSuretys: CargoSurety[] = [];
  cargoPolicies: CargoPolicy[] = [];

  isLoading = true;
  countriesHasStates = ['US', 'CA', 'MX'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private basicDetailService: BasicDetailService,
    private notificationService: NotificationService,
    private errorHandler: ApiErrorHandlerService
  ) {
    this.basicDetailsForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadLookupData();
    // this.spidCreated.emit(this.spid?.toString());
    // Patch edit form data
    if (this.spid > 0) {
      this.basicDetailService.getBasicDetailsById(this.spid).subscribe({
        next: (basicDetail: BasicDetail) => {
          if (basicDetail?.spid > 0) {
            this.patchFormData(basicDetail);
            this.serviceProviderName.emit(basicDetail.companyName);
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          let errorMessage = this.errorHandler.handleApiError(error, 'Failed to load basic details');
          this.notificationService.showError(errorMessage);
          this.isLoading = false;
          console.error('Error loading basic details:', error);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm(): FormGroup {
    return this.fb.group({
      companyName: ['', [Validators.required, Validators.maxLength(100)]],
      lookupCode: ['', [Validators.maxLength(20)]],
      address1: ['', [Validators.required, Validators.maxLength(100)]],
      address2: ['', [Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      country: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', [Validators.required, ZipCodeValidator('country')]],
      issuingRegion: ['', Validators.required],
      replacementRegion: ['', Validators.required],
      cargoSurety: ['', Validators.required],
      cargoPolicyNo: ['', Validators.required],
      bondSurety: ['', Validators.required]
    });
  }

  loadLookupData(): void {
    this.commonService.getCountries(this.spid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (countries) => {
          this.countries = countries;
        },
        error: (error) => {
          console.error('Failed to load countries', error);
          this.isLoading = false;
        }
      });

    this.loadRegions();
    this.loadCargoSuretys();
    this.loadCargoPolicies();
    this.loadBondSuretys();
  }

  loadRegions(): void {
    this.commonService.getRegions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (regions) => {
          this.regions = regions;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load regions', error);
          this.isLoading = false;
        }
      });
  }

  loadStates(country: string): void {
    this.isLoading = true;
    country = this.countriesHasStates.includes(country) ? country : 'FN';
    this.commonService.getStates(country, this.spid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (states) => {
          this.states = states;
          const stateControl = this.basicDetailsForm.get('state');
          if (this.countriesHasStates.includes(country)) {
            stateControl?.enable();
          } else {
            stateControl?.disable();
            stateControl?.setValue('FN');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load states', error);
          this.isLoading = false;
        }
      });
  }

  loadBondSuretys(): void {
    this.commonService.getBondSuretys()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bondSuretys) => {
          this.bondSuretys = bondSuretys;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load bond suretys', error);
          this.isLoading = false;
        }
      });
  }

  loadCargoSuretys(): void {
    this.commonService.getCargoSuretys()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cargoSuretys) => {
          this.cargoSuretys = cargoSuretys;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load cargo suretys', error);
          this.isLoading = false;
        }
      });
  }

  loadCargoPolicies(): void {
    this.commonService.getCargoPolicies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cargoPolicies) => {
          this.cargoPolicies = cargoPolicies;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load cargo policies', error);
          this.isLoading = false;
        }
      });
  }

  patchFormData(data: BasicDetail): void {
    this.basicDetailsForm.patchValue({
      companyName: data.companyName,
      lookupCode: data.lookupCode,
      address1: data.address1,
      address2: data.address2,
      city: data.city,
      country: data.country,
      state: data.state,
      zip: data.zip,
      issuingRegion: data.issuingRegion,
      replacementRegion: data.replacementRegion,
      cargoSurety: data.cargoSurety,
      cargoPolicyNo: data.cargoPolicyNo,
      bondSurety: data.bondSurety
    });

    if (data.country) {
      this.loadStates(data.country);
    }

    if (this.isEditMode) {
      this.basicDetailsForm.get('issuingRegion')?.disable();
      this.basicDetailsForm.get('replacementRegion')?.disable();
      this.basicDetailsForm.get('companyName')?.disable();
      this.basicDetailsForm.get('cargoSurety')?.disable();
      this.basicDetailsForm.get('bondSurety')?.disable();
    }
  }

  onCountryChange(country: string): void {
    this.basicDetailsForm.get('state')?.reset();

    if (country) {
      this.loadStates(country);
    }

    this.basicDetailsForm.get('zip')?.updateValueAndValidity();
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.basicDetailsForm.controls;
  }

  saveBasicDetails(): void {
    if (this.basicDetailsForm.invalid) {
      this.basicDetailsForm.markAllAsTouched();
      return;
    }

    const basicDetailData: BasicDetail = this.basicDetailsForm.value;

    // states
    basicDetailData.state = this.basicDetailsForm.get('state')?.value;

    // non editable fields values
    if (this.isEditMode) {
      basicDetailData.issuingRegion = this.basicDetailsForm.get('issuingRegion')?.value;
      basicDetailData.replacementRegion = this.basicDetailsForm.get('replacementRegion')?.value;
      basicDetailData.companyName = this.basicDetailsForm.get('companyName')?.value;
      basicDetailData.cargoSurety = this.basicDetailsForm.get('cargoSurety')?.value;
      basicDetailData.bondSurety = this.basicDetailsForm.get('bondSurety')?.value;
    }

    const saveObservable = this.isEditMode && this.spid > 0
      ? this.basicDetailService.updateBasicDetails(this.spid, basicDetailData)
      : this.basicDetailService.createBasicDetails(basicDetailData);

    saveObservable.subscribe({
      next: (basicData: any) => {
        this.notificationService.showSuccess(`Basic details ${this.isEditMode ? 'updated' : 'added'} successfully`);

        if (!this.isEditMode) {
          this.spidCreated.emit(basicData.SPID);
        }
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, `Failed to ${this.isEditMode ? 'update' : 'add'} basic details`);
        this.notificationService.showError(errorMessage);
        console.error('Error saving contact:', error);
      }
    });
  }
}