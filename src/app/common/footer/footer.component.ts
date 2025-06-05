import { Component } from '@angular/core';
import { AngularMaterialModule } from '../../shared/module/angular-material.module';

@Component({
  selector: 'app-footer',
  imports: [AngularMaterialModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}