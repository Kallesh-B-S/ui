import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/common/user.service';
import { AngularMaterialModule } from '../../shared/module/angular-material.module';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/common/auth.service';
import { NavigationService } from '../../core/services/common/navigation.service';

@Component({
  selector: 'app-secured-header',
  imports: [AngularMaterialModule, CommonModule],
  templateUrl: './secured-header.component.html',
  styleUrl: './secured-header.component.scss'
})
export class SecuredHeaderComponent implements OnInit {
  userEmail: string = '';
  showProfileMenu: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private navigationService: NavigationService
  ) { }

  ngOnInit(): void {
    this.userEmail = this.userService.getSafeUser();
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout(): void {
    this.authService.logout();
    this.showProfileMenu = false;
  }

  navigateTo(route: string): void {
    this.navigationService.navigate([route]);
    this.showProfileMenu = false;
  }
}