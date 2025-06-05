import { Component } from '@angular/core';
import { AngularMaterialModule } from '../../module/angular-material.module';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [AngularMaterialModule, RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
}