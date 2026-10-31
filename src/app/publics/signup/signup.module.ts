import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from '../../commons/services/authentication.service';
import { HinttextModule } from '../../commons/components/hinttext';


@NgModule({
  declarations: [
    SignupComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: SignupComponent,
      },
    ]),
    FormsModule,
    ReactiveFormsModule,
    HinttextModule,
  ],
  providers: [
    AuthenticationService,
  ],
})
export class SignupModule { }

