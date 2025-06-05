import { Component, OnInit } from '@angular/core';
import { UserPreferencesService } from '../core/services/user-preference.service';
import { UserPreferences } from '../core/models/user-preference';
import { AngularMaterialModule } from '../shared/module/angular-material.module';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../core/services/notification.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-settings',
  imports: [AngularMaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss'
})
export class UserSettingsComponent implements OnInit {
  pageSizeOptions = [5, 10, 25, 50];
  
  userPreferences: UserPreferences = {};
  userPreferencesForm: FormGroup;
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private preferencesService: UserPreferencesService,
    private notificationService: NotificationService
  ) {
    this.userPreferencesForm = this.fb.group({
      pageSize: ['']
    });
    this.loadSettings();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    const userPreferences = this.preferencesService.getPreferences();

    this.userPreferencesForm.patchValue({
      pageSize: userPreferences.pageSize
    });

    this.isLoading = false;
  }

  saveSettings(): void {
    if (this.userPreferencesForm.invalid) {
      this.userPreferencesForm.markAllAsTouched();
      return;
    }

    const userPreferences: UserPreferences = this.userPreferencesForm.value;
    this.preferencesService.savePreferences(userPreferences);
    this.notificationService.showSuccess('Preferences saved successfully');
  }

  resetToDefaults(): void {
    this.preferencesService.resetToDefaults();
    this.loadSettings();
    this.notificationService.showSuccess('Preferences reset to defaults');
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.userPreferencesForm.controls;
  }
}
