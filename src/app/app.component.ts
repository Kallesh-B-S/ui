import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SecuredHeaderComponent } from './common/secured-header/secured-header.component';
import { UserService } from './core/services/user.service';
import { FooterComponent } from './common/footer/footer.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SecuredHeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'carnet-portal-app';
  isUserLoggedIn = false;
  private userSubscription!: Subscription;

  constructor(private userService: UserService
  ) { }

  ngOnInit(): void {

    this.isUserLoggedIn = this.userService.isLoggedIn();

    this.userSubscription = this.userService
      .watchUser()
      .subscribe(userLoggedIn => {
        this.isUserLoggedIn = userLoggedIn
      });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
