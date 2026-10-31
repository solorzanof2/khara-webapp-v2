import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, LoginForm } from '../../commons/services/authentication.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../commons/services/notification.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent implements OnInit {

  readonly SignupLink = '/signup';

  form: FormGroup;

  usernameControl: FormControl = new FormControl('', Validators.required);
  passwordControl: FormControl = new FormControl('', Validators.required);

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
  ) {
    this.form = new FormGroup({
      username: this.usernameControl,
      password: this.passwordControl,
    });
  }

  ngOnInit(): void { }

  submitEventHandler(form: LoginForm): void {
    (async () => {
      if (!form.username || !form.password) {
        return;
      }

      await this.sendData(form.username, form.password);
    })();
  }

  async sendData(username: string, password: string): Promise<void> {
    try {
      const response = await this.authenticationService.doLogin(username, password);

      console.log({response});

      this.router.navigate([
        'webapp',
      ]);
    }
    catch (error: any) {
      console.error(`[ERR0] ${error.message}`);
      this.notificationService.showError(error.message);
    }
    finally {
      return Promise.resolve();
    }
  }

}

